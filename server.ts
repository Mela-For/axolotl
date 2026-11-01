// biome-ignore-all lint/suspicious/noConsole: console is being used to provide user feedback

/*
When react router builds the production site, it will create a custom server for the app **if** SSR is enabled. If it is not, then the site is exported as a client only SPA, which can be served by anything. 

To make deployments easier, this file detects which of these two things have happened by looking for the server code and will either use react-router-serve to run the custom server _OR_ it will use Vite's preview server to serve the static site. 
*/

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverBuild = join(__dirname, "build/server/index.js");

if (existsSync(serverBuild)) {
	// SSR mode: use react-router-serve
	console.log("Starting in SSR mode...");
	const serve = spawn("pnpm", ["exec", "react-router-serve", serverBuild], {
		stdio: "inherit",
	});

	serve.on("error", (err) => {
		console.error("Failed to start SSR server:", err);
		process.exit(1);
	});
} else {
	// SPA mode: use vite preview
	console.log("Starting in SPA mode with Vite preview server...");
	const preview = spawn(
		"pnpm",
		["exec", "vite", "preview", "--outDir", "build/client"],
		{
			stdio: "inherit",
		},
	);

	preview.on("error", (err) => {
		console.error("Failed to start preview server:", err);
		process.exit(1);
	});
}
