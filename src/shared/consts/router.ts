export enum AppRoutes {
	MAIN = "main",
	DASHBOARD = "dashboard",
	REQUESTS = "requests",
	USERS = "users",
	PASSES = "passes",
	DEVICES = "devices",
	SYSTEM_SETTINGS = "system_settings",
	SECURITY_LOGS = "security_logs",
	NOT_FOUND = "not_found",
	LOGIN = "login",
	REGISTER = "register",
}

export const getRouteMain = () => "/";
export const getRouteDashboard = () => "/dashboard";
export const getRouteRequests = () => "/requests";
export const getRouteUsers = () => "/users";
export const getRoutePasses = () => "/passes";
export const getRouteDevices = () => "/devices";
export const getRouteSystemSettings = () => "/system-settings";
export const getRouteSecurityLogs = () => "/security-logs";
export const getRouteLogin = () => "/login";
export const getRouteRegister = () => "/register";
export const getRouteNotFound = () => "*";
