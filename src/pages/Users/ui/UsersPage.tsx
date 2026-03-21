import {
	clearAccessToken,
	useCreateAdminUserMutation,
	useDeleteAdminUserMutation,
	useGetAdminUsersQuery,
	useSignOutMutation,
	useUserActions,
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
import { memo, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page } from "@/widgets/Page";
import classes from "./UsersPage.module.css";

type UserStatus = "active" | "blocked";

interface UserRow {
	id: number;
	fullName: string;
	login: string;
	status: UserStatus;
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

const TABLE_HEAD = ["ФИО", "Логин", "Статус", "Действие"];

const UsersPage = memo(() => {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newUser, setNewUser] = useState({
		fullName: "",
		login: "",
		password: "",
	});
	const nav = useNavigate();
	const location = useLocation();
	const [signOut] = useSignOutMutation();
	const { data: usersResponse = [], isLoading: isUsersLoading } = useGetAdminUsersQuery();
	const [createAdminUser, { isLoading: isCreatingUser }] = useCreateAdminUserMutation();
	const [deleteAdminUser] = useDeleteAdminUserMutation();
	const { clearAuthData } = useUserActions();
	const users = useMemo<UserRow[]>(
		() =>
			usersResponse.map((user) => ({
				id: user.id,
				fullName: user.full_name,
				login: user.login,
				status: user.is_active ? "active" : "blocked",
			})),
		[usersResponse],
	);

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			const normalizedSearch = search.trim().toLowerCase();
			const matchesSearch =
				!normalizedSearch ||
				user.fullName.toLowerCase().includes(normalizedSearch) ||
				user.login.toLowerCase().includes(normalizedSearch);
			const matchesStatus = statusFilter === "all" || user.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [users, search, statusFilter]);

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

	const onCreateUser = async () => {
		if (!newUser.fullName.trim() || !newUser.login.trim() || !newUser.password.trim()) {
			return;
		}

		try {
			await createAdminUser({
				full_name: newUser.fullName.trim(),
				login: newUser.login.trim(),
				password: newUser.password.trim(),
			}).unwrap();
			setNewUser({
				fullName: "",
				login: "",
				password: "",
			});
			setIsCreateOpen(false);
		} catch (e) {
			// Ошибку возвращает backend, оставляем форму открытой для исправления данных.
		}
	};

	const onDeleteUser = async (userId: number) => {
		try {
			await deleteAdminUser(userId).unwrap();
		} catch (e) {
			// NOP
		}
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
								const isActive = location.pathname === item.path;
								return (
									<button
										key={item.label}
										type="button"
										onClick={() => nav(item.path)}
										className={`${classes.usersPage__navItem} ${isActive ? classes["usersPage__navItem--active"] : ""}`}
									>
										<span className={classes.usersPage__navIcon} />
										<span>{item.label}</span>
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
								}}
							>
								{statusFilter === "all" ? "Все статусы" : statusFilter === "active" ? "Активен" : "Заблокирован"}
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
										<tr key={user.id}>
											<td>{user.fullName}</td>
											<td className={classes.usersPage__muted}>{user.login}</td>
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
											<td>
												<button
													type="button"
													className={classes.usersPage__deleteButton}
													onClick={() => onDeleteUser(user.id)}
												>
													Удалить
												</button>
											</td>
										</tr>
									))}
									{isUsersLoading ? (
										<tr>
											<td colSpan={4} className={classes.usersPage__empty}>
												Загрузка пользователей...
											</td>
										</tr>
									) : null}
									{filteredUsers.length === 0 ? (
										<tr>
											<td colSpan={4} className={classes.usersPage__empty}>
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
							<button type="button" onClick={onCreateUser} disabled={isCreatingUser}>
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
