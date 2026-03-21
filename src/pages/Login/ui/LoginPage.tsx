import { SignInDto, setAccessToken, useAdminSignInMutation, useUserActions } from "@/entities/User";
import { getRouteUsers } from "@/shared/consts/router";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./LoginPage.module.css";

const LoginPage = () => {
	const [authData, setAuthData] = useState<SignInDto>({
		login: "",
		password: "",
	});
	const [error, setError] = useState<string>("");
	const nav = useNavigate();
	const { setAuthData: setAuthDataRedux } = useUserActions();
	const [adminSignIn, { isLoading }] = useAdminSignInMutation();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!authData.login.trim() || !authData.password.trim()) {
			setError("Заполните логин и пароль");
			return;
		}

		setError("");
		try {
			const response = await adminSignIn(authData).unwrap();
			setAccessToken(response.accessToken);
			setAuthDataRedux(response);
			nav(getRouteUsers());
		} catch (e) {
			setError("Неверный логин или пароль");
		}
	};

	return (
		<div className={classes.root}>
			<p className={classes.hint}>
				Для входа используйте логин/пароль:
			</p>
			<form onSubmit={onSubmit}>
				<input
					className={classes.field}
					placeholder="Логин"
					value={authData.login}
					onChange={(e) => setAuthData((prev) => ({ ...prev, login: e.target.value }))}
				/>
				<input
					className={classes.field}
					placeholder="Пароль"
					type="password"
					value={authData.password}
					onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
				/>
				<button type="submit" className={classes.button} disabled={isLoading}>
					Войти
				</button>
			</form>
			{error ? <p className={classes.error}>{error}</p> : null}
		</div>
	);
};

export default LoginPage;
