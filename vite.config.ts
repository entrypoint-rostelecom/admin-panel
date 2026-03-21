import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const isDev = mode === "development";

	return {
		plugins: [react()],
		define: {
			__IS_DEV__: JSON.stringify(isDev),
			// В деве используем пустую строку, чтобы работал прокси, в билде — полный URL
			__API__: JSON.stringify(isDev ? "" : env.VITE_API_URL),
			__API_LOGGING__: JSON.stringify(env.VITE_API_LOGGING === "true"),
			__SESSION_DURATION_HOURS__: JSON.stringify(Number(env.VITE_SESSION_DURATION_HOURS) || 4),
		},
		resolve: {
			alias: [{ find: "@", replacement: "/src" }],
		},
		server: {
			proxy: {
				"/api": {
					target: env.VITE_API_URL,
					changeOrigin: true,
				},
			},
		},
	};
});
