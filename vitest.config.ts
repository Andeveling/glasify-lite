import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@server": resolve(__dirname, "./src/server"),
			"@styles": resolve(__dirname, "./src/styles"),
			"@trpc": resolve(__dirname, "./src/trpc"),
			"@ui": resolve(__dirname, "./src/components/ui"),
			"@views/auth": resolve(__dirname, "./src/app/(auth)"),
			"@views/catalog": resolve(__dirname, "./src/app/(public)/catalog"),
			"@views/components": resolve(__dirname, "./src/app/_components"),
			"@views/dashboard": resolve(__dirname, "./src/app/(dashboard)"),
			"@views/quote": resolve(__dirname, "./src/app/(public)/quote"),
		},
	},
	test: {
		environment: "jsdom",
		exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
		globals: true,
		pool: "threads",
		setupFiles: ["./src/tests/setup.ts"],
	},
});
