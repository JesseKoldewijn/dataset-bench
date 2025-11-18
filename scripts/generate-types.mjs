#!/usr/bin/env node

import { spawn } from "child_process";
import { setTimeout } from "timers/promises";

const API_URL = "http://localhost:3000";
const MAX_RETRIES = 30;
const RETRY_DELAY = 1000;

async function waitForBackend() {
	console.log("Waiting for backend API to be ready...");

	for (let i = 0; i < MAX_RETRIES; i++) {
		try {
			const response = await fetch(`${API_URL}/api/health-check`);
			if (response.ok) {
				console.log("✓ Backend API is ready!");
				return true;
			}
		} catch (error) {
			// Backend not ready yet, continue waiting
		}

		await setTimeout(RETRY_DELAY);
		process.stdout.write(".");
	}

	console.error("\n✗ Backend API failed to start within timeout");
	return false;
}

async function startBackend() {
	console.log("Starting backend API...");

	const backend = spawn("cargo", ["run"], {
		cwd: "apps/backend",
		stdio: "pipe",
	});

	// Log backend output
	backend.stdout.on("data", (data) => {
		const output = data.toString();
		if (output.includes("listening")) {
			console.log(`Backend: ${output.trim()}`);
		}
	});

	backend.stderr.on("data", (data) => {
		// Suppress most cargo output except errors
		const output = data.toString();
		if (output.includes("error")) {
			console.error(`Backend error: ${output}`);
		}
	});

	return backend;
}

async function generateTypesForClients() {
	console.log("\nGenerating types for all clients concurrently...\n");

	const clients = ["react-client", "solid-client"];

	const promises = clients.map((client) => {
		return new Promise((resolve, reject) => {
			console.log(`Starting type generation for ${client}...`);

			const proc = spawn("yarn", ["generate-types"], {
				cwd: `apps/${client}`,
				stdio: "inherit",
				shell: true,
			});

			proc.on("close", (code) => {
				if (code === 0) {
					console.log(`✓ Type generation completed for ${client}`);
					resolve();
				} else {
					reject(
						new Error(
							`Type generation failed for ${client} with code ${code}`
						)
					);
				}
			});

			proc.on("error", (error) => {
				reject(error);
			});
		});
	});

	try {
		await Promise.all(promises);
		console.log("\n✓ All type generation completed successfully!");
		return true;
	} catch (error) {
		console.error("\n✗ Type generation failed:", error.message);
		return false;
	}
}

async function main() {
	let backend = null;

	try {
		// Start the backend
		backend = await startBackend();

		// Wait for backend to be ready
		const isReady = await waitForBackend();

		if (!isReady) {
			process.exit(1);
		}

		// Generate types for all clients concurrently
		const success = await generateTypesForClients();

		// Clean exit
		if (backend) {
			backend.kill();
		}

		process.exit(success ? 0 : 1);
	} catch (error) {
		console.error("Error:", error);

		if (backend) {
			backend.kill();
		}

		process.exit(1);
	}
}

// Handle cleanup on process termination
process.on("SIGINT", () => {
	console.log("\nReceived SIGINT, cleaning up...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\nReceived SIGTERM, cleaning up...");
	process.exit(0);
});

main();
