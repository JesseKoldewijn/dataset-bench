import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
	server: {
		preset: "node-server",
	},
	ssr: true,
	solid: {
		ssr: true,
	},
	vite: {
		server: {
			port: 3002,
			hmr: {
				overlay: true,
			},
		},
		css: {
			postcss: "./postcss.config.js",
		},
		optimizeDeps: {
			include: [
				"solid-js",
				"@tanstack/solid-query",
				"chart.js",
				"date-fns",
			],
			exclude: ["@solidjs/start"],
		},
		build: {
			target: "esnext",
		},
	},
});
