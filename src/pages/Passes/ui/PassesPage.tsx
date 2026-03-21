import { clearAccessToken, useSignOutMutation, useUserActions } from "@/entities/User";
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
	{ label: "Заявки", path: getRouteRequests() },
	{ label: "Пользователи", path: getRouteUsers() },
	{ label: "Проходы", path: getRoutePasses() },
	{ label: "Устройства", path: getRouteDevices() },
	{ label: "Настройка системы", path: getRouteSystemSettings() },
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
	const [signOut] = useSignOutMutation();
	const { clearAuthData } = useUserActions();

	const onLogout = () => {
		signOut(undefined)
			.unwrap()
			.catch(() => undefined)
			.finally(() => {
				clearAccessToken();
				clearAuthData();
				nav(getRouteMain());
			});
	};

	const filteredRows = PASS_ROWS.filter((row) => {
		const normalizedSearch = search.trim().toLowerCase();
		if (!normalizedSearch) {
			return true;
		}

		return (
			row.userName.toLowerCase().includes(normalizedSearch) ||
			row.login.toLowerCase().includes(normalizedSearch) ||
			row.scanner.toLowerCase().includes(normalizedSearch)
		);
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
										<span className={classes.passesPage__navIcon} />
										<span>{item.label}</span>
									</button>
								);
							})}
						</nav>

						<div className={classes.passesPage__sidebarFooter}>
							<div className={classes.passesPage__sidebarMark}>Р</div>
							<div>
								<p className={classes.passesPage__sidebarName}>Ростелеком</p>
								<p className={classes.passesPage__sidebarSubname}>Точка входа</p>
							</div>
						</div>
					</aside>

					<section className={classes.passesPage__content}>
						<div className={classes.passesPage__contentHeader}>
							<div>
								<h1 className={classes.passesPage__title}>Проходы</h1>
								<p className={classes.passesPage__subtitle}>Журнал всех событий доступа</p>
							</div>
							<button className={classes.passesPage__exportButton} type="button">
								Экспорт в CSV
							</button>
						</div>

						<div className={classes.passesPage__filters}>
							<div className={classes.passesPage__search}>
								<input
									className={classes.passesPage__searchInput}
									placeholder="Поиск по ФИО или логину..."
									value={search}
									onChange={(event) => setSearch(event.target.value)}
								/>
							</div>
							<button className={classes.passesPage__filterButton} type="button">
								Все сканеры
							</button>
							<button className={classes.passesPage__filterButton} type="button">
								Все результаты
							</button>
							<div className={classes.passesPage__dateRange} />
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
