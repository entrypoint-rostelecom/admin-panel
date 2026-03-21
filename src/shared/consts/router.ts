import i18n from '@/shared/config/i18n/i18n';

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

const getLangStr = () => `/ru`;

export const getRouteMain = () => `${getLangStr()}/`;
export const getRouteDashboard = () => `${getLangStr()}/dashboard`;
export const getRouteRequests = () => `${getLangStr()}/requests`;
export const getRouteUsers = () => `${getLangStr()}/users`;
export const getRoutePasses = () => `${getLangStr()}/passes`;
export const getRouteDevices = () => `${getLangStr()}/devices`;
export const getRouteSystemSettings = () => `${getLangStr()}/system-settings`;
export const getRouteSecurityLogs = () => `${getLangStr()}/security-logs`;
export const getRouteLogin = () => `${getLangStr()}/login`;
export const getRouteRegister = () => `${getLangStr()}/register`;
export const getRouteNotFound = () => "*";
