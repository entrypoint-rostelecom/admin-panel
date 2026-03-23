import { useGetAdminUsersQuery, useGetAccessLogsQuery } from "@/entities/User";
import { memo, useState, useMemo } from "react";
import { Page } from "@/widgets/Page";
import { exportToCsv } from "@/shared/lib/exportToCsv/exportToCsv";
import { MainLayout } from "@/widgets/MainLayout";
import classes from "./PassesPage.module.css";
import { useTranslation } from "react-i18next";

type PassResult = "allowed" | "denied";

interface PassRow {
	eventTime: string;
	userName: string;
	login: string;
	scanner: string;
	result: PassResult;
	reason: string;
	device: string;
}

const TABLE_HEAD = ["time", "user", "login", "scanner", "result", "reason", "device"];

const PassesPage = memo(() => {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");

	const { data: users = [] } = useGetAdminUsersQuery();
	const { data: logs = [], isLoading: isLogsLoading } = useGetAccessLogsQuery();

	const [scannerFilter, setScannerFilter] = useState("");
	const [resultFilter, setResultFilter] = useState("");

	const tableData = useMemo<PassRow[]>(() => {
		return logs
			.filter(log => users.some(u => Number(u.id) === Number(log.user_id)))
			.map((log) => {
				const user = users.find(u => Number(u.id) === Number(log.user_id));
				const userName = user ? user.full_name : `ID ${log.user_id}`;
			const login = user ? user.login : "-";
			
			const date = new Date(log.timestamp);
			const timeStr = isNaN(date.getTime()) 
				? log.timestamp 
				: date.toLocaleString('ru-RU', {
					day: '2-digit', month: '2-digit', year: 'numeric',
					hour: '2-digit', minute: '2-digit', second: '2-digit'
				}).replace(',', '');

			return {
				eventTime: timeStr,
				userName,
				login,
				scanner: `Вход ${log.scanner_id}`,
				result: (log.result?.toLowerCase().includes("granted") || log.result?.toLowerCase().includes("success")) ? "allowed" : "denied",
				reason: log.reason || "—",
				device: "—"
			};
		});
	}, [logs, users]);

	const filteredRows = useMemo(() => {
		return tableData.filter((row) => {
			const normalizedSearch = search.trim().toLowerCase();
			const matchesSearch = !normalizedSearch ||
				row.userName.toLowerCase().includes(normalizedSearch) ||
				row.login.toLowerCase().includes(normalizedSearch) ||
				row.scanner.toLowerCase().includes(normalizedSearch);
			
			const matchesScanner = !scannerFilter || scannerFilter === t("passes.filter.scanners.all") || row.scanner === scannerFilter;
			const matchesResult = !resultFilter || resultFilter === t("passes.filter.results.all") || 
				(resultFilter === t("passes.filter.results.allowed") && row.result === "allowed") || 
				(resultFilter === t("passes.filter.results.denied") && row.result === "denied");

			return matchesSearch && matchesScanner && matchesResult;
		});
	}, [tableData, search, scannerFilter, resultFilter]);

	const onExport = () => {
		exportToCsv("passes", filteredRows, [
			{ key: "eventTime", label: "Время события" },
			{ key: "userName", label: "Пользователь" },
			{ key: "login", label: "Логин" },
			{ key: "scanner", label: "Сканер" },
			{ key: "result", label: "Результат" },
			{ key: "reason", label: "Причина отказа" },
			{ key: "device", label: "Устройство" },
		]);
	};

	return (
		<MainLayout>
			<Page>
				<section className={classes.passesPage__content}>
					<div className={classes.passesPage__contentHeader}>
						<div>
							<h1 className={classes.passesPage__title}>{t("passes.title")}</h1>
							<p className={classes.passesPage__subtitle}>{t("passes.subtitle")}</p>
						</div>
						<button 
							className={classes.passesPage__exportButton} 
							type="button" 
							onClick={onExport} 
							disabled={filteredRows.length === 0}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
							{t("passes.export")}
						</button>
					</div>

					<div className={classes.passesPage__filters}>
						<div className={classes.passesPage__search}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
							<input
								className={classes.passesPage__searchInput}
								placeholder={t("passes.search.placeholder")}
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>
						<div className={classes.passesPage__selectWrap}>
							<select 
								className={classes.passesPage__filterSelect}
								value={scannerFilter}
								onChange={(e) => setScannerFilter(e.target.value)}
							>
								<option value="">{t("passes.filter.scanners.all")}</option>
								{Array.from(new Set(logs.map(l => `Вход ${l.scanner_id}`))).sort().map(s => (
									<option key={s} value={s}>{s}</option>
								))}
							</select>
						</div>
						<div className={classes.passesPage__selectWrap}>
							<select 
								className={classes.passesPage__filterSelect}
								value={resultFilter}
								onChange={(e) => setResultFilter(e.target.value)}
							>
								<option value="">{t("passes.filter.results.all")}</option>
								<option value={t("passes.filter.results.allowed")}>{t("passes.filter.results.allowed")}</option>
								<option value={t("passes.filter.results.denied")}>{t("passes.filter.results.denied")}</option>
							</select>
						</div>
					</div>

					<div className={classes.passesPage__tableWrap}>
						<table className={classes.passesPage__table}>
							<thead>
								<tr>
									<th key={TABLE_HEAD[0]}>{t(`passes.table.${TABLE_HEAD[0]}`)}</th>
									<th key={TABLE_HEAD[1]}>{t(`passes.table.${TABLE_HEAD[1]}`)}</th>
									<th key={TABLE_HEAD[2]} className={classes.responsiveHide}>{t(`passes.table.${TABLE_HEAD[2]}`)}</th>
									<th key={TABLE_HEAD[3]} className={classes.responsiveHide}>{t(`passes.table.${TABLE_HEAD[3]}`)}</th>
									<th key={TABLE_HEAD[4]}>{t(`passes.table.${TABLE_HEAD[4]}`)}</th>
									<th key={TABLE_HEAD[5]} className={classes.responsiveHide}>{t(`passes.table.${TABLE_HEAD[5]}`)}</th>
									<th key={TABLE_HEAD[6]} className={classes.responsiveHide}>{t(`passes.table.${TABLE_HEAD[6]}`)}</th>
								</tr>
							</thead>
							<tbody>
								{isLogsLoading ? (
									<tr>
										<td colSpan={7} className={classes.passesPage__empty}>{t("passes.table.loading")}</td>
									</tr>
								) : filteredRows.length > 0 ? (
									filteredRows.map((row) => (
										<tr key={`${row.eventTime}${row.login}`}>
											<td>{row.eventTime}</td>
											<td>{row.userName}</td>
											<td className={`${classes.passesPage__muted} ${classes.responsiveHide}`}>{row.login}</td>
											<td className={`${classes.passesPage__muted} ${classes.responsiveHide}`}>{row.scanner}</td>
											<td>
												<span
													className={`${classes.passesPage__status} ${
														row.result === "allowed"
															? classes["passesPage__status--allowed"]
															: classes["passesPage__status--denied"]
													}`}
												>
													{row.result === "allowed" ? t("passes.filter.results.allowed") : t("passes.filter.results.denied")}
												</span>
											</td>
											<td className={`${classes.passesPage__muted} ${classes.responsiveHide}`}>{row.reason}</td>
											<td className={`${classes.passesPage__muted} ${classes.responsiveHide}`}>{row.device}</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={7} className={classes.passesPage__empty}>{t("passes.table.empty")}</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>
			</Page>
		</MainLayout>
	);
});

export default PassesPage;
