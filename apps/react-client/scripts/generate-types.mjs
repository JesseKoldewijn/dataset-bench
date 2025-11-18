import { writeFile } from "fs/promises";
import { join } from "path";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const OPENAPI_URL = `${API_URL}/api-doc/openapi.json`;

async function generateTypes() {
	try {
		console.log(`Fetching OpenAPI spec from ${OPENAPI_URL}...`);

		const response = await fetch(OPENAPI_URL);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch OpenAPI spec: ${response.statusText}`
			);
		}

		const spec = await response.json();
		const specPath = join(process.cwd(), "lib", "api", "openapi.json");

		await writeFile(specPath, JSON.stringify(spec, null, 2));
		console.log(`✓ Saved OpenAPI spec to ${specPath}`);

		// Now run openapi-typescript
		const { exec } = await import("child_process");
		const { promisify } = await import("util");
		const execAsync = promisify(exec);

		console.log("Generating TypeScript types...");
		await execAsync(
			"npx openapi-typescript lib/api/openapi.json -o lib/api/schema.d.ts"
		);
		console.log("✓ TypeScript types generated successfully");
	} catch (error) {
		console.error("Error generating types:", error);
		process.exit(1);
	}
}

generateTypes();
