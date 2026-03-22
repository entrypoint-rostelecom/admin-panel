import { memo, useCallback } from "react";
import { useUIActions } from "@/features/UI";
import { useAppSelector } from "@/shared/lib/hooks";
import { Themes } from "@/app/styles";
import classes from "./ThemeSwitcher.module.css";
import { useTranslation } from "react-i18next";

export const ThemeSwitcher = memo(() => {
	const { toggleTheme } = useUIActions();
	const { type } = useAppSelector((state) => state.ui.themeStyles);
	const { t } = useTranslation();

	const isDark = type === Themes.dark;

	return (
		<div
			className={classes.switcher}
			onClick={() => toggleTheme()}
			role="radiogroup"
			aria-label="Theme Switcher"
		>
			<div className={`${classes.slider} ${isDark ? classes["slider--dark"] : ""}`} />
			
			<div 
				className={`${classes.segment} ${!isDark ? classes["segment--active"] : ""}`}
				role="radio"
				aria-checked={!isDark}
			>
				{t("theme_light", "Светлая")}
			</div>
			
			<div 
				className={`${classes.segment} ${isDark ? classes["segment--active"] : ""}`}
				role="radio"
				aria-checked={isDark}
			>
				{t("theme_dark", "Тёмная")}
			</div>
		</div>
	);
});


