import { SignInDto, setAccessToken, useAdminSignInMutation, useUserActions } from "@/entities/User";
import { getRouteRegister, getRouteUsers } from "@/shared/consts/router";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
			<div className={classes.card}>
				<div className={classes.logoContainer}>
					<img 
						src="/assets/Image/RGB_RT_logo-horizontal_main_ru.png" 
						alt="Ростелеком" 
						className={classes.logo} 
					/>
				</div>

				<h1 className={classes.title}>Цифровой пропуск</h1>

				<form onSubmit={onSubmit} className={classes.form}>
					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="login">
							Имя пользователя:
						</label>
						<input
							id="login"
							className={classes.field}
							placeholder="Введите логин"
							value={authData.login}
							onChange={(e) => setAuthData((prev) => ({ ...prev, login: e.target.value }))}
						/>
					</div>

					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="password">
							Пароль:
						</label>
						<input
							id="password"
							className={classes.field}
							placeholder="Введите пароль"
							type="password"
							value={authData.password}
							onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
						/>
					</div>

					<button type="submit" className={classes.button} disabled={isLoading}>
						{isLoading ? "Вход..." : "Войти"}
					</button>

					{error ? <p className={classes.error}>{error}</p> : null}
				</form>

				<div className={classes.footer}>
					Нет аккаунта?{" "}
					<Link to={getRouteRegister()} className={classes.link}>
						Зарегистрируйтесь
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
