import { memo } from "react";
import { Link } from "react-router-dom";
import { Page } from "@/widgets/Page";
import { clearAccessToken, useAdminLogoutMutation, useUserActions } from "@/entities/User";
import { getRouteLogin, getRouteRegister, getRouteUsers } from "@/shared/consts/router";
import { useAppSelector } from "@/shared/lib/hooks";
import { ThemeSwitcher } from "@/features/ThemeSwitcher";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import classes from "./MainPage.module.css";

const MainPage = memo(() => {
	const user = useAppSelector((state) => state.user.authData);
	const { clearAuthData } = useUserActions();
	const [adminLogout] = useAdminLogoutMutation();
	const { t, i18n } = useTranslation();

	const themeType = useAppSelector((state) => state.ui.themeStyles.type);

	const currentLang = (i18n.language || "ru").split("-")[0];

	const logoSrc = `/assets/Image/RGB_RT_logo-vertical_${themeType === "dark" ? "main" : "black"}_${currentLang}.png`;

	const onLogout = () => {
		adminLogout(undefined)
			.unwrap()
			.catch(() => undefined)
			.then(() => {
				clearAccessToken();
				clearAuthData();
			});
	};

	return (
		<Page>
			<div className={classes.floatingControls}>
				<ThemeSwitcher />
				<LanguageSwitcher />
			</div>
			
			<div className={classes.root}>
				<div className={classes.card}>
					<div className={classes.logoContainer}>
						<img
							src={logoSrc}
							alt={t("common.brand")}
							className={classes.logo}
						/>
					</div>

					<h1 className={classes.title}>{t("main.title")}</h1>

					{user ? (
						<div className={classes.authSection}>
							<div className={classes.userText}>
								{t("main.logged_as")} <span className={classes.username}>{user.username}</span>
							</div>
							<div className={classes.actions}>
								<Link to={getRouteUsers()} className={classes.link}>
									{t("main.go_to_users")}
								</Link>
								<button type="button" onClick={onLogout} className={classes.button}>
									{t("common.logout")}
								</button>
							</div>
						</div>
					) : (
						<div className={classes.authSection}>
							<p className={classes.userText}>{t("main.not_authorized")}</p>
							<div className={classes.actions}>
								<Link to={getRouteLogin()} className={classes.link}>
									{t("main.login")}
								</Link>
								<Link to={getRouteRegister()} className={classes.button} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									{t("main.register")}
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</Page>
	);
});

export default MainPage;
