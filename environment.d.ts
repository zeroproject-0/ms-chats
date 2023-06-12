declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			ENVIRONMENT: 'dev' | 'prod' | 'debug';
		}
	}
}

export {};
