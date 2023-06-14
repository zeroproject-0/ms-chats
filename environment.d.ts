declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			MONGO_URI: string;
			ENVIRONMENT: 'dev' | 'prod' | 'debug';
		}
	}
}

export {};
