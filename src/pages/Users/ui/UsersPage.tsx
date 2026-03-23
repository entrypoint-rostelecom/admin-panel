import {
	useCreateAdminUserMutation,
	useDeleteAdminUserMutation,
	useFreezeAdminUserMutation,
	useUnfreezeAdminUserMutation,
	useGetAdminUsersQuery,
	useGetAccessLogsQuery,
} from "@/entities/User";
import { memo, useMemo, useState } from "react";
import { Page } from "@/widgets/Page";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/widgets/MainLayout";
import classes from "./UsersPage.module.css";

type UserStatus = "active" | "blocked";

interface UserRow {
	id: number;
	fullName: string;
	login: string;
	status: UserStatus;
	passesToday: number;
}

const TABLE_HEAD = ["users.table.fullname", "users.table.login", "Приходов сегодня", "users.table.status", "users.table.action"];

const UsersPage = memo(() => {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newUser, setNewUser] = useState({
		fullName: "",
		login: "",
		password: "",
	});
	const [createUserError, setCreateUserError] = useState("");
	
	const { data: usersResponse = [], isLoading: isUsersLoading } = useGetAdminUsersQuery();
	const { data: logsResponse = [] } = useGetAccessLogsQuery();
	const [createAdminUser, { isLoading: isCreatingUser }] = useCreateAdminUserMutation();
	const [deleteAdminUser] = useDeleteAdminUserMutation();
	const [freezeAdminUser] = useFreezeAdminUserMutation();
	const [unfreezeAdminUser] = useUnfreezeAdminUserMutation();

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
		<MainLayout>
			<Page>
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
									<th key={TABLE_HEAD[0]}>{t(TABLE_HEAD[0])}</th>
									<th key={TABLE_HEAD[1]} className={classes.responsiveHide}>{t(TABLE_HEAD[1])}</th>
									<th key={TABLE_HEAD[2]} className={classes.responsiveHide}>{t(TABLE_HEAD[2])}</th>
									<th key={TABLE_HEAD[3]}>{t(TABLE_HEAD[3])}</th>
									<th key={TABLE_HEAD[4]}>{t(TABLE_HEAD[4])}</th>
								</tr>
							</thead>
							<tbody>
								{filteredUsers.map((user) => (
									<tr key={user.id}>
										<td>{user.fullName}</td>
										<td className={`${classes.usersPage__muted} ${classes.responsiveHide}`}>{user.login}</td>
										<td className={`${classes.usersPage__muted} ${classes.responsiveHide}`} style={{ fontWeight: 600 }}>{user.passesToday}</td>
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
			</Page>
			{isCreateOpen ? (
				<div className={classes.usersPage__modalBackdrop} onClick={() => setIsCreateOpen(false)}>
					<div className={classes.usersPage__modal} onClick={(event) => event.stopPropagation()}>
						<h3 className={classes.usersPage__modalTitle}>{t("users.modal.title")}</h3>
						<label className={classes.usersPage__modalLabel}>
							{t("users.modal.fullname.label")}
							<input
								value={newUser.fullName}
								onChange={(event) => setNewUser((prev: any) => ({ ...prev, fullName: event.target.value }))}
							/>
						</label>
						<label className={classes.usersPage__modalLabel}>
							{t("users.modal.login.label")}
							<input value={newUser.login} onChange={(event) => setNewUser((prev: any) => ({ ...prev, login: event.target.value }))} />
						</label>
						<label className={classes.usersPage__modalLabel}>
							{t("users.modal.password.label")}
							<input
								type="password"
								value={newUser.password}
								onChange={(event) => setNewUser((prev: any) => ({ ...prev, password: event.target.value }))}
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
		</MainLayout>
	);
});

export default UsersPage;
