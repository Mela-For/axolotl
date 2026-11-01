import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [reactRouter(), tsconfigPaths()],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
	},
	preview: {
		port: Number(process.env.PORT) || 4173, // use the PORT environment variable
		host: "127.0.0.1", // listen on ipv4 local host,
		allowedHosts: [".csci312.dev"],
		strictPort: true,
	},
});
