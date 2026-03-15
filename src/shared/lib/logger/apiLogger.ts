type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

interface ApiLogPayload {
	layer: "rtk" | "axios";
	method?: string;
	url: string;
	request?: unknown;
	response?: unknown;
	status?: number | string;
	error?: unknown;
	durationMs?: number;
}

const normalizeMethod = (method?: string): HttpMethod | string => (method || "GET").toUpperCase();

const SENSITIVE_KEYS = ["password", "token", "accessToken", "authorization", "Authorization"];

const sanitize = (value: unknown): unknown => {
	if (!value || typeof value !== "object") {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map((item) => sanitize(item));
	}

	return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, raw]) => {
		if (SENSITIVE_KEYS.includes(key)) {
			acc[key] = "***";
			return acc;
		}

		acc[key] = sanitize(raw);
		return acc;
	}, {});
};

const print = (title: string, payload: ApiLogPayload) => {
	console.info(title);
	console.groupCollapsed(title);
	console.log("layer", payload.layer);
	console.log("url", payload.url);
	console.log("method", payload.method);
	if (payload.status !== undefined) {
		console.log("status", payload.status);
	}
	if (payload.durationMs !== undefined) {
		console.log("durationMs", payload.durationMs);
	}
	if (payload.request !== undefined) {
		console.log("request", sanitize(payload.request));
	}
	if (payload.response !== undefined) {
		console.log("response", sanitize(payload.response));
	}
	if (payload.error !== undefined) {
		console.error("error", sanitize(payload.error));
	}
	console.groupEnd();
};

export const apiLogger = {
	request: (payload: Omit<ApiLogPayload, "response" | "error" | "status" | "durationMs">) => {
		const method = normalizeMethod(payload.method);
		print(`[API:REQUEST] ${method} ${payload.url}`, {
			...payload,
			method,
		});
	},
	success: (payload: Omit<ApiLogPayload, "error">) => {
		const method = normalizeMethod(payload.method);
		print(`[API:SUCCESS] ${method} ${payload.url}`, {
			...payload,
			method,
		});
	},
	error: (payload: Omit<ApiLogPayload, "response">) => {
		const method = normalizeMethod(payload.method);
		print(`[API:ERROR] ${method} ${payload.url}`, {
			...payload,
			method,
		});
	},
};
