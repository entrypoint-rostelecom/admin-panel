import { clearAccessToken, useAdminLogoutMutation, useUserActions, getUserData } from "@/entities/User";
import {
	getRouteDashboard,
	getRouteMain,
	getRoutePasses,
	getRouteRequests,
	getRouteSecurityLogs,
	getRouteSystemSettings,
	getRouteUsers,
} from "@/shared/consts/router";
import { 
	useGetAdminUsersQuery, 
	useGetAccessLogsQuery 
} from "@/entities/User";
import { memo, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppButton } from "@/shared/ui";
import { Page } from "@/widgets/Page";
import { exportToCsv } from "@/shared/lib/exportToCsv/exportToCsv";
import classes from "./PassesPage.module.css";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { ThemeSwitcher } from "@/features/ThemeSwitcher";
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

const NAV_ITEMS = [
	{ id: "dashboard", label: "sidebar.dashboard", path: getRouteDashboard() },
	{ id: "users", label: "sidebar.users", path: getRouteUsers() },
	{ id: "passes", label: "sidebar.passes", path: getRoutePasses() },
	{ id: "logs", label: "sidebar.logs", path: getRouteSecurityLogs() },
];

const TABLE_HEAD = ["Время события", "Пользователь", "Логин", "Сканер", "Результат", "Причина отказа", "Устройство"];

const PassesPage = memo(() => {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const nav = useNavigate();
	const location = useLocation();
	const [adminLogout] = useAdminLogoutMutation();
	const { clearAuthData } = useUserActions();

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

	const { data: users = [] } = useGetAdminUsersQuery();
	const { data: logs = [], isLoading: isLogsLoading } = useGetAccessLogsQuery();

	const [scannerFilter, setScannerFilter] = useState("Все сканеры");
	const [resultFilter, setResultFilter] = useState("Все результаты");

	const tableData = useMemo(() => {
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
				device: "—" // AccessLog does not have device field
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
			
			const matchesScanner = scannerFilter === "Все сканеры" || row.scanner === scannerFilter;
			const matchesResult = resultFilter === "Все результаты" || 
				(resultFilter === "Разрешён" && row.result === "allowed") || 
				(resultFilter === "Запрещён" && row.result === "denied");

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
		<Page>
			<div className={classes.passesPage}>
				<header className={classes.passesPage__topbar}>
					<div className={classes.passesPage__brand}>
						<div className={classes.passesPage__brandLogo}>Р</div>
						<div className={classes.passesPage__brandText}>
							<p className={classes.passesPage__brandTitle}>{t("common.app_name")}</p>
							<p className={classes.passesPage__brandSubtitle}>{t("common.admin_panel")}</p>
						</div>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<ThemeSwitcher />
						<LanguageSwitcher />
						<button className={classes.passesPage__profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
							<span className={classes.passesPage__profileInfo}>
								<span className={classes.passesPage__profileName}>{getUserData()?.username || "Без имени"}</span>
							<span className={classes.passesPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.passesPage__profileAvatar}>{(getUserData()?.username || "U")[0].toUpperCase()}</span>
					</button>
					{isProfileOpen ? (
						<div className={classes.passesPage__profileMenu}>
							<button type="button" className={classes.passesPage__profileMenuButton} onClick={onLogout}>
								{t("common.logout")}
							</button>
						</div>
					) : null}
					</div>
				</header>

				<div className={classes.passesPage__layout}>
					<aside className={classes.passesPage__sidebar}>
						<nav className={classes.passesPage__nav}>
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
										className={`${classes.passesPage__navItem} ${isActive ? classes["passesPage__navItem--active"] : ""}`}
									>
										<span className={classes.passesPage__navIcon}>
											{item.id === "dashboard" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>}
											{item.id === "users" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
											{item.id === "passes" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
											{item.id === "logs" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
										</span>
										<span>{t(item.label)}</span>
									</button>
								);
							})}
						</nav>

					</aside>

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
								Экспорт в CSV
							</button>
						</div>

						<div className={classes.passesPage__filters}>
							<div className={classes.passesPage__search}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
								<input
									className={classes.passesPage__searchInput}
									placeholder="Поиск по ФИО или логину..."
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
									<option>Все сканеры</option>
									{Array.from(new Set(logs.map(l => `Вход ${l.scanner_id}`))).sort().map(s => (
										<option key={s}>{s}</option>
									))}
								</select>
							</div>
							<div className={classes.passesPage__selectWrap}>
								<select 
									className={classes.passesPage__filterSelect}
									value={resultFilter}
									onChange={(e) => setResultFilter(e.target.value)}
								>
									<option>Все результаты</option>
									<option>Разрешён</option>
									<option>Запрещён</option>
								</select>
							</div>
						</div>

						<div className={classes.passesPage__tableWrap}>
							<table className={classes.passesPage__table}>
								<thead>
									<tr>
										{TABLE_HEAD.map((head) => (
											<th key={head}>{head}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{isLogsLoading ? (
										<tr>
											<td colSpan={7} style={{textAlign: "center", padding: "32px", color: "#667085"}}>Загрузка данных...</td>
										</tr>
									) : filteredRows.length > 0 ? (
										filteredRows.map((row) => (
											<tr key={`${row.eventTime}${row.login}`}>
												<td>{row.eventTime}</td>
												<td>{row.userName}</td>
												<td className={classes.passesPage__muted}>{row.login}</td>
												<td className={classes.passesPage__muted}>{row.scanner}</td>
												<td>
													<span
														className={`${classes.passesPage__status} ${
															row.result === "allowed"
																? classes["passesPage__status--allowed"]
																: classes["passesPage__status--denied"]
														}`}
													>
														{row.result === "allowed" ? "Разрешён" : "Запрещён"}
													</span>
												</td>
												<td className={classes.passesPage__muted}>{row.reason}</td>
												<td className={classes.passesPage__muted}>{row.device}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={7} style={{textAlign: "center", padding: "32px", color: "#667085"}}>События не найдены</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</Page>
	);
});

export default PassesPage;
