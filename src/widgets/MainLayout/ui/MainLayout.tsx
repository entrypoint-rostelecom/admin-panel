import { FC, ReactNode, memo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
	clearAccessToken, 
	useAdminLogoutMutation, 
	useUserActions, 
	getUserData 
} from "@/entities/User";
import { 
	getRouteDashboard, 
	getRouteMain, 
	getRoutePasses, 
	getRouteSecurityLogs, 
	getRouteUsers 
} from "@/shared/consts/router";
import { ThemeSwitcher } from "@/features/ThemeSwitcher";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import classes from "./MainLayout.module.css";

interface MainLayoutProps {
	children: ReactNode;
}

const NAV_ITEMS = [
	{ id: "dashboard", label: "sidebar.dashboard", path: getRouteDashboard() },
	{ id: "users", label: "sidebar.users", path: getRouteUsers() },
	{ id: "passes", label: "sidebar.passes", path: getRoutePasses() },
	{ id: "logs", label: "sidebar.logs", path: getRouteSecurityLogs() },
];

export const MainLayout: FC<MainLayoutProps> = memo(({ children }) => {
	const { t, i18n } = useTranslation();
	const nav = useNavigate();
	const location = useLocation();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

	const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className={classes.mainLayout}>
			{/* TOPBAR */}
			<header className={classes.topbar}>
				<div className={classes.brand}>
					<button 
						className={classes.burger} 
						type="button" 
						onClick={toggleMobileMenu}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</button>
					<div className={classes.brandLogo}>Р</div>
					<div className={classes.brandText}>
						<p className={classes.brandTitle}>{t("common.app_name")}</p>
						<p className={classes.brandSubtitle}>{t("common.admin_panel")}</p>
					</div>
				</div>

				<div className={classes.topbarRight}>
					<ThemeSwitcher />
					<LanguageSwitcher />
					<button className={classes.profile} type="button" onClick={() => setIsProfileOpen((prev) => !prev)}>
						<span className={classes.profileInfo}>
							<span className={classes.profileName}>{getUserData()?.username || "Без имени"}</span>
							<span className={classes.profileRole}>Администратор</span>
						</span>
						<span className={classes.profileAvatar}>
							{(getUserData()?.username || "U")[0].toUpperCase()}
						</span>
					</button>
					
					{isProfileOpen ? (
						<div className={classes.profileMenu}>
							<button type="button" className={classes.profileMenuButton} onClick={onLogout}>
								{t("common.logout")}
							</button>
						</div>
					) : null}
				</div>
			</header>

			<div className={classes.layoutBody}>
				{/* SIDEBAR */}
				<aside className={`${classes.sidebar} ${isMobileMenuOpen ? classes["sidebar--open"] : ""}`}>
					<nav className={classes.nav}>
						{NAV_ITEMS.map((item) => {
							const isActive = location.pathname.includes(item.path.split('/')[2]);
							return (
								<button
									key={item.label}
									type="button"
									onClick={() => {
										const currentLang = location.pathname.split('/')[1] || 'ru';
										nav(item.path.replace(/^\/(ru|en)/, `/${currentLang}`));
										closeMobileMenu();
									}}
									className={`${classes.navItem} ${isActive ? classes["navItem--active"] : ""}`}
								>
									<span className={classes.navIcon}>
										{item.id === "dashboard" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>}
										{item.id === "users" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
										{item.id === "passes" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
										{item.id === "logs" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
									</span>
									<span className={classes.navLabel}>{t(item.label)}</span>
								</button>
							);
						})}
					</nav>
				</aside>

				{/* MOBILE OVERLAY */}
				{isMobileMenuOpen && (
					<div className={classes.mobileOverlay} onClick={closeMobileMenu} />
				)}

				{/* MAIN CONTENT */}
				<main className={classes.content}>
					{children}
				</main>
			</div>
		</div>
	);
});
