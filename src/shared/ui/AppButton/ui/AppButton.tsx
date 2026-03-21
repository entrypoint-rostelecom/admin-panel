import { ButtonHTMLAttributes, ReactNode, memo } from "react";
import classes from "./AppButton.module.css";

type AppButtonVariant = "primary" | "secondary" | "nav" | "filter";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: AppButtonVariant;
	isActive?: boolean;
	icon?: ReactNode;
	iconPlaceholder?: boolean;
}

export const AppButton = memo((props: AppButtonProps) => {
	const { className, children, variant = "secondary", isActive = false, icon, iconPlaceholder = false, ...otherProps } = props;

	const modeClass = classes[`appButton--${variant}`];
	const activeClass = isActive ? classes["appButton--active"] : "";
	const customClass = className ?? "";

	return (
		<button className={`${classes.appButton} ${modeClass} ${activeClass} ${customClass}`} {...otherProps}>
			{icon ? <span className={classes.appButton__icon}>{icon}</span> : null}
			{!icon && iconPlaceholder ? <span className={classes.appButton__iconPlaceholder} /> : null}
			<span className={classes.appButton__content}>{children}</span>
		</button>
	);
});
