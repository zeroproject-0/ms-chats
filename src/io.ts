import http from 'http';
import { Server } from 'socket.io';

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
	sessionID: string;
}

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
	foo: (x: string) => void;
	private_message: (x: any) => void;
}

interface ClientToServerEvents {
	users: (users: any) => void;
	user_connected: (users: any) => void;
	session: (x: any) => void;
	private_message: (x: any) => void;
	user_disconnected: (x: any) => void;
	foo: (x: any) => void;
}

interface InterServerEvents {
	ping: () => void;
	disconnect: (socket: any) => void;
}

export const httpServer = http.createServer();

export const io = new Server<
	ServerToClientEvents,
	ClientToServerEvents,
	InterServerEvents,
	SocketData
>(httpServer, {
	cors: {
		origin: ['http://localhost:5173', 'http://localhost:4173'],
		credentials: true,
	},
});
