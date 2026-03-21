export enum AppRoutes {
	MAIN = "main",
	USERS = "users",
	NOT_FOUND = "not_found",
	LOGIN = "login",
	REGISTER = "register",
}

export const getRouteMain = () => "/";
export const getRouteUsers = () => "/users";
export const getRouteLogin = () => "/login";
export const getRouteRegister = () => "/register";
export const getRouteNotFound = () => "*";
