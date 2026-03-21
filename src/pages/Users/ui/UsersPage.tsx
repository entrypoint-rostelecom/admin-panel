import { memo } from "react";
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

const USERS: UserRow[] = [
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

					<button className={classes.usersPage__profile} type="button">
						<span className={classes.usersPage__profileInfo}>
							<span className={classes.usersPage__profileName}>Иванова А.С.</span>
							<span className={classes.usersPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.usersPage__profileAvatar}>AS</span>
					</button>
				</header>

				<div className={classes.usersPage__layout}>
					<aside className={classes.usersPage__sidebar}>
						<nav className={classes.usersPage__nav}>
							{NAV_ITEMS.map((item) => {
								const isActive = item === "Пользователи";
								return (
									<button
										key={item}
										type="button"
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
							<button className={classes.usersPage__createButton} type="button">
								Создать пользователя
							</button>
						</div>

						<div className={classes.usersPage__filters}>
							<div className={classes.usersPage__search}>Поиск по ФИО, логину или e-mail...</div>
							<button className={classes.usersPage__filterButton} type="button">
								Все статусы
							</button>
							<button className={classes.usersPage__filterButton} type="button">
								Все офисы
							</button>
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
									{USERS.map((user) => (
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
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</Page>
	);
});

export default UsersPage;
