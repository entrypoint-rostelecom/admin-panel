import { SignInDto, UserRoles, setAccessToken, useUserActions } from "@/entities/User";
import { getRouteLogin, getRouteUsers } from "@/shared/consts/router";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classes from "./RegisterPage.module.css";

const RegisterPage = () => {
	const [authData, setAuthData] = useState<SignInDto>({
		login: "",
		password: "",
	});
	const [error, setError] = useState<string>("");
	const nav = useNavigate();
	const { setAuthData: setAuthDataRedux } = useUserActions();

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!authData.login.trim() || !authData.password.trim()) {
			setError("Введите логин и пароль");
			return;
		}

		setError("");
		const username = authData.login;
		setAccessToken("mock-token");
		setAuthDataRedux({
			id: "mock-user-id",
			username,
			roles: [UserRoles.ADMIN],
		});
		nav(getRouteUsers());
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

				<h1 className={classes.title}>Регистрация</h1>

				<form onSubmit={onSubmit} className={classes.form}>
					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="login">
							Логин:
						</label>
						<input
							id="login"
							className={classes.field}
							placeholder="Придумайте логин"
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
							placeholder="Придумайте пароль"
							type="password"
							value={authData.password}
							onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
						/>
					</div>
					<button type="submit" className={classes.button}>
						Создать аккаунт
					</button>
				</form>
				{error ? <p className={classes.error}>{error}</p> : null}

				<div className={classes.footer}>
					Уже есть аккаунт?{" "}
					<Link to={getRouteLogin()} className={classes.link}>
						Войти
					</Link>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
