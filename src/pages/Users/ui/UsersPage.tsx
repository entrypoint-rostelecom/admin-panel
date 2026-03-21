import { clearAccessToken, useSignOutMutation, useUserActions } from "@/entities/User";
import { getRouteMain } from "@/shared/consts/router";
import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/widgets/Page";
import classes from "./UsersPage.module.css";

type UserStatus = "active" | "blocked";

interface UserRow {
	fullName: string;
	login: string;
	role: string;
	office: string;
	status: UserStatus;
	lastLogin: string;
	lastPass: string;
	passesToday: number;
}

const NAV_ITEMS = [
	"Дашборд",
	"Заявки",
	"Пользователи",
	"Проходы",
	"Устройства",
	"Настройки системы",
	"Логи безопасности",
];

const TABLE_HEAD = ["ФИО", "Логин", "Роль", "Офис", "Статус", "Последний вход", "Последний проход", "Проходов сегодня"];

const INITIAL_USERS: UserRow[] = [
	{
		fullName: "Петров Иван Александрович",
		login: "i.petrov",
		role: "Сотрудник",
		office: "Москва",
		status: "active",
		lastLogin: "20.03.2026 14:30",
		lastPass: "20.03.2026 09:15, Вход 1",
		passesToday: 2,
	},
	{
		fullName: "Сидорова Мария Викторовна",
		login: "m.sidorova",
		role: "Сотрудник",
		office: "Санкт-Петербург",
		status: "active",
		lastLogin: "20.03.2026 14:28",
		lastPass: "20.03.2026 09:00, Вход 2",
		passesToday: 2,
	},
	{
		fullName: "Иванов Сергей Петрович",
		login: "s.ivanov",
		role: "Администратор",
		office: "Москва",
		status: "active",
		lastLogin: "20.03.2026 14:25",
		lastPass: "20.03.2026 08:45, Вход 1",
		passesToday: 1,
	},
	{
		fullName: "Козлова Елена Дмитриевна",
		login: "e.kozlova",
		role: "Сотрудник",
		office: "Казань",
		status: "blocked",
		lastLogin: "15.03.2026 10:20",
		lastPass: "15.03.2026 09:30, Вход 1",
		passesToday: 0,
	},
	{
		fullName: "Морозов Алексей Константинович",
		login: "a.morozov",
		role: "Охрана",
		office: "Москва",
		status: "active",
		lastLogin: "20.03.2026 08:00",
		lastPass: "20.03.2026 08:00, Вход 3",
		passesToday: 1,
	},
];

const UsersPage = memo(() => {
	const [activeNavItem, setActiveNavItem] = useState("Пользователи");
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
	const [officeFilter, setOfficeFilter] = useState("all");
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [isOfficeOpen, setIsOfficeOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [users, setUsers] = useState(INITIAL_USERS);
	const [newUser, setNewUser] = useState({
		fullName: "",
		login: "",
		password: "",
	});
	const nav = useNavigate();
	const [signOut] = useSignOutMutation();
	const { clearAuthData } = useUserActions();

	const offices = useMemo(() => {
		const unique = new Set<string>();
		users.forEach((user) => unique.add(user.office));
		return ["all", ...Array.from(unique)];
	}, [users]);

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			const normalizedSearch = search.trim().toLowerCase();
			const matchesSearch =
				!normalizedSearch ||
				user.fullName.toLowerCase().includes(normalizedSearch) ||
				user.login.toLowerCase().includes(normalizedSearch) ||
				`${user.login}@rtk.local`.toLowerCase().includes(normalizedSearch);
			const matchesStatus = statusFilter === "all" || user.status === statusFilter;
			const matchesOffice = officeFilter === "all" || user.office === officeFilter;
			return matchesSearch && matchesStatus && matchesOffice;
		});
	}, [users, search, statusFilter, officeFilter]);

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

	const onCreateUser = () => {
		if (!newUser.fullName.trim() || !newUser.login.trim() || !newUser.password.trim()) {
			return;
		}

		const createdUser: UserRow = {
			fullName: newUser.fullName.trim(),
			login: newUser.login.trim(),
			role: "Сотрудник",
			office: "Москва",
			status: "active",
			lastLogin: "—",
			lastPass: "—",
			passesToday: 0,
		};

		setUsers((prev) => [createdUser, ...prev]);
		setNewUser({
			fullName: "",
			login: "",
			password: "",
		});
		setIsCreateOpen(false);
	};

	return (
		<Page>
			<div className={classes.usersPage}>
				<header className={classes.usersPage__topbar}>
					<div className={classes.usersPage__brand}>
						<div className={classes.usersPage__brandLogo}>Р</div>
						<div className={classes.usersPage__brandText}>
							<p className={classes.usersPage__brandTitle}>Точка входа</p>
							<p className={classes.usersPage__brandSubtitle}>Админ-панель</p>
						</div>
					</div>

					<button className={classes.usersPage__profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
						<span className={classes.usersPage__profileInfo}>
							<span className={classes.usersPage__profileName}>Иванова А.С.</span>
							<span className={classes.usersPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.usersPage__profileAvatar}>AS</span>
					</button>
					{isProfileOpen ? (
						<div className={classes.usersPage__profileMenu}>
							<button type="button" className={classes.usersPage__profileMenuButton} onClick={onLogout}>
								Выйти
							</button>
						</div>
					) : null}
				</header>

				<div className={classes.usersPage__layout}>
					<aside className={classes.usersPage__sidebar}>
						<nav className={classes.usersPage__nav}>
							{NAV_ITEMS.map((item) => {
								const isActive = item === activeNavItem;
								return (
									<button
										key={item}
										type="button"
										onClick={() => setActiveNavItem(item)}
										className={`${classes.usersPage__navItem} ${isActive ? classes["usersPage__navItem--active"] : ""}`}
									>
										<span className={classes.usersPage__navIcon} />
										<span>{item}</span>
									</button>
								);
							})}
						</nav>

						<div className={classes.usersPage__sidebarFooter}>
							<div className={classes.usersPage__sidebarMark}>Р</div>
							<div>
								<p className={classes.usersPage__sidebarName}>Ростелеком</p>
								<p className={classes.usersPage__sidebarSubname}>Точка входа</p>
							</div>
						</div>
					</aside>

					<section className={classes.usersPage__content}>
						<div className={classes.usersPage__contentHeader}>
							<div>
								<h1 className={classes.usersPage__title}>Пользователи системы</h1>
								<p className={classes.usersPage__subtitle}>Управление доступом сотрудников</p>
							</div>
							<button className={classes.usersPage__createButton} type="button" onClick={() => setIsCreateOpen(true)}>
								<span className={classes.usersPage__plusIcon} />
								Создать пользователя
							</button>
						</div>

						<div className={classes.usersPage__filters}>
							<div className={classes.usersPage__search}>
								<span className={classes.usersPage__searchIcon} />
								<input
									className={classes.usersPage__searchInput}
									placeholder="Поиск по ФИО, логину или e-mail..."
									value={search}
									onChange={(event) => setSearch(event.target.value)}
								/>
							</div>
							<button
								className={classes.usersPage__filterButton}
								type="button"
								onClick={() => {
									setIsStatusOpen((prev) => !prev);
									setIsOfficeOpen(false);
								}}
							>
								{statusFilter === "all" ? "Все статусы" : statusFilter === "active" ? "Активен" : "Заблокирован"}
								<span className={classes.usersPage__chevron} />
							</button>
							<button
								className={classes.usersPage__filterButton}
								type="button"
								onClick={() => {
									setIsOfficeOpen((prev) => !prev);
									setIsStatusOpen(false);
								}}
							>
								{officeFilter === "all" ? "Все офисы" : officeFilter}
								<span className={classes.usersPage__chevron} />
							</button>
							{isStatusOpen ? (
								<div className={classes.usersPage__dropdown}>
									<button
										type="button"
										onClick={() => {
											setStatusFilter("all");
											setIsStatusOpen(false);
										}}
									>
										Все статусы
									</button>
									<button
										type="button"
										onClick={() => {
											setStatusFilter("active");
											setIsStatusOpen(false);
										}}
									>
										Активен
									</button>
									<button
										type="button"
										onClick={() => {
											setStatusFilter("blocked");
											setIsStatusOpen(false);
										}}
									>
										Заблокирован
									</button>
								</div>
							) : null}
							{isOfficeOpen ? (
								<div className={`${classes.usersPage__dropdown} ${classes["usersPage__dropdown--office"]}`}>
									{offices.map((office) => (
										<button
											key={office}
											type="button"
											onClick={() => {
												setOfficeFilter(office);
												setIsOfficeOpen(false);
											}}
										>
											{office === "all" ? "Все офисы" : office}
										</button>
									))}
								</div>
							) : null}
						</div>

						<div className={classes.usersPage__tableWrap}>
							<table className={classes.usersPage__table}>
								<thead>
									<tr>
										{TABLE_HEAD.map((head) => (
											<th key={head}>{head}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredUsers.map((user) => (
										<tr key={user.login}>
											<td>{user.fullName}</td>
											<td className={classes.usersPage__muted}>{user.login}</td>
											<td className={classes.usersPage__muted}>{user.role}</td>
											<td className={classes.usersPage__muted}>{user.office}</td>
											<td>
												<span
													className={`${classes.usersPage__status} ${
														user.status === "active"
															? classes["usersPage__status--active"]
															: classes["usersPage__status--blocked"]
													}`}
												>
													<span className={classes.usersPage__statusDot} />
													{user.status === "active" ? "Активен" : "Заблокирован"}
												</span>
											</td>
											<td className={classes.usersPage__muted}>{user.lastLogin}</td>
											<td className={classes.usersPage__muted}>{user.lastPass}</td>
											<td>{user.passesToday}</td>
										</tr>
									))}
									{filteredUsers.length === 0 ? (
										<tr>
											<td colSpan={8} className={classes.usersPage__empty}>
												Нет пользователей по выбранным фильтрам
											</td>
										</tr>
									) : null}
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
			{isCreateOpen ? (
				<div className={classes.usersPage__modalBackdrop} onClick={() => setIsCreateOpen(false)}>
					<div className={classes.usersPage__modal} onClick={(event) => event.stopPropagation()}>
						<h3 className={classes.usersPage__modalTitle}>Создать пользователя</h3>
						<label className={classes.usersPage__modalLabel}>
							ФИО
							<input
								value={newUser.fullName}
								onChange={(event) => setNewUser((prev) => ({ ...prev, fullName: event.target.value }))}
							/>
						</label>
						<label className={classes.usersPage__modalLabel}>
							Логин
							<input value={newUser.login} onChange={(event) => setNewUser((prev) => ({ ...prev, login: event.target.value }))} />
						</label>
						<label className={classes.usersPage__modalLabel}>
							Пароль
							<input
								type="password"
								value={newUser.password}
								onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
							/>
						</label>
						<div className={classes.usersPage__modalActions}>
							<button type="button" onClick={() => setIsCreateOpen(false)}>
								Отмена
							</button>
							<button type="button" onClick={onCreateUser}>
								Создать
							</button>
						</div>
					</div>
				</div>
			) : null}
		</Page>
	);
});

export default UsersPage;
