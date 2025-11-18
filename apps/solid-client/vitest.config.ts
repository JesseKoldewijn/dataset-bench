import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import path from "path";

export default defineConfig({
	plugins: [solid()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"vitest.setup.ts",
				"**/*.config.*",
				"**/*.d.ts",
				"**/types/**",
				"lib/api/schema.d.ts",
				".output/**",
				".vinxi/**",
			],
		},
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		transformMode: {
			web: [/\.[jt]sx?$/],
		},
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
		conditions: ["development", "browser"],
	},
});
