import { Schema, model } from 'mongoose';

interface IMessage {
	content: string;
	from: string;
	to: Schema.Types.ObjectId;
}

const MessageSchema = new Schema<IMessage>(
	{
		content: { type: String, required: true },
		from: { type: String, required: true },
		to: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
	},
	{ timestamps: true }
);

export const Message = model<IMessage>('Message', MessageSchema);
