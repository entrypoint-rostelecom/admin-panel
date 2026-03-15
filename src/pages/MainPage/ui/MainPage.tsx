import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Page } from "@/widgets/Page";
import { useAppSelector } from "@/shared/lib/hooks";
import { Link } from "react-router-dom";
import { getRouteLogin, getRouteRegister } from "@/shared/consts/router";
import { clearAccessToken, useSignOutMutation, useUserActions } from "@/entities/User";
import { useGetMainDataQuery } from "../api/mainPageApi";
import classes from "./MainPage.module.css";

const MainPage = memo(() => {
	const { t } = useTranslation("main");
	const user = useAppSelector((state) => state.user.authData);
	const { clearAuthData } = useUserActions();
	const [signOut] = useSignOutMutation();
	const { data: mainData, isLoading: isMainDataLoading } = useGetMainDataQuery(undefined, {
		skip: !user,
	});

	const onLogout = () => {
		signOut(undefined)
			.unwrap()
			.catch(() => undefined)
			.then(() => {
				clearAccessToken();
				clearAuthData();
			});
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
						{isMainDataLoading ? <p>Загрузка данных главной...</p> : null}
						{mainData ? <p>Данные с сервера: {mainData.message}</p> : null}
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
