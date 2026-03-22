import { SignInDto, UserRoles, setAccessToken, useUserActions } from "@/entities/User";
import { getRouteLogin, getRouteUsers } from "@/shared/consts/router";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "@/features/ThemeSwitcher";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import classes from "./RegisterPage.module.css";

const RegisterPage = () => {
	const { t } = useTranslation();
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
			setError(t("register.error.empty"));
			return;
		}

		setError("");
		const username = authData.login;
		setAccessToken("mock-token", { id: "mock-user-id", username, roles: [UserRoles.ADMIN] });
		setAuthDataRedux({
			id: "mock-user-id",
			username,
			roles: [UserRoles.ADMIN],
		});
		nav(getRouteUsers());
	};

	return (
		<div className={classes.root}>
			<div className={classes.floatingControls}>
				<ThemeSwitcher />
				<LanguageSwitcher />
			</div>
			<div className={classes.card}>
				<div className={classes.logoContainer}>
					<img 
						src="/assets/Image/RGB_RT_logo-horizontal_main_ru.png" 
						alt={t("common.brand")} 
						className={classes.logo} 
					/>
				</div>

				<h1 className={classes.title}>{t("register.title")}</h1>

				<form onSubmit={onSubmit} className={classes.form}>
					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="login">
							{t("register.label.username")}
						</label>
						<input
							id="login"
							className={classes.field}
							placeholder={t("register.placeholder.username")}
							value={authData.login}
							onChange={(e) => setAuthData((prev) => ({ ...prev, login: e.target.value }))}
						/>
					</div>
					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="password">
							{t("register.label.password")}
						</label>
						<input
							id="password"
							className={classes.field}
							placeholder={t("register.placeholder.password")}
							type="password"
							value={authData.password}
							onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
						/>
					</div>
					<button type="submit" className={classes.button}>
						{t("register.button.submit")}
					</button>
				</form>
				{error ? <p className={classes.error}>{error}</p> : null}

				<div className={classes.footer}>
					{t("register.footer.text")}{" "}
					<Link to={getRouteLogin()} className={classes.link}>
						{t("register.footer.link")}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
