import http from 'http';
import { Server } from 'socket.io';
import express, { json } from 'express';
import { AuditoriaServicio } from './models/AuditoriaServicio';
import cors from 'cors';

export interface IAuditoriaServicio {
	metodo: string;
	servicio: string;
	peticion: string;
	respuesta: string;
}

export async function addAuditoria(auditoria: IAuditoriaServicio) {
	const auditoriaServicio = new AuditoriaServicio(auditoria);

	await auditoriaServicio.save();

	io.fetchSockets().then((sockets) => {
		sockets.forEach((socket) => {
			socket.emit('log', auditoriaServicio);
		});
	});
}

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

	log(log: any): void;
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

export const app = express();
app.use(json());
app.use(
	cors({
		origin: '*',
		methods: '*',
	})
);
export const httpServer = http.createServer(app);

const corsOrigins =
	process.env.ENV === 'dev'
		? ['http://localhost:5173', 'http://localhost:4173']
		: 'https://chat.zeroproject.dev';

export const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(httpServer, {
	cors: {
		origin: corsOrigins,
		credentials: true,
	},
});

app.post('/log', async (req, res) => {
	let { metodo, servicio, peticion, respuesta } = req.body;

	metodo = JSON.stringify(metodo);
	servicio = JSON.stringify(servicio);
	peticion = JSON.stringify(peticion);
	respuesta = JSON.stringify(respuesta);

	await addAuditoria({ metodo, servicio, peticion, respuesta });

	res.send('OK');
});

app.get('/log', async (req, res) => {
	const logs = await AuditoriaServicio.find();

	res.send(logs);
});
