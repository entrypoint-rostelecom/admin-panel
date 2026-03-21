import { BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAccessToken, getAccessToken } from "@/entities/User/lib/authToken";
import { UserActions } from "@/entities/User/model/slice/userSlice";
import { getRouteLogin } from "@/shared/consts/router";
import { apiLogger } from "@/shared/lib/logger/apiLogger";

const isApiLoggingEnabled = __API_LOGGING__;

const getRequestMeta = (args: string | FetchArgs) => {
	if (typeof args === "string") {
		return {
			url: args,
			method: "GET",
			request: undefined,
		};
	}

	return {
		url: args.url,
		method: args.method || "GET",
		request: args.body,
	};
};

const baseQuery = fetchBaseQuery({
	baseUrl: __API__,
	prepareHeaders: (headers) => {
		const token = getAccessToken();
		if (token) {
			const normalizedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
			headers.set("Authorization", normalizedToken);
		}
		return headers;
	},
});

const baseQueryWithAuthHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions,
) => {
	const startedAt = Date.now();
	const requestMeta = getRequestMeta(args);

	if (isApiLoggingEnabled) {
		apiLogger.request({
			layer: "rtk",
			url: requestMeta.url,
			method: requestMeta.method,
			request: requestMeta.request,
		});
	}

	const result = await baseQuery(args, api, extraOptions);
	const durationMs = Date.now() - startedAt;

	if (isApiLoggingEnabled) {
		if (result.error) {
			apiLogger.error({
				layer: "rtk",
				url: requestMeta.url,
				method: requestMeta.method,
				request: requestMeta.request,
				error: result.error,
				status: result.error.status,
				durationMs,
			});
		} else {
			apiLogger.success({
				layer: "rtk",
				url: requestMeta.url,
				method: requestMeta.method,
				request: requestMeta.request,
				response: result.data,
				status: 200,
				durationMs,
			});
		}
	}

	if (result.error?.status === 401) {
		clearAccessToken();
		api.dispatch(UserActions.clearAuthData());

		if (window.location.pathname !== getRouteLogin()) {
			window.location.replace(getRouteLogin());
		}
	}

	return result;
};

export const rtkApi = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithAuthHandling,
	tagTypes: ["AdminUsers"],
	endpoints: (build) => ({}),
});
