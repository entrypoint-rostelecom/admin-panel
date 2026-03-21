declare const __IS_DEV__: boolean;
declare const __API__: string;
declare const __API_LOGGING__: boolean;
declare const __SESSION_DURATION_HOURS__: number;

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

type OptionalRecord<K extends string, T> = {
	[P in K]?: T;
};
