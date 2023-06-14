import { randomUUID } from 'crypto';
import 'dotenv/config';

import { connectDB } from './db';
import { InMemorySessionStore, SessionStore } from './sessionStore';
import { httpServer, io } from './io';

connectDB();
const sessionStore: SessionStore = new InMemorySessionStore();

const { PORT } = <{ [key: string]: string }>process.env;

io.use(async (socket, next) => {
	const { token, sessionID } = socket.handshake.auth;

	if (!token) return next(new Error('authentication error'));

	const isValid = await fetch('http://localhost:5001/v1/auth/validate', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'auth-token': token,
		},
	});

	if (!isValid.ok) return next(new Error('authentication error'));

	if (sessionID) {
		const session = sessionStore.findSession(sessionID);
		if (session) {
			socket.data.sessionID = sessionID;
			socket.data.user = session.user;
			return next();
		}
	}

	const user = await isValid.json();
	socket.data.user = user.data;
	socket.data.sessionID = randomUUID();

	return next();
});

interface Message {
	content: string;
	fromSelf: boolean;
}

interface User {
	userID: string;
	messages: Message[];
	hasNewMessages: boolean;
	socketID: string;
}

io.on('connection', (socket) => {
	const users: User[] = [];

	for (let [id, socket] of io.of('/').sockets) {
		users.push({
			socketID: socket.id,
			userID: socket.data.user?.id as string,
			messages: Array<Message>(),
			hasNewMessages: false,
		} as User);
	}

	console.log('Emitted users ', users);
	socket.emit('users', users);

	const user_connected = {
		socketID: socket.id,
		userID: socket.data.user?.id as string,
		messages: Array<Message>(),
		hasNewMessages: false,
	} as User;

	console.log('Emitted user connected ', user_connected);
	socket.broadcast.emit('user_connected', user_connected);

	const session = {
		sessionID: socket.data.sessionID,
		userID: socket.data.user?.id,
		socketID: socket.id,
	};

	console.log('Emitted session ', session);
	socket.emit('session', session);

	console.log('Joined room ', socket.data.user?.id);
	socket.join(socket.data.user?.id as string);

	socket.on('private_message', ({ content, to }) => {
		console.log('private_message', {
			content,
			to,
			userID: socket.data.user?.id,
		});
		socket
			.to(to)
			.to(socket.data.user?.id as string)
			.emit('private_message', {
				content,
				from: socket.data.user?.id,
				to,
			});
	});

	socket.on('disconnect', async () => {
		const matchingSockets = await io
			.in(socket.data.user?.id as string)
			.fetchSockets();
		const isDisconnected = matchingSockets.length === 0;
		console.log('isDisconnected', isDisconnected);

		if (isDisconnected) {
			socket.broadcast.emit('user_disconnected', socket.data.user?.id);
			sessionStore.saveSession(socket.data.sessionID as string, {
				userID: socket.data.user?.id,
				user: socket.data.user,
				connected: false,
			});
		}
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
