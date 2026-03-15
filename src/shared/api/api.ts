import axios from "axios";
import { getAccessToken } from "@/entities/User/lib/authToken";
import { apiLogger } from "@/shared/lib/logger/apiLogger";

const isApiLoggingEnabled = __API_LOGGING__;

export const $api = axios.create({
	baseURL: __API__,
	headers: {
		authorization: getAccessToken(),
	},
});

$api.interceptors.request.use((config) => {
	if (config.headers) {
		config.headers.Authorization = getAccessToken();
	}

	if (isApiLoggingEnabled) {
		apiLogger.request({
			layer: "axios",
			url: config.url || "",
			method: config.method,
			request: config.data,
		});
	}

	return config;
});

$api.interceptors.response.use(
	(response) => {
		if (isApiLoggingEnabled) {
			apiLogger.success({
				layer: "axios",
				url: response.config.url || "",
				method: response.config.method,
				request: response.config.data,
				response: response.data,
				status: response.status,
			});
		}

		return response;
	},
	(error) => {
		if (isApiLoggingEnabled) {
			apiLogger.error({
				layer: "axios",
				url: error?.config?.url || "",
				method: error?.config?.method,
				request: error?.config?.data,
				error: error?.response?.data || error,
				status: error?.response?.status,
			});
		}

		return Promise.reject(error);
	},
);
