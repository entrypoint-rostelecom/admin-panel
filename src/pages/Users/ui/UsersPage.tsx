import {
	clearAccessToken,
	useCreateAdminUserMutation,
	useDeleteAdminUserMutation,
	useFreezeAdminUserMutation,
	useUnfreezeAdminUserMutation,
	useGetAdminUsersQuery,
	useAdminLogoutMutation,
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
import { useTranslation } from "react-i18next";
import classes from "./UsersPage.module.css";

type UserStatus = "active" | "blocked";

interface UserRow {
	id: number;
	fullName: string;
	login: string;
	status: UserStatus;
}

const NAV_ITEMS = [
	{ label: "sidebar.dashboard", path: getRouteDashboard() },
	{ label: "sidebar.requests", path: getRouteRequests() },
	{ label: "sidebar.users", path: getRouteUsers() },
	{ label: "sidebar.passes", path: getRoutePasses() },
	{ label: "sidebar.devices", path: getRouteDevices() },
	{ label: "sidebar.settings", path: getRouteSystemSettings() },
	{ label: "sidebar.logs", path: getRouteSecurityLogs() },
];

const TABLE_HEAD = ["users.table.fullname", "users.table.login", "users.table.status", "users.table.action"];

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
	const [createAdminUser, { isLoading: isCreatingUser }] = useCreateAdminUserMutation();
	const [deleteAdminUser] = useDeleteAdminUserMutation();
	const [freezeAdminUser] = useFreezeAdminUserMutation();
	const [unfreezeAdminUser] = useUnfreezeAdminUserMutation();
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
							<span className={classes.usersPage__profileName}>Иванова А.С.</span>
							<span className={classes.usersPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.usersPage__profileAvatar}>AS</span>
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
										<span className={classes.usersPage__navIcon} />
										<span>{t(item.label)}</span>
									</button>
								);
							})}
						</nav>

						<div className={classes.usersPage__sidebarFooter}>
							<div className={classes.usersPage__sidebarMark}>Р</div>
							<div>
								<p className={classes.usersPage__sidebarName}>{t("common.brand")}</p>
								<p className={classes.usersPage__sidebarSubname}>{t("common.app_name")}</p>
							</div>
						</div>
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
								<span className={classes.usersPage__searchIcon} />
								<input
									className={classes.usersPage__searchInput}
									placeholder={t("users.search.placeholder")}
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
								{statusFilter === "all" ? t("users.filter.all") : statusFilter === "active" ? t("users.filter.active") : t("users.filter.blocked")}
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
										{t("users.filter.all")}
									</button>
									<button
										type="button"
										onClick={() => {
											setStatusFilter("active");
											setIsStatusOpen(false);
										}}
									>
										{t("users.filter.active")}
									</button>
									<button
										type="button"
										onClick={() => {
											setStatusFilter("blocked");
											setIsStatusOpen(false);
										}}
									>
										{t("users.filter.blocked")}
									</button>
								</div>
							) : null}
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
											<td colSpan={4} className={classes.usersPage__empty}>
												{t("users.table.loading")}
											</td>
										</tr>
									) : null}
									{filteredUsers.length === 0 ? (
										<tr>
											<td colSpan={4} className={classes.usersPage__empty}>
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
