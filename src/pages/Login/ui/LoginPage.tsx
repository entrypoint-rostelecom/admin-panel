import { SignInDto, setAccessToken, useAdminSignInMutation, useUserActions } from "@/entities/User";
import { getRouteRegister, getRouteUsers } from "@/shared/consts/router";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "@/features/ThemeSwitcher";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import classes from "./LoginPage.module.css";

const LoginPage = () => {
	const { t } = useTranslation();
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
			setError(t("login.error.empty"));
			return;
		}

		setError("");
		try {
			const response = await adminSignIn(authData).unwrap();
			setAccessToken(response.accessToken, response);
			setAuthDataRedux(response);
			nav(getRouteUsers());
		} catch (e) {
			setError(t("login.error.invalid"));
		}
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

				<h1 className={classes.title}>{t("login.title")}</h1>

				<form onSubmit={onSubmit} className={classes.form}>
					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="login">
							{t("login.label.username")}
						</label>
						<input
							id="login"
							className={classes.field}
							placeholder={t("login.placeholder.username")}
							value={authData.login}
							onChange={(e) => setAuthData((prev) => ({ ...prev, login: e.target.value }))}
						/>
					</div>

					<div className={classes.fieldGroup}>
						<label className={classes.label} htmlFor="password">
							{t("login.label.password")}
						</label>
						<input
							id="password"
							className={classes.field}
							placeholder={t("login.placeholder.password")}
							type="password"
							value={authData.password}
							onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
						/>
					</div>

					<button type="submit" className={classes.button} disabled={isLoading}>
						{isLoading ? t("login.button.loading") : t("login.button.submit")}
					</button>

					{error ? <p className={classes.error}>{error}</p> : null}
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
