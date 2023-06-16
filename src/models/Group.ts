import { Schema, model } from 'mongoose';

interface IGroup {
	name: string;
	members: { user: Schema.Types.ObjectId; isAdmin: boolean }[];
	description: string;
	isPrivate: boolean;

	messages: Schema.Types.ObjectId[];
}

const GroupSchema = new Schema<IGroup>(
	{
		name: { type: String, required: true, trim: true },
		members: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: 'User',
					required: true,
					trim: true,
				},
				isAdmin: { type: Boolean, default: false },
			},
		],
		description: { type: String, trim: true, default: '' },
		isPrivate: { type: Boolean, default: false },
		messages: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Message',
				required: true,
				default: [],
			},
		],
	},
	{ timestamps: true }
);

export const Group = model<IGroup>('Group', GroupSchema);
