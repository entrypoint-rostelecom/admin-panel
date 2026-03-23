import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const isDev = mode === "development";

	// Hardcoded defaults for public access
	const API_URL = env.VITE_API_URL || "http://194.113.106.44:8000";
	const API_LOGGING = env.VITE_API_LOGGING || "true";
	const SESSION_DURATION = env.VITE_SESSION_DURATION_HOURS || "4";

	return {
		plugins: [react()],
		define: {
			__IS_DEV__: JSON.stringify(isDev),
			// Используем пустую строку, чтобы запросы были относительными (для прокси в деве и Vercel в билде)
			__API__: JSON.stringify(""),
			__API_LOGGING__: JSON.stringify(API_LOGGING === "true"),
			__SESSION_DURATION_HOURS__: JSON.stringify(Number(SESSION_DURATION) || 4),
		},
		resolve: {
			alias: [{ find: "@", replacement: "/src" }],
		},
		server: {
			proxy: {
				"/api": {
					target: API_URL,
					changeOrigin: true,
				},
			},
		},
	};
});
