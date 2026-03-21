import { SignInDto, UserRoles, setAccessToken, useUserActions } from "@/entities/User";
import { getRouteUsers } from "@/shared/consts/router";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./RegisterPage.module.css";

const RegisterPage = () => {
	const [authData, setAuthData] = useState<SignInDto>({
		email: "",
		password: "",
	});
	const [error, setError] = useState<string>("");
	const nav = useNavigate();
	const { setAuthData: setAuthDataRedux } = useUserActions();

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!authData.email.trim() || !authData.password.trim()) {
			setError("Введите email и пароль");
			return;
		}

		setError("");
		const username = authData.email.split("@")[0] || "user";
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
				<button type="submit" className={classes.button}>
					Зарегистрироваться
				</button>
			</form>
			{error ? <p className={classes.error}>{error}</p> : null}
		</div>
	);
};

export default RegisterPage;
