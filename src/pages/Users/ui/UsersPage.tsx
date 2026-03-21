import {
	clearAccessToken,
	useCreateAdminUserMutation,
	useDeleteAdminUserMutation,
	useFreezeAdminUserMutation,
	useUnfreezeAdminUserMutation,
	useGetAdminUsersQuery,
	useGetAccessLogsQuery,
	useAdminLogoutMutation,
	useUserActions,
	getUserData,
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
import { useTranslation } from "react-i18next";
import classes from "./UsersPage.module.css";

type UserStatus = "active" | "blocked";

interface UserRow {
	id: number;
	fullName: string;
	login: string;
	status: UserStatus;
	passesToday: number;
}

const NAV_ITEMS = [
	{ label: "sidebar.dashboard", path: getRouteDashboard() },
	{ label: "sidebar.users", path: getRouteUsers() },
	{ label: "sidebar.passes", path: getRoutePasses() },
	{ label: "sidebar.devices", path: getRouteDevices() },
	{ label: "sidebar.logs", path: getRouteSecurityLogs() },
];

const TABLE_HEAD = ["users.table.fullname", "users.table.login", "Приходов сегодня", "users.table.status", "users.table.action"];

const UsersPage = memo(() => {
	const { t } = useTranslation();
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
	const [createUserError, setCreateUserError] = useState("");
	const nav = useNavigate();
	const location = useLocation();
	const [adminLogout] = useAdminLogoutMutation();
	const { data: usersResponse = [], isLoading: isUsersLoading } = useGetAdminUsersQuery();
	const { data: logsResponse = [] } = useGetAccessLogsQuery();
	const [createAdminUser, { isLoading: isCreatingUser }] = useCreateAdminUserMutation();
	const [deleteAdminUser] = useDeleteAdminUserMutation();
	const [freezeAdminUser] = useFreezeAdminUserMutation();
	const [unfreezeAdminUser] = useUnfreezeAdminUserMutation();
	const { clearAuthData } = useUserActions();
	const users = useMemo<UserRow[]>(() => {
		const todayStr = new Date().toDateString();

		return usersResponse.map((user) => {
			const userLogs = logsResponse.filter(log => 
				Number(log.user_id) === Number(user.id) &&
				new Date(log.timestamp).toDateString() === todayStr
			);

			return {
				id: user.id,
				fullName: user.full_name,
				login: user.login,
				status: user.is_active ? "active" : "blocked",
				passesToday: userLogs.length,
			};
		});
	}, [usersResponse, logsResponse]);

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
		adminLogout(undefined)
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
			setCreateUserError(t("users.modal.error.empty"));
			return;
		}

		if (newUser.login.includes("@")) {
			setCreateUserError(t("users.modal.error.format"));
			return;
		}

		setCreateUserError("");
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
		} catch (e: any) {
			const backendMessage =
				e?.data?.detail?.[0]?.msg ||
				e?.data?.detail ||
				e?.data?.message ||
				t("users.modal.error.server");
			setCreateUserError(String(backendMessage));
		}
	};

	const onDeleteUser = async (userId: number) => {
		try {
			await deleteAdminUser(userId).unwrap();
		} catch (e) {
			// NOP
		}
	};

	const onFreezeUser = async (userId: number) => {
		try {
			await freezeAdminUser(userId).unwrap();
		} catch (e) {
			// NOP
		}
	};

	const onUnfreezeUser = async (userId: number) => {
		try {
			await unfreezeAdminUser(userId).unwrap();
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
							<p className={classes.usersPage__brandTitle}>{t("common.app_name")}</p>
							<p className={classes.usersPage__brandSubtitle}>{t("common.admin_panel")}</p>
						</div>
					</div>

					<button className={classes.usersPage__profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
						<span className={classes.usersPage__profileInfo}>
							<span className={classes.usersPage__profileName}>{getUserData()?.username || "Без имени"}</span>
							<span className={classes.usersPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.usersPage__profileAvatar}>{(getUserData()?.username || "U")[0].toUpperCase()}</span>
					</button>
					
					{isProfileOpen ? (
						<div className={classes.usersPage__profileMenu}>
							<button type="button" className={classes.usersPage__profileMenuButton} onClick={onLogout}>
								{t("common.logout")}
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
										<span className={classes.usersPage__navIcon}>
											{item.label === "sidebar.dashboard" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>}
											{item.label === "sidebar.users" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
											{item.label === "sidebar.passes" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
											{item.label === "sidebar.devices" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
											{item.label === "sidebar.logs" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
										</span>
										<span>{t(item.label)}</span>
									</button>
								);
							})}
						</nav>

					</aside>

					<section className={classes.usersPage__content}>
						<div className={classes.usersPage__contentHeader}>
							<div>
								<h1 className={classes.usersPage__title}>{t("users.title")}</h1>
								<p className={classes.usersPage__subtitle}>{t("users.subtitle")}</p>
							</div>
							<button className={classes.usersPage__createButton} type="button" onClick={() => setIsCreateOpen(true)}>
								<span className={classes.usersPage__plusIcon} />
								{t("users.button.create")}
							</button>
						</div>

						<div className={classes.usersPage__filters}>
							<div className={classes.usersPage__search}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
								<input
									className={classes.usersPage__searchInput}
									placeholder={t("users.search.placeholder")}
									value={search}
									onChange={(event) => setSearch(event.target.value)}
								/>
							</div>

							<div className={classes.usersPage__selectWrap}>
								<select
									className={classes.usersPage__filterSelect}
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value as any)}
								>
									<option value="all">{t("users.filter.all")}</option>
									<option value="active">{t("users.filter.active")}</option>
									<option value="blocked">{t("users.filter.blocked")}</option>
								</select>
							</div>
						</div>

						<div className={classes.usersPage__tableWrap}>
							<table className={classes.usersPage__table}>
								<thead>
									<tr>
										{TABLE_HEAD.map((head) => (
											<th key={head}>{t(head)}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredUsers.map((user) => (
										<tr key={user.id}>
											<td>{user.fullName}</td>
											<td className={classes.usersPage__muted}>{user.login}</td>
											<td className={classes.usersPage__muted} style={{ fontWeight: 600 }}>{user.passesToday}</td>
											<td>
												<span
													className={`${classes.usersPage__status} ${
														user.status === "active"
															? classes["usersPage__status--active"]
															: classes["usersPage__status--blocked"]
													}`}
												>
													<span className={classes.usersPage__statusDot} />
													{user.status === "active" ? t("users.filter.active") : t("users.filter.blocked")}
												</span>
											</td>
											<td>
												<div className={classes.usersPage__actions}>
													{user.status === "active" ? (
														<button
															type="button"
															className={classes.usersPage__freezeButton}
															onClick={() => onFreezeUser(user.id)}
														>
															{t("users.action.freeze")}
														</button>
													) : null}
													{user.status === "blocked" ? (
														<button
															type="button"
															className={classes.usersPage__unfreezeButton}
															onClick={() => onUnfreezeUser(user.id)}
														>
															{t("users.action.unfreeze")}
														</button>
													) : null}
													<button
														type="button"
														className={classes.usersPage__deleteButton}
														onClick={() => onDeleteUser(user.id)}
													>
														{t("users.action.delete")}
													</button>
												</div>
											</td>
										</tr>
									))}
									{isUsersLoading ? (
										<tr>
											<td colSpan={5} className={classes.usersPage__empty}>
												{t("users.table.loading")}
											</td>
										</tr>
									) : null}
									{filteredUsers.length === 0 ? (
										<tr>
											<td colSpan={5} className={classes.usersPage__empty}>
												{t("users.table.empty")}
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
						<h3 className={classes.usersPage__modalTitle}>{t("users.modal.title")}</h3>
						<label className={classes.usersPage__modalLabel}>
							{t("users.modal.fullname.label")}
							<input
								value={newUser.fullName}
								onChange={(event) => setNewUser((prev) => ({ ...prev, fullName: event.target.value }))}
							/>
						</label>
						<label className={classes.usersPage__modalLabel}>
							{t("users.modal.login.label")}
							<input value={newUser.login} onChange={(event) => setNewUser((prev) => ({ ...prev, login: event.target.value }))} />
						</label>
						<label className={classes.usersPage__modalLabel}>
							{t("users.modal.password.label")}
							<input
								type="password"
								value={newUser.password}
								onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
							/>
						</label>
						<div className={classes.usersPage__modalActions}>
							<button type="button" onClick={() => setIsCreateOpen(false)}>
								{t("common.cancel")}
							</button>
							<button type="button" onClick={onCreateUser} disabled={isCreatingUser}>
								{t("common.create")}
							</button>
						</div>
						{createUserError ? <p className={classes.usersPage__modalError}>{createUserError}</p> : null}
					</div>
				</div>
			) : null}
		</Page>
	);
});

export default UsersPage;
