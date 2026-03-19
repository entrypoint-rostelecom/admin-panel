import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => ({
	plugins: [react()],
	define: {
		__IS_DEV__: JSON.stringify(mode === "development"),
		__API__: JSON.stringify("http://5.167.122.236:8000"),
		__API_LOGGING__: JSON.stringify(true),
	},
	resolve: {
		alias: [{ find: "@", replacement: "/src" }],
	},
}));
