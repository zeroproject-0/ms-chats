import 'dotenv/config';

import http from 'http';
import { Server } from 'socket.io';

const { PORT } = <{ [key: string]: string }>process.env;

interface User {
	id: string;
	name: string;
	nickname: string;
	email: string;
	avatar: string;
}

interface SocketData {
	token: string;
	user: User;
}

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
	foo: (x: string) => void;
}

interface ClientToServerEvents {
	users: (users: { id: string; user: string }[]) => void;
	user_connected: (users: { id: string; user: string }) => void;
	foo: (x: any) => void;
}

interface InterServerEvents {
	ping: () => void;
	disconnect: (socket: any) => void;
}

const httpServer = http.createServer();
const io = new Server<
	ServerToClientEvents,
	ClientToServerEvents,
	InterServerEvents,
	SocketData
>(httpServer, {
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
});

io.use(async (socket, next) => {
	const token: string = socket.handshake.auth.token;

	if (!token) return next(new Error('authentication error'));

	const isValid = await fetch('http://localhost:5001/v1/auth/validate', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'auth-token': token,
		},
	});

	if (!isValid.ok) return next(new Error('authentication error'));

	const user = await isValid.json();
	socket.data.token = token;
	socket.data.user = user.data;

	return next();
});

io.on('connection', (socket) => {
	const users: { id: string; user: string }[] = [];

	for (let [id, socket] of io.of('/').sockets) {
		users.push({
			id,
			user: `${socket.data.user?.id as string}-${socket.data.user?.name}`,
		});
	}

	socket.emit('users', users);

	socket.broadcast.emit('user_connected', {
		id: socket.id,
		user: `${socket.data.user?.id as string}-${socket.data.user?.name}`,
	});

	socket.on('foo', (x) => {
		console.log(x);
		socket.emit('foo', x);
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
