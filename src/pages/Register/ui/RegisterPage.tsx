import { SignInDto, setAccessToken, useRegisterMutation, useUserActions } from "@/entities/User";
import { getRouteMain } from "@/shared/consts/router";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./RegisterPage.module.css";

const RegisterPage = () => {
	const [authData, setAuthData] = useState<SignInDto>({
		email: "",
		password: "",
	});
	const [register, { isLoading, error }] = useRegisterMutation();
	const nav = useNavigate();
	const { setAuthData: setAuthDataRedux } = useUserActions();

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		register(authData)
			.unwrap()
			.then((user) => {
				setAccessToken(user.accessToken);
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
				Введите логин/пароль
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
					{isLoading ? "Регистрируем..." : "Зарегистрироваться"}
				</button>
			</form>
			{error ? <p className={classes.error}>Ошибка при регистрации</p> : null}
		</div>
	);
};

export default RegisterPage;
