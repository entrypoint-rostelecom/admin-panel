import { PayloadAction } from "@reduxjs/toolkit";
import { UISchema } from "../types/UISchema";
import { buildSlice } from "@/shared/lib/store/buildSlice";
import { darkTheme, lightTheme, Themes } from "@/app/styles";

const THEME_KEY = "rt-theme";

const getInitialTheme = () => {
	const saved = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
	if (saved === "dark") return darkTheme;
	if (saved === "light") return lightTheme;
	// Detect system preference
	if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
		return darkTheme;
	}
	return lightTheme;
};

const applyTheme = (theme: typeof lightTheme | typeof darkTheme) => {
	if (typeof document !== "undefined") {
		document.documentElement.setAttribute("data-theme", theme.type);
	}
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const initialState: UISchema = {
	scroll: {},
	themeStyles: initialTheme,
};

const UISlice = buildSlice({
	name: "ui",
	initialState,
	reducers: {
		setScrollPosition: (
			state,
			action: PayloadAction<{
				path: string;
				position: number;
			}>,
		) => {
			state.scroll[action.payload.path] = action.payload.position;
		},

		toggleTheme: (state) => {
			const nextTheme = state.themeStyles.type === Themes.light ? darkTheme : lightTheme;
			state.themeStyles = nextTheme;
			applyTheme(nextTheme);
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(THEME_KEY, nextTheme.type);
			}
		},
	},
});

export const { actions: UIActions, reducer: UIReducer, useActions: useUIActions } = UISlice;

