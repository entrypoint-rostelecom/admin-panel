import { SignInDto, useSignInMutation, useUserActions } from "@/entities/User";
import { USER_ACCESS_TOKEN } from "@/shared/consts/localStorage";
import { getRouteMain } from "@/shared/consts/router";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./LoginPage.module.css";

const LoginPage = () => {
	const [authData, setAuthData] = useState<SignInDto>({
		email: "",
		password: "",
	});
	const [signIn, { isLoading, error }] = useSignInMutation();
	const nav = useNavigate();
	const { setAuthData: setAuthDataRedux } = useUserActions();

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		signIn(authData)
			.unwrap()
			.then((user) => {
				localStorage.setItem(USER_ACCESS_TOKEN, user.accessToken);
				setAuthDataRedux(user);
				nav(getRouteMain());
			})
			.catch(() => {
				// ошибка уже отобразится ниже через error
			});
	};

	return (
		<div className={classes.root}>
			<p className={classes.hint}>
				Для входа используйте логин/пароль: <b>admin / admin</b>.
			</p>
			<form onSubmit={onSubmit}>
				<input
					className={classes.field}
					placeholder="Email"
					value={authData.email}
					onChange={(e) => setAuthData((prev) => ({ ...prev, email: e.target.value }))}
				/>
				<input
					className={classes.field}
					placeholder="Пароль"
					type="password"
					value={authData.password}
					onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
				/>
				<button type="submit" disabled={isLoading} className={classes.button}>
					{isLoading ? "Входим..." : "Войти"}
				</button>
			</form>
			{error ? <p className={classes.error}>Неверный логин или пароль</p> : null}
		</div>
	);
};

export default LoginPage;
