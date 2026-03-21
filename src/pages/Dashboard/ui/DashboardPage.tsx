import { memo, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page } from "@/widgets/Page";
import {
	clearAccessToken,
	useAdminLogoutMutation,
	useUserActions,
	useGetAdminUsersQuery,
	useGetAccessLogsQuery
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

const NAV_ITEMS = [
	{ label: "Дашборд", path: getRouteDashboard() },
	{ label: "Пользователи", path: getRouteUsers() },
	{ label: "Проходы", path: getRoutePasses() },
	{ label: "Устройства", path: getRouteDevices() },
	{ label: "Логи безопасности", path: getRouteSecurityLogs() },
];



const DashboardPage = memo(() => {
	const nav = useNavigate();
	const location = useLocation();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [adminLogout] = useAdminLogoutMutation();
	const { clearAuthData } = useUserActions();

	const { data: users = [], isLoading: isUsersLoading } = useGetAdminUsersQuery(undefined, { pollingInterval: 3000 });
	const { data: logs = [], isLoading: isLogsLoading } = useGetAccessLogsQuery(undefined, { pollingInterval: 3000 });

	const activeLastMonthCount = useMemo(() => {
		const monthAgo = new Date();
		monthAgo.setMonth(monthAgo.getMonth() - 1);
		return users.filter(u => u.is_active && new Date(u.created_at) >= monthAgo).length;
	}, [users]);

	const totalBlockedCount = useMemo(() => {
		return users.filter(u => !u.is_active).length;
	}, [users]);

	const insideCount = useMemo(() => {
		return users.filter(u => u.is_inside).length;
	}, [users]);

	const recentEvents = useMemo(() => {
		const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		return sortedLogs
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
				location: `Сканер #${log.scanner_id}`,
				result: isSuccess ? "Разрешён" : "Запрещён",
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
							<p className={classes.brandTitle}>Точка входа</p>
							<p className={classes.brandSubtitle}>Админ-панель</p>
						</div>
					</div>

					<button className={classes.profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
						<span className={classes.profileInfo}>
							<span className={classes.profileName}>Иванова А.С.</span>
							<span className={classes.profileRole}>Администратор</span>
						</span>
						<span className={classes.profileAvatar}>AS</span>
					</button>

					{isProfileOpen ? (
						<div className={classes.profileMenu}>
							<button type="button" className={classes.profileMenuButton} onClick={onLogout}>
								Выйти
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
										onClick={() => nav(item.path)}
										className={`${classes.navItem} ${isActive ? classes["navItem--active"] : ""}`}
									>
										<span className={classes.navIcon}>
											{item.label === "Дашборд" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>}
											{item.label === "Пользователи" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
											{item.label === "Проходы" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
											{item.label === "Устройства" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>}
											{item.label === "Логи безопасности" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>}
										</span>
										<span>{item.label}</span>
									</button>
								);
							})}
						</nav>

					</aside>

					{/* MAIN CONTENT */}
					<section className={classes.content}>
						<div className={classes.contentHeader}>
							<div>
								<h1 className={classes.title}>Дашборд</h1>
								<p className={classes.subtitle}>Обзор системы управления доступом</p>
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
								<p className={classes.kpiDesc}>Активные пользователи за месяц</p>
							</div>

							<div className={classes.kpiCard}>
								<div className={classes.kpiCardHeader}>
									<div className={classes.iconWrapperRed}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
									</div>
								</div>
								<h2 className={classes.kpiNumber}>{isUsersLoading ? "..." : totalBlockedCount}</h2>
								<p className={classes.kpiDesc}>Всего заблокировано</p>
							</div>

							<div className={classes.kpiCard}>
								<div className={classes.kpiCardHeader}>
									<div className={classes.iconWrapperOrange}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
									</div>
								</div>
								<h2 className={classes.kpiNumber}>{isUsersLoading ? "..." : insideCount}</h2>
								<p className={classes.kpiDesc}>Внутри работы</p>
							</div>
						</div>

						{/* BOTTOM GRID */}
						<div className={classes.bottomGrid}>
							<div className={classes.tablePanel}>
								<div className={classes.panelHeader}>
									<div>
										<h3 className={classes.panelTitle}>Последние события прохода</h3>
										<p className={classes.panelSubtitle}>Журнал активности сканеров</p>
									</div>
								</div>
								<div className={classes.tableWrap}>
									<table className={classes.table}>
										<thead>
											<tr>
												<th>Пользователь</th>
												<th>Время</th>
												<th>Локация</th>
												<th>Результат</th>
												<th>Причина</th>
											</tr>
										</thead>
										<tbody>
											{isLogsLoading ? (
												<tr>
													<td colSpan={5} className={classes.tableMuted} style={{ textAlign: "center" }}>Обновление журнала...</td>
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
													<td colSpan={5} className={classes.tableMuted} style={{ textAlign: "center" }}>Нет недавних событий</td>
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
