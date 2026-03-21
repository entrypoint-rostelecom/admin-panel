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
		path: getRouteMain(),
		element: <LazyMainPage />,
		authOnly: true,
	},
	[AppRoutes.DASHBOARD]: {
		path: getRouteDashboard(),
		element: <LazyDashboardPage />,
		authOnly: true,
	},
	[AppRoutes.REQUESTS]: {
		path: getRouteRequests(),
		element: <NotFoundPage />,
		authOnly: true,
	},
	[AppRoutes.USERS]: {
		path: getRouteUsers(),
		element: <LazyUsersPage />,
		authOnly: true,
	},
	[AppRoutes.PASSES]: {
		path: getRoutePasses(),
		element: <LazyPassesPage />,
		authOnly: true,
	},
	[AppRoutes.DEVICES]: {
		path: getRouteDevices(),
		element: <NotFoundPage />,
		authOnly: true,
	},
	[AppRoutes.SYSTEM_SETTINGS]: {
		path: getRouteSystemSettings(),
		element: <NotFoundPage />,
		authOnly: true,
	},
	[AppRoutes.SECURITY_LOGS]: {
		path: getRouteSecurityLogs(),
		element: <LazySecurityLogsPage />,
		authOnly: true,
	},
	[AppRoutes.NOT_FOUND]: {
		path: getRouteNotFound(),
		element: <NotFoundPage />,
	},
	[AppRoutes.LOGIN]: {
		path: getRouteLogin(),
		element: <LazyLoginPage />,
	},
	[AppRoutes.REGISTER]: {
		path: getRouteRegister(),
		element: <LazyRegisterPage />,
	},
};
