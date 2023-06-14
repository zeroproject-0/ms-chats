import { Schema, model } from 'mongoose';

interface IGroup {
	name: string;
	users: String[];
	description: string;
	messages: Schema.Types.ObjectId[];
}

const GroupSchema = new Schema<IGroup>(
	{
		name: { type: String, required: true, trim: true },
		users: { type: [String], required: true, default: [] },
		description: { type: String, trim: true, default: '' },
		messages: {
			type: [Schema.Types.ObjectId],
			ref: 'Message',
			required: true,
			default: [],
		},
	},
	{ timestamps: true }
);

export const Group = model<IGroup>('Group', GroupSchema);
