import { memo, useState, useMemo } from "react";
import { Page } from "@/widgets/Page";
import { 
	useGetAdminUsersQuery,
	useGetAccessLogsQuery,
} from "@/entities/User";
import { exportToCsv } from "@/shared/lib/exportToCsv/exportToCsv";
import { MainLayout } from "@/widgets/MainLayout";
import classes from "./SecurityLogsPage.module.css";
import { useTranslation } from "react-i18next";

const SecurityLogsPage = memo(() => {
	const { t } = useTranslation();

	const { data: users = [] } = useGetAdminUsersQuery();
	const { data: logs = [], isLoading: isLogsLoading } = useGetAccessLogsQuery();

	const [search, setSearch] = useState("");
	const [dateFilter, setDateFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("Все типы");
	const [adminFilter, setAdminFilter] = useState("Все админы");

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const tableData = useMemo(() => {
		let filtered = logs
			.filter(log => users.some(u => Number(u.id) === Number(log.user_id)))
			.map((log) => {
				const user = users.find(u => Number(u.id) === Number(log.user_id));
				const adminName = user ? user.full_name : `ID ${log.user_id}`;
			
			const date = new Date(log.timestamp);
			const timeStr = isNaN(date.getTime()) 
				? log.timestamp 
				: date.toLocaleString('ru-RU', {
					day: '2-digit', month: '2-digit', year: 'numeric',
					hour: '2-digit', minute: '2-digit', second: '2-digit'
				}).replace(',', '');

			const isSuccess = log.result?.toLowerCase().includes("granted") || log.result?.toLowerCase().includes("success");

			return {
				time: timeStr,
				rawDate: date,
				admin: adminName,
				action: isSuccess ? t("logs.table.action.entrance") : t("logs.table.action.attempt"),
				typeText: isSuccess ? t("logs.table.type.auth") : t("logs.table.type.denied"),
				typeColor: isSuccess ? "purple" : "orange", 
				details: `${isSuccess ? t("logs.table.type.auth") : t("logs.table.type.denied")}. ${log.reason ? `${t("logs.table.reason")}: ${log.reason}` : ""}`,
				ip: `${t("logs.table.scanner")} #${log.scanner_id}`
			};
		});

		if (search) {
			const q = search.toLowerCase();
			filtered = filtered.filter(r => 
				r.admin.toLowerCase().includes(q) || 
				r.action.toLowerCase().includes(q) || 
				r.details.toLowerCase().includes(q)
			);
		}

		if (dateFilter) {
			filtered = filtered.filter(r => {
				const d = r.rawDate;
				if (isNaN(d.getTime())) return true;
				const filterD = new Date(dateFilter);
				return d.getFullYear() === filterD.getFullYear() &&
					   d.getMonth() === filterD.getMonth() &&
					   d.getDate() === filterD.getDate();
			});
		}

		if (typeFilter !== "Все типы" && typeFilter !== t("logs.filter.allTypes")) {
			filtered = filtered.filter(r => r.typeText === typeFilter);
		}

		if (adminFilter !== "Все админы" && adminFilter !== t("logs.filter.allAdmins")) {
			filtered = filtered.filter(r => r.admin === adminFilter);
		}

		return filtered;
	}, [logs, users, search, dateFilter, typeFilter, adminFilter, t]);

	const totalPages = Math.ceil(tableData.length / pageSize);
	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return tableData.slice(start, start + pageSize);
	}, [tableData, currentPage]);

	const stats = useMemo(() => {
		const success = tableData.filter(r => r.typeColor === "purple").length;
		const denied = tableData.filter(r => r.typeColor === "orange").length;
		const uniqueScanners = new Set(logs.map(l => l.scanner_id)).size;
		return {
			total: tableData.length,
			success,
			denied,
			scanners: uniqueScanners
		};
	}, [tableData, logs]);

	const onExport = () => {
		exportToCsv("security_logs", tableData, [
			{ key: "time", label: "Время" },
			{ key: "admin", label: "Администратор" },
			{ key: "action", label: "Действие" },
			{ key: "typeText", label: "Тип" },
			{ key: "details", label: "Детали" },
			{ key: "ip", label: "Номер сканера" },
		]);
	};

	return (
		<MainLayout>
			<Page>
				<section className={classes.content}>
					<div className={classes.contentBox}>
						<div className={classes.contentHeader}>
							<div>
								<h1 className={classes.title}>{t("logs.title")}</h1>
								<p className={classes.subtitle}>{t("logs.subtitle")}</p>
							</div>
							<button className={classes.exportBtn} onClick={onExport} disabled={tableData.length === 0}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
								{t("logs.export")}
							</button>
						</div>

						{/* FILTERS */}
						<div className={classes.filtersBar}>
							<div className={classes.searchInputWrap}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
								<input 
									type="text" 
									placeholder={t("logs.search")} 
									className={classes.searchInput} 
									value={search}
									onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
								/>
							</div>
							
							<div className={classes.dateInputWrap}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
								<input 
									type="date" 
									className={classes.dateInput} 
									value={dateFilter}
									onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
								/>
							</div>

							<div className={classes.selectsWrap}>
								<select 
									className={classes.filterSelect}
									value={typeFilter}
									onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
								>
									<option>{t("logs.filter.allTypes")}</option>
									<option>{t("logs.filter.auth")}</option>
									<option>{t("logs.filter.denied")}</option>
								</select>
								<select 
									className={classes.filterSelect}
									value={adminFilter}
									onChange={(e) => { setAdminFilter(e.target.value); setCurrentPage(1); }}
								>
									<option>{t("logs.filter.allAdmins")}</option>
									{Array.from(new Set(logs.map(l => {
										const u = users.find(user => user.id === l.user_id);
										return u ? u.full_name : `ID ${l.user_id}`;
									}))).map(name => (
										<option key={name} value={name}>{name}</option>
									))}
								</select>
							</div>
						</div>

						{/* STAT CARDS */}
						<div className={classes.statsGrid}>
							<div className={classes.statCard}>
								<div className={classes.statIconPurple}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
								</div>
								<div className={classes.statText}>
									<h2 className={classes.statNumber}>{isLogsLoading ? "..." : stats.total}</h2>
									<p className={classes.statLabel}>{t("logs.stats.total")}</p>
								</div>
							</div>
							<div className={classes.statCard}>
								<div className={classes.statIconGreen}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
								</div>
								<div className={classes.statText}>
									<h2 className={classes.statNumber}>{isLogsLoading ? "..." : stats.success}</h2>
									<p className={classes.statLabel}>{t("logs.stats.allowed")}</p>
								</div>
							</div>
							<div className={classes.statCard}>
								<div className={classes.statIconOrange}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
								</div>
								<div className={classes.statText}>
									<h2 className={classes.statNumber}>{isLogsLoading ? "..." : stats.denied}</h2>
									<p className={classes.statLabel}>{t("logs.stats.denied")}</p>
								</div>
							</div>
						</div>

						{/* TABLE */}
						<div className={classes.tableWrap}>
							<table className={classes.table}>
								<thead>
									<tr>
										<th style={{width: '180px'}}>{t("logs.table.time")}</th>
										<th>{t("logs.table.admin")}</th>
										<th>{t("logs.table.action_label")}</th>
										<th>{t("logs.table.type_label")}</th>
										<th className={classes.responsiveHide}>{t("logs.table.details")}</th>
										<th className={classes.responsiveHide}>{t("logs.table.scanner")}</th>
									</tr>
								</thead>
								<tbody>
									{isLogsLoading ? (
										<tr>
											<td colSpan={6} style={{textAlign: "center", padding: "32px", color: "#667085"}}>{t("logs.table.loading")}</td>
										</tr>
									) : paginatedData.length > 0 ? (
										paginatedData.map((row, idx) => (
											<tr key={idx}>
												<td>
													<div className={classes.tdIconWrapper}>
														<div className={row.typeColor === "purple" ? classes.tdIconPurple : classes.tdIconOrange}>
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
																{row.typeColor === "purple" 
																	? <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
																	: <circle cx="12" cy="12" r="10"></circle>
																}
															</svg>
														</div>
														{row.time}
													</div>
												</td>
												<td>{row.admin}</td>
												<td>{row.action}</td>
												<td>
													<span className={`${classes.typeBadge} ${row.typeColor === "purple" ? classes.typeBadgePurple : classes.typeBadgeOrange}`}>
														{row.typeText}
													</span>
												</td>
												<td className={`${classes.tdDetails} ${classes.responsiveHide}`}>{row.details}</td>
												<td className={`${classes.tdIp} ${classes.responsiveHide}`}>{row.ip}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={6} style={{textAlign: "center", padding: "32px", color: "#667085"}}>{t("logs.table.empty")}</td>
										</tr>
									)}
								</tbody>
							</table>

							{totalPages > 1 && (
								<div className={classes.pagination}>
									<button 
										className={classes.pageBtnText} 
										onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
										disabled={currentPage === 1}
									>
										{t("common.pagination.previous")}
									</button>
									{Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
										<button 
											key={page}
											className={`${classes.pageBtn} ${currentPage === page ? classes.pageBtnActive : ""}`}
											onClick={() => setCurrentPage(page)}
										>
											{page}
										</button>
									))}
									<button 
										className={classes.pageBtnText} 
										onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
										disabled={currentPage === totalPages}
									>
										{t("common.pagination.next")}
									</button>
								</div>
							)}
						</div>
					</div>
				</section>
			</Page>
		</MainLayout>
	);
});

export default SecurityLogsPage;
