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

	const logoSrc = `/assets/Image/RGB_RT_logo-vertical_${themeType === "dark" ? "black" : "main"}_${currentLang}.png`;

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
				<div className={classes.logoContainer}>
					<img
						src={logoSrc}
						alt={t("common.brand")}
						className={classes.logo}
						onLoad={() => console.log("LOGO SUCCESS: Loaded from", logoSrc)}
						onError={(e) => {
							console.error("LOGO ERROR: Failed to load", logoSrc);
							console.log("Current document.baseURI is", document.baseURI);
						}}
					/>
				</div>

				<h1 className={classes.title}>Главная страница</h1>

				{user ? (
					<div className={classes.authSection}>
						<p>
							Вы вошли как: <strong>{user.username}</strong>
						</p>
						<div className={classes.actions}>
							<Link to={getRouteUsers()} className={classes.link}>
								Перейти к пользователям
							</Link>
							<button type="button" onClick={onLogout} className={classes.button}>
								Выйти
							</button>
						</div>
					</div>
				) : (
					<div className={classes.authSection}>
						<p>Вы не авторизованы. Войдите, чтобы открыть страницу пользователей.</p>
						<div className={classes.actions}>
							<Link to={getRouteLogin()} className={classes.link}>
								Войти
							</Link>
							<Link to={getRouteRegister()} className={classes.link}>
								Зарегистрироваться
							</Link>
						</div>
					</div>
				)}
			</div>
		</Page>
	);
});

export default MainPage;
