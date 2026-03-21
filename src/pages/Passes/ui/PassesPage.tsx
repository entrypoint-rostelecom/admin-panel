import { clearAccessToken, useAdminLogoutMutation, useUserActions } from "@/entities/User";
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
import { memo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppButton } from "@/shared/ui";
import { Page } from "@/widgets/Page";
import classes from "./PassesPage.module.css";

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
	{ label: "Дашборд", path: getRouteDashboard() },
	{ label: "Пользователи", path: getRouteUsers() },
	{ label: "Проходы", path: getRoutePasses() },
	{ label: "Устройства", path: getRouteDevices() },
	{ label: "Логи безопасности", path: getRouteSecurityLogs() },
];

const TABLE_HEAD = ["Время события", "Пользователь", "Логин", "Сканер", "Результат", "Причина отказа", "Устройство"];

const PASS_ROWS: PassRow[] = [
	{
		eventTime: "20.03.2026 14:32:15",
		userName: "Петров И.А.",
		login: "i.petrov",
		scanner: "Вход 1",
		result: "allowed",
		reason: "—",
		device: "iPhone 14 Pro",
	},
	{
		eventTime: "20.03.2026 14:28:42",
		userName: "Сидорова М.В.",
		login: "m.sidorova",
		scanner: "Вход 2",
		result: "denied",
		reason: "QR-код истёк",
		device: "Samsung Galaxy S23",
	},
	{
		eventTime: "20.03.2026 14:25:30",
		userName: "Иванов С.П.",
		login: "s.ivanov",
		scanner: "Вход 1",
		result: "allowed",
		reason: "—",
		device: "iPhone 15",
	},
	{
		eventTime: "20.03.2026 14:22:17",
		userName: "Козлова Е.Д.",
		login: "e.kozlova",
		scanner: "Вход 3",
		result: "denied",
		reason: "Нет доступа к офису",
		device: "iPhone 13",
	},
	{
		eventTime: "20.03.2026 14:18:03",
		userName: "Морозов А.К.",
		login: "a.morozov",
		scanner: "Вход 1",
		result: "allowed",
		reason: "—",
		device: "Pixel 8",
	},
];

const PassesPage = memo(() => {
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

	const [scannerFilter, setScannerFilter] = useState("Все сканеры");
	const [resultFilter, setResultFilter] = useState("Все результаты");

	const filteredRows = PASS_ROWS.filter((row) => {
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

	return (
		<Page>
			<div className={classes.passesPage}>
				<header className={classes.passesPage__topbar}>
					<div className={classes.passesPage__brand}>
						<div className={classes.passesPage__brandLogo}>Р</div>
						<div className={classes.passesPage__brandText}>
							<p className={classes.passesPage__brandTitle}>Точка входа</p>
							<p className={classes.passesPage__brandSubtitle}>Админ-панель</p>
						</div>
					</div>

					<button className={classes.passesPage__profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
						<span className={classes.passesPage__profileInfo}>
							<span className={classes.passesPage__profileName}>Иванова А.С.</span>
							<span className={classes.passesPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.passesPage__profileAvatar}>AS</span>
					</button>
					{isProfileOpen ? (
						<div className={classes.passesPage__profileMenu}>
							<button type="button" className={classes.passesPage__profileMenuButton} onClick={onLogout}>
								Выйти
							</button>
						</div>
					) : null}
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
										onClick={() => nav(item.path)}
										className={`${classes.passesPage__navItem} ${isActive ? classes["passesPage__navItem--active"] : ""}`}
									>
										<span className={classes.passesPage__navIcon}>
											{item.label === "Дашборд" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>}
											{item.label === "Пользователи" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
											{item.label === "Проходы" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
											{item.label === "Устройства" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
											{item.label === "Логи безопасности" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
										</span>
										<span>{item.label}</span>
									</button>
								);
							})}
						</nav>

					</aside>

					<section className={classes.passesPage__content}>
						<div className={classes.passesPage__contentHeader}>
							<div>
								<h1 className={classes.passesPage__title}>Проходы</h1>
								<p className={classes.passesPage__subtitle}>Журнал всех событий доступа</p>
							</div>
							<AppButton className={classes.passesPage__exportButton} type="button" variant="secondary" iconPlaceholder>
								Экспорт в CSV
							</AppButton>
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
									<option>Вход 1</option>
									<option>Вход 2</option>
									<option>Вход 3</option>
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
									{filteredRows.map((row) => (
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
									))}
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
