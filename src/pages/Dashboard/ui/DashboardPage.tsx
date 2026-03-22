import { memo, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page } from "@/widgets/Page";
import {
	clearAccessToken,
	useAdminLogoutMutation,
	useUserActions,
	useGetAdminUsersQuery,
	useGetAccessLogsQuery,
	getUserData
} from "@/entities/User";
import {
	getRouteDashboard,
	getRouteDevices,
	getRouteMain,
	getRoutePasses,
	getRouteRequests,
	getRouteSecurityLogs,
	getRouteSystemSettings,
	getRouteUsers,
} from "@/shared/consts/router";
import classes from "./DashboardPage.module.css";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const NAV_ITEMS = [
	{ id: "dashboard", label: "sidebar.dashboard", path: getRouteDashboard() },
	{ id: "users", label: "sidebar.users", path: getRouteUsers() },
	{ id: "passes", label: "sidebar.passes", path: getRoutePasses() },
	{ id: "devices", label: "sidebar.devices", path: getRouteDevices() },
	{ id: "logs", label: "sidebar.logs", path: getRouteSecurityLogs() },
];



const DashboardPage = memo(() => {
	const { t } = useTranslation();
	const nav = useNavigate();
	const location = useLocation();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [adminLogout] = useAdminLogoutMutation();
	const { clearAuthData } = useUserActions();

	const { data: users = [], isLoading: isUsersLoading } = useGetAdminUsersQuery();
	const { data: logs = [], isLoading: isLogsLoading } = useGetAccessLogsQuery();

	// Backend might return "false", "0", or false. We normalize it.
	const isTruthy = (val: any) => val === true || val === "true" || val === 1 || val === "1";
	const isFalsy = (val: any) => val === false || val === "false" || val === 0 || val === "0" || !val;

	const activeLastMonthCount = useMemo(() => {
		const monthAgo = new Date();
		monthAgo.setMonth(monthAgo.getMonth() - 1);
		return users.filter(u => isTruthy(u.is_active) && new Date(u.created_at) >= monthAgo).length;
	}, [users]);

	const totalBlockedCount = useMemo(() => {
		return users.filter(u => isFalsy(u.is_active)).length;
	}, [users]);

	const passesTodayCount = useMemo(() => {
		const todayStr = new Date().toDateString();
		const validLogs = logs.filter(log => users.some(u => Number(u.id) === Number(log.user_id)));
		return validLogs.filter(log => new Date(log.timestamp).toDateString() === todayStr).length;
	}, [logs, users]);

	const recentEvents = useMemo(() => {
		return logs
			.filter(log => users.some(u => Number(u.id) === Number(log.user_id)))
			.slice(0, 5)
			.map(log => {
				const user = users.find(u => Number(u.id) === Number(log.user_id));
				const name = user ? user.full_name : `ID ${log.user_id}`;

			const date = new Date(log.timestamp);
			const timeStr = isNaN(date.getTime())
				? log.timestamp
				: date.toLocaleString('ru-RU', {
					day: '2-digit', month: '2-digit', year: 'numeric',
					hour: '2-digit', minute: '2-digit'
				}).replace(',', '');

			const rawResult = log.result?.toLowerCase() || "";
			const isSuccess = rawResult.includes("granted") || rawResult.includes("success") || rawResult.includes("разрешён");

			return {
				user: name,
				time: timeStr,
				location: `${t("dashboard.logs.scanner")} #${log.scanner_id}`,
				result: isSuccess ? t("dashboard.logs.allowed") : t("dashboard.logs.denied"),
				reason: log.reason || "—",
				status: isSuccess ? "success" : "error"
			};
		});
	}, [logs, users]);

	const onLogout = () => {
		adminLogout(undefined)
			.unwrap()
			.catch(() => undefined)
			.finally(() => {
				clearAccessToken();
				clearAuthData();
				nav(getRouteMain());
			});
	};

	return (
		<Page>
			<div className={classes.page}>

				{/* TOPBAR */}
				<header className={classes.topbar}>
					<div className={classes.brand}>
						<div className={classes.brandLogo}>Р</div>
						<div className={classes.brandText}>
							<p className={classes.brandTitle}>{t("common.app_name")}</p>
							<p className={classes.brandSubtitle}>{t("common.admin_panel")}</p>
						</div>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<LanguageSwitcher />
						<button className={classes.profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
							<span className={classes.profileInfo}>
								<span className={classes.profileName}>{getUserData()?.username || t("common.no_name")}</span>
								<span className={classes.profileRole}>{t("dashboard.role")}</span>
							</span>
							<span className={classes.profileAvatar}>{(getUserData()?.username || "U")[0].toUpperCase()}</span>
						</button>
					</div>

					{isProfileOpen ? (
						<div className={classes.profileMenu}>
							<button type="button" className={classes.profileMenuButton} onClick={onLogout}>
								{t("common.logout")}
							</button>
						</div>
					) : null}
					</header>

				{/* LAYOUT GRID */}
				<div className={classes.layout}>

					{/* SIDEBAR */}
					<aside className={classes.sidebar}>
						<nav className={classes.nav}>
							{NAV_ITEMS.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<button
										key={item.label}
										type="button"
										onClick={() => {
											const currentLang = location.pathname.split('/')[1] || 'ru';
											nav(item.path.replace(/^\/(ru|en)/, `/${currentLang}`));
										}}
										className={`${classes.navItem} ${isActive ? classes["navItem--active"] : ""}`}
									>
										<span className={classes.navIcon}>
											{item.id === "dashboard" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>}
											{item.id === "users" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
											{item.id === "passes" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
											{item.id === "devices" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>}
											{item.id === "logs" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>}
										</span>
										<span>{t(item.label)}</span>
									</button>
								);
							})}
						</nav>

					</aside>

					{/* MAIN CONTENT */}
					<section className={classes.content}>
						<div className={classes.contentHeader}>
							<div>
								<h1 className={classes.title}>{t("dashboard.title")}</h1>
								<p className={classes.subtitle}>{t("dashboard.subtitle")}</p>
							</div>
						</div>

						{/* 3 KPI CARDS */}
						<div className={classes.kpiGrid}>
							<div className={classes.kpiCard}>
								<div className={classes.kpiCardHeader}>
									<div className={classes.iconWrapperPurple}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
									</div>
								</div>
								<h2 className={classes.kpiNumber}>{isUsersLoading ? "..." : activeLastMonthCount}</h2>
								<p className={classes.kpiDesc}>{t("dashboard.kpi.users")}</p>
							</div>

							<div className={classes.kpiCard}>
								<div className={classes.kpiCardHeader}>
									<div className={classes.iconWrapperRed}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
									</div>
								</div>
								<h2 className={classes.kpiNumber}>{isUsersLoading ? "..." : totalBlockedCount}</h2>
								<p className={classes.kpiDesc}>{t("dashboard.kpi.blocked")}</p>
							</div>

							<div className={classes.kpiCard}>
								<div className={classes.kpiCardHeader}>
									<div className={classes.iconWrapperBlue} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
									</div>
								</div>
								<h2 className={classes.kpiNumber}>{isLogsLoading ? "..." : passesTodayCount}</h2>
								<p className={classes.kpiDesc}>{t("dashboard.kpi.inside")}</p>
							</div>
						</div>

						{/* BOTTOM GRID */}
						<div className={classes.bottomGrid}>
							<div className={classes.tablePanel}>
								<div className={classes.panelHeader}>
									<div>
										<h3 className={classes.panelTitle}>{t("dashboard.logs.title")}</h3>
										<p className={classes.panelSubtitle}>{t("dashboard.logs.subtitle")}</p>
									</div>
								</div>
								<div className={classes.tableWrap}>
									<table className={classes.table}>
										<thead>
											<tr>
												<th>{t("dashboard.logs.user")}</th>
												<th>{t("dashboard.logs.time")}</th>
												<th>{t("dashboard.logs.location")}</th>
												<th>{t("dashboard.logs.result")}</th>
												<th>{t("dashboard.logs.reason")}</th>
											</tr>
										</thead>
										<tbody>
											{isLogsLoading ? (
												<tr>
													<td colSpan={5} className={classes.tableMuted} style={{ textAlign: "center" }}>{t("dashboard.logs.loading")}</td>
												</tr>
											) : recentEvents.length > 0 ? (
												recentEvents.map((event, idx) => (
													<tr key={idx}>
														<td>{event.user}</td>
														<td className={classes.tableMuted}>{event.time}</td>
														<td className={classes.tableMuted}>{event.location}</td>
														<td>
															<span className={`${classes.resultBadge} ${event.status === "success" ? classes["resultBadge--success"] : classes["resultBadge--error"]}`}>
																<span className={classes.statusDot} />
																{event.result}
															</span>
														</td>
														<td className={classes.tableMuted}>{event.reason}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={5} className={classes.tableMuted} style={{ textAlign: "center" }}>{t("dashboard.logs.empty")}</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</Page>
	);
});

export default DashboardPage;
