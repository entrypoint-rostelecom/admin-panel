import { clearAccessToken, useAdminLogoutMutation, useUserActions } from "@/entities/User";
import {
	getRouteDashboard,
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
import classes from "./SystemSettingsPage.module.css";

const NAV_ITEMS = [
	{ label: "Дашборд", path: getRouteDashboard() },
	{ label: "Заявки", path: getRouteRequests() },
	{ label: "Пользователи", path: getRouteUsers() },
	{ label: "Проходы", path: getRoutePasses() },
	{ label: "Настройка системы", path: getRouteSystemSettings() },
	{ label: "Логи безопасности", path: getRouteSecurityLogs() },
];

const SystemSettingsPage = memo(() => {
	const [qrLifetime, setQrLifetime] = useState(5);
	const [sessionHours, setSessionHours] = useState(8);
	const [blockScreenshots, setBlockScreenshots] = useState(true);
	const [reAuthOnDeviceChange, setReAuthOnDeviceChange] = useState(true);
	const [notifySuspicious, setNotifySuspicious] = useState(true);
	const [notifyStatusChange, setNotifyStatusChange] = useState(true);
	const [notifyAdminLogins, setNotifyAdminLogins] = useState(false);
	const [notifyScannerOffline, setNotifyScannerOffline] = useState(false);
	const [notifyBulkOps, setNotifyBulkOps] = useState(false);
	const [adminEmail, setAdminEmail] = useState("admin@rostelecom.ru");
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

	return (
		<Page>
			<div className={classes.systemSettingsPage}>
				<header className={classes.systemSettingsPage__topbar}>
					<div className={classes.systemSettingsPage__brand}>
						<div className={classes.systemSettingsPage__brandLogo}>Р</div>
						<div className={classes.systemSettingsPage__brandText}>
							<p className={classes.systemSettingsPage__brandTitle}>Точка входа</p>
							<p className={classes.systemSettingsPage__brandSubtitle}>Админ-панель</p>
						</div>
					</div>

					<button className={classes.systemSettingsPage__profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
						<span className={classes.systemSettingsPage__profileInfo}>
							<span className={classes.systemSettingsPage__profileName}>Иванова А.С.</span>
							<span className={classes.systemSettingsPage__profileRole}>Администратор</span>
						</span>
						<span className={classes.systemSettingsPage__profileAvatar}>AS</span>
					</button>
					{isProfileOpen ? (
						<div className={classes.systemSettingsPage__profileMenu}>
							<button type="button" className={classes.systemSettingsPage__profileMenuButton} onClick={onLogout}>
								Выйти
							</button>
						</div>
					) : null}
				</header>

				<div className={classes.systemSettingsPage__layout}>
					<aside className={classes.systemSettingsPage__sidebar}>
						<nav className={classes.systemSettingsPage__nav}>
							{NAV_ITEMS.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<AppButton
										key={item.label}
										type="button"
										onClick={() => nav(item.path)}
										variant="nav"
										isActive={isActive}
										iconPlaceholder
										className={classes.systemSettingsPage__navItem}
									>
										<span>{item.label}</span>
									</AppButton>
								);
							})}
						</nav>
						<div className={classes.systemSettingsPage__sidebarFooter}>
							<div className={classes.systemSettingsPage__sidebarMark}>Р</div>
							<div>
								<p className={classes.systemSettingsPage__sidebarName}>Ростелеком</p>
								<p className={classes.systemSettingsPage__sidebarSubname}>Точка входа</p>
							</div>
						</div>
					</aside>

					<section className={classes.systemSettingsPage__content}>
						<div>
							<h1 className={classes.systemSettingsPage__title}>Настройки системы</h1>
							<p className={classes.systemSettingsPage__subtitle}>Глобальные параметры безопасности и правил</p>
						</div>

						<div className={classes.systemSettingsPage__card}>
							<h3 className={classes.systemSettingsPage__cardTitle}>QR-код и сессии</h3>
							<p className={classes.systemSettingsPage__cardSubtitle}>Управление временем жизни</p>

							<label className={classes.systemSettingsPage__field}>
								<span>Время действия QR-кода (минуты)</span>
								<input
									type="range"
									min={1}
									max={15}
									value={qrLifetime}
									onChange={(event) => setQrLifetime(Number(event.target.value))}
								/>
								<strong>{qrLifetime}</strong>
							</label>

							<label className={classes.systemSettingsPage__field}>
								<span>Максимальное время сеанса (часы)</span>
								<input
									type="range"
									min={1}
									max={24}
									value={sessionHours}
									onChange={(event) => setSessionHours(Number(event.target.value))}
								/>
								<strong>{sessionHours}</strong>
							</label>
						</div>

						<div className={classes.systemSettingsPage__card}>
							<h3 className={classes.systemSettingsPage__cardTitle}>Безопасность мобильного приложения</h3>
							<p className={classes.systemSettingsPage__cardSubtitle}>Защита данных</p>
							<div className={classes.systemSettingsPage__checks}>
								<label>
									<input
										type="checkbox"
										checked={blockScreenshots}
										onChange={(event) => setBlockScreenshots(event.target.checked)}
									/>
									<span>Запретить скриншоты в приложении</span>
								</label>
								<label>
									<input
										type="checkbox"
										checked={reAuthOnDeviceChange}
										onChange={(event) => setReAuthOnDeviceChange(event.target.checked)}
									/>
									<span>Повторная авторизация при смене устройства</span>
								</label>
							</div>
						</div>

						<div className={classes.systemSettingsPage__card}>
							<h3 className={classes.systemSettingsPage__cardTitle}>Уведомления</h3>
							<p className={classes.systemSettingsPage__cardSubtitle}>Настройка оповещений</p>
							<div className={classes.systemSettingsPage__checks}>
								<label>
									<input
										type="checkbox"
										checked={notifySuspicious}
										onChange={(event) => setNotifySuspicious(event.target.checked)}
									/>
									<span>Отправлять администратору e-mail при подозрительной активности</span>
								</label>
								<label>
									<input
										type="checkbox"
										checked={notifyStatusChange}
										onChange={(event) => setNotifyStatusChange(event.target.checked)}
									/>
									<span>Уведомлять пользователя об изменении статуса доступа</span>
								</label>
								<label>
									<input
										type="checkbox"
										checked={notifyAdminLogins}
										onChange={(event) => setNotifyAdminLogins(event.target.checked)}
									/>
									<span>Уведомлять о новых входах администраторов</span>
								</label>
								<label>
									<input
										type="checkbox"
										checked={notifyBulkOps}
										onChange={(event) => setNotifyBulkOps(event.target.checked)}
									/>
									<span>Уведомлять о массовых операциях (блокировки, выгрузки)</span>
								</label>
								<label>
									<input
										type="checkbox"
										checked={notifyScannerOffline}
										onChange={(event) => setNotifyScannerOffline(event.target.checked)}
									/>
									<span>Уведомлять, когда сканер переходит в режим оффлайн</span>
								</label>
							</div>
							<label className={classes.systemSettingsPage__emailField}>
								<span>E-mail администратора для уведомлений</span>
								<input value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
							</label>
						</div>

						<div className={classes.systemSettingsPage__card}>
							<h3 className={classes.systemSettingsPage__cardTitle}>Брендинг</h3>
							<p className={classes.systemSettingsPage__cardSubtitle}>Оформление мобильного приложения</p>
							<div className={classes.systemSettingsPage__brandPreview}>
								<div className={classes.systemSettingsPage__brandBadge}>Р</div>
								<div>
									<p>Ростелеком</p>
									<p>Точка входа</p>
								</div>
							</div>
							<label className={classes.systemSettingsPage__emailField}>
								<span>Основной цвет (корпоративный)</span>
								<input value="#7700FF" readOnly />
							</label>
						</div>

						<div className={classes.systemSettingsPage__actions}>
							<AppButton type="button" variant="secondary" className={classes.systemSettingsPage__cancelButton}>
								Отменить
							</AppButton>
							<AppButton type="button" variant="primary" className={classes.systemSettingsPage__saveButton} iconPlaceholder>
								Сохранить все настройки
							</AppButton>
						</div>
					</section>
				</div>
			</div>
		</Page>
	);
});

export default SystemSettingsPage;
