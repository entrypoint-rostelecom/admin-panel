import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Page } from "@/widgets/Page";
import { useAppSelector } from "@/shared/lib/hooks";
import { Link } from "react-router-dom";
import { getRouteLogin, getRouteRegister } from "@/shared/consts/router";
import { useUserActions } from "@/entities/User";
import { USER_ACCESS_TOKEN } from "@/shared/consts/localStorage";
import classes from "./MainPage.module.css";

const MainPage = memo(() => {
	const { t } = useTranslation("main");
	const user = useAppSelector((state) => state.user.authData);
	const { setAuthData } = useUserActions();

	const onLogout = () => {
		localStorage.removeItem(USER_ACCESS_TOKEN);
		setAuthData(undefined as any);
	};

	return (
		<Page>
			<h1>{t("Главная страница")}</h1>

			<div className={classes.root}>
				{user ? (
					<>
						<p>
							Вы вошли как: <strong>{user.username}</strong>
						</p>
						<button onClick={onLogout}>Выйти</button>
					</>
				) : (
					<>
						<p>Вы не авторизованы.</p>
						<div className={classes.authInfo}>
							<Link to={getRouteLogin()}>Войти</Link>
							<Link to={getRouteRegister()}>Зарегистрироваться</Link>
						</div>
					</>
				)}
			</div>
		</Page>
	);
});

export default MainPage;
