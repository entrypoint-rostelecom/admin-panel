import { NotFoundPage } from "@/pages/NotFoundPage";
import { DashboardPage as LazyDashboardPage } from "@/pages/Dashboard";
import { SecurityLogsPage as LazySecurityLogsPage } from "@/pages/SecurityLogs";
import { LazyMainPage } from "@/pages/MainPage";
import { LazyPassesPage } from "@/pages/Passes";
import {
	AppRoutes,
	getRouteDashboard,
	getRouteDevices,
	getRouteLogin,
	getRouteMain,
	getRouteNotFound,
	getRoutePasses,
	getRouteRegister,
	getRouteRequests,
	getRouteSecurityLogs,
	getRouteSystemSettings,
	getRouteUsers,
} from "@/shared/consts/router";
import { AppRouteProps } from "@/shared/types/router";
import { LazyLoginPage } from "@/pages/Login";
import { LazyRegisterPage } from "@/pages/Register";
import { LazyUsersPage } from "@/pages/Users";

export const routeConfig: Record<AppRoutes, AppRouteProps> = {
	[AppRoutes.MAIN]: {
		path: "/:lang/",
		element: <LazyMainPage />,
		authOnly: true,
	},
	[AppRoutes.DASHBOARD]: {
		path: "/:lang/dashboard",
		element: <LazyDashboardPage />,
		authOnly: true,
	},
	[AppRoutes.REQUESTS]: {
		path: "/:lang/requests",
		element: <NotFoundPage />,
		authOnly: true,
	},
	[AppRoutes.USERS]: {
		path: "/:lang/users",
		element: <LazyUsersPage />,
		authOnly: true,
	},
	[AppRoutes.PASSES]: {
		path: "/:lang/passes",
		element: <LazyPassesPage />,
		authOnly: true,
	},
	[AppRoutes.DEVICES]: {
		path: "/:lang/devices",
		element: <NotFoundPage />,
		authOnly: true,
	},
	[AppRoutes.SYSTEM_SETTINGS]: {
		path: "/:lang/system-settings",
		element: <NotFoundPage />,
		authOnly: true,
	},
	[AppRoutes.SECURITY_LOGS]: {
		path: "/:lang/security-logs",
		element: <LazySecurityLogsPage />,
		authOnly: true,
	},
	[AppRoutes.NOT_FOUND]: {
		path: getRouteNotFound(),
		element: <NotFoundPage />,
	},
	[AppRoutes.LOGIN]: {
		path: "/:lang/login",
		element: <LazyLoginPage />,
	},
	[AppRoutes.REGISTER]: {
		path: "/:lang/register",
		element: <LazyRegisterPage />,
	},
};
