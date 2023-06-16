import { Schema, model } from 'mongoose';

interface IUserGroups {
	userID: Schema.Types.ObjectId;
	groups: Schema.Types.ObjectId[];
}

const UserGroupsSchema = new Schema<IUserGroups>({
	userID: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		unique: true,
		required: true,
	},
	groups: {
		type: [Schema.Types.ObjectId],
		ref: 'Group',
		default: [],
	},
});

export const UserGroups = model<IUserGroups>('UserGroups', UserGroupsSchema);
