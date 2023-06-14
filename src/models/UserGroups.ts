import { Schema, model } from 'mongoose';

interface IUserGroups {
	userID: String;
	groups: Schema.Types.ObjectId[];
}

const UserGroupsSchema = new Schema<IUserGroups>({
	userID: { type: String, required: true },
	groups: {
		type: [Schema.Types.ObjectId],
		ref: 'Group',
		required: true,
		default: [],
	},
});

export const UserGroups = model<IUserGroups>('UserGroups', UserGroupsSchema);
