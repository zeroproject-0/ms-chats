import mongoose from 'mongoose';

export const connectDB = async () => {
	try {
		console.log('Connecting to MongoDB');
		await mongoose.connect(process.env.MONGO_URI!);
		console.log('MongoDB connected');
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
