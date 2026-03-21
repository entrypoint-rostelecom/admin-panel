import { User } from "../model/types/User";
import { USER_ACCESS_TOKEN, USER_ACCESS_TOKEN_EXPIRATION, USER_DATA } from "@/shared/consts/localStorage";

const SESSION_DURATION_MS = __SESSION_DURATION_HOURS__ * 60 * 60 * 1000;

export const setAccessToken = (token: string, user?: User): void => {
	const expirationTime = Date.now() + SESSION_DURATION_MS;
	localStorage.setItem(USER_ACCESS_TOKEN, token);
	localStorage.setItem(USER_ACCESS_TOKEN_EXPIRATION, String(expirationTime));
	if (user) {
		localStorage.setItem(USER_DATA, JSON.stringify(user));
	}
};

export const clearAccessToken = (): void => {
	localStorage.removeItem(USER_ACCESS_TOKEN);
	localStorage.removeItem(USER_ACCESS_TOKEN_EXPIRATION);
	localStorage.removeItem(USER_DATA);
};

export const getAccessToken = (): string => {
	const token = localStorage.getItem(USER_ACCESS_TOKEN);
	const expiration = localStorage.getItem(USER_ACCESS_TOKEN_EXPIRATION);

	if (!token || !expiration) {
		return "";
	}

	if (Date.now() > Number(expiration)) {
		clearAccessToken();
		return "";
	}

	return token;
};

export const getUserData = (): User | null => {
	try {
		const data = localStorage.getItem(USER_DATA);
		if (data) return JSON.parse(data);
	} catch (e) {
		return null;
	}
	return null;
};
