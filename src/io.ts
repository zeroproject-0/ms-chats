import http from 'http';
import { Server } from 'socket.io';

interface SocketData {
	userID: string;
	sessionID: string;
}

export interface User {
	_id: string;
	email: string;
	name: string;
	nickname: string;
	avatar: string;
	lastname: string;
	contacts: User[];
	state: boolean;
}

export interface MessageBase {
	content: string;
	from: string;
	to: string;
}

export interface MessageToSend extends MessageBase {
	_id: string;
	author: User;
	createdAt?: Date;
}

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;

	private_message(x: any): void;
	session: (x: any) => void;
	chats(chats: any): void;
	chat_created(group: any): void;

	chat_joined(chatId: string): void;
}

interface ClientToServerEvents {
	private_message: (x: MessageBase) => void;
	create_chat({}: { usersIds: string[]; isPrivate: boolean }): void;
	join_chat(chatId: string): void;
}

interface InterServerEvents {
	ping: () => void;
	disconnect: (socket: any) => void;
}

export const httpServer = http.createServer();

export const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(httpServer, {
	cors: {
		origin: ['http://localhost:5173', 'http://localhost:4173'],
		credentials: true,
	},
});
