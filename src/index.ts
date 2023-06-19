import { randomUUID } from 'crypto';
import 'dotenv/config';

import { connectDB } from './db';
import { InMemorySessionStore, SessionStore } from './sessionStore';
import { User, httpServer, io } from './io';
import { Message } from './models/Message';
import { Group } from './models/Group';
import { User as UserDB } from './models/User';
import { Schema } from 'mongoose';

connectDB();
const sessionStore: SessionStore = new InMemorySessionStore();

const { PORT } = <{ [key: string]: string }>process.env;

io.use(async (socket, next) => {
	const { token, sessionID } = socket.handshake.auth;

	if (!token) return next(new Error('authentication error'));

	const isValid = await fetch(
		`${process.env.USER_SERVICE_URI}/v1/auth/validate`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'auth-token': token,
			},
		}
	);

	if (!isValid.ok) return next(new Error('authentication error'));

	if (sessionID) {
		const session = sessionStore.findSession(sessionID);
		if (session) {
			socket.data.sessionID = sessionID;
			socket.data.userID = session.userID;
			return next();
		}
	}

	const user = await isValid.json();
	socket.data.userID = user.data._id;
	socket.data.sessionID = randomUUID();

	return next();
});

UserDB.find().then((users) => {});

io.on('connection', (socket) => {
	Group.find()
		.populate('members.user')
		.populate('messages')
		.exec()
		.then((groups) => {
			const filteredArray = groups.filter((group) => {
				return group.members.some((member) => {
					return (
						(member.user as unknown as User)._id.toString() ===
						socket.data.userID
					);
				});
			});
			socket.join(filteredArray.map((group) => group._id.toString()));
			socket.emit('chats', filteredArray);
		})
		.catch((error) => {
			console.log('error', { error });
		});

	const session = {
		sessionID: socket.data.sessionID,
		userID: socket.data.userID,
		socketID: socket.id,
	};

	socket.emit('session', session);

	socket.join(socket.data.userID!);

	socket.on('create_chat', async ({ usersIds, isPrivate }) => {
		// //TODO: Send errors to user
		if (usersIds.length < 1) return;

		if (isPrivate) {
			const users = usersIds.map((user: string) => ({ user, isAdmin: false }));
			users.push({ user: socket.data.userID!, isAdmin: true });

			const group = await Group.create({
				name: `${users[0].user}`,
				isPrivate: true,
				members: users,
				description: `${users[1].user}`,
				messages: [],
			});

			const createdGroup = await group.save();

			await (await createdGroup.populate('members.user')).populate('messages');

			socket.emit('chat_created', createdGroup);
			socket.to(usersIds[0]).emit('chat_created', createdGroup);
		}
	});

	socket.on('join_chat', async (chatId) => {
		await socket.join(chatId);

		socket.emit('chat_joined', chatId);
	});

	socket.on('private_message', async (message) => {
		try {
			const newMessage = await Message.create({
				from: message.from,
				to: message.to,
				content: message.content,
			});

			const createdMessage = await newMessage.save();

			const group = await Group.findOne({ _id: message.to }).exec();
			group?.messages.push(
				createdMessage._id as unknown as Schema.Types.ObjectId
			);

			await group?.save();

			socket.emit('private_message', createdMessage);
			socket.to(message.to).emit('private_message', createdMessage);
		} catch (error) {
			console.log('error', error);
		}
	});

	socket.on('disconnect', async () => {
		const matchingSockets = await io.in(socket.data.userID!).fetchSockets();
		const isDisconnected = matchingSockets.length === 0;

		// if (isDisconnected) {
		// 	socket.broadcast.emit('user_disconnected', socket.data.user?.id);
		// 	sessionStore.saveSession(socket.data.sessionID as string, {
		// 		userID: socket.data.userID!,
		// 		connected: false,
		// 	});
		// }
	});

	socket.onAny((event, ...args) => {
		console.log(event, args);
	});
});

io.on('disconnect', (socket) => {
	console.log('disconnected');
});

httpServer.listen(Number(PORT), () => {
	console.log(`Server is listening on port ${PORT}`);
});
