import { memo, useMemo } from "react";
import { Page } from "@/widgets/Page";
import {
	useGetAdminUsersQuery,
	useGetAccessLogsQuery,
} from "@/entities/User";
import { MainLayout } from "@/widgets/MainLayout";
import classes from "./DashboardPage.module.css";
import { useTranslation } from "react-i18next";

const DashboardPage = memo(() => {
	const { t } = useTranslation();

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
	}, [logs, users, t]);

	return (
		<MainLayout>
			<Page>
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
								<div className={classes.iconWrapperBlue}>
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
											<th className={classes.responsiveHide}>{t("dashboard.logs.location")}</th>
											<th>{t("dashboard.logs.result")}</th>
											<th className={classes.responsiveHide}>{t("dashboard.logs.reason")}</th>
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
													<td className={`${classes.tableMuted} ${classes.responsiveHide}`}>{event.location}</td>
													<td>
														<span className={`${classes.resultBadge} ${event.status === "success" ? classes["resultBadge--success"] : classes["resultBadge--error"]}`}>
															<span className={classes.statusDot} />
															{event.result}
														</span>
													</td>
													<td className={`${classes.tableMuted} ${classes.responsiveHide}`}>{event.reason}</td>
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
			</Page>
		</MainLayout>
	);
});

export default DashboardPage;
