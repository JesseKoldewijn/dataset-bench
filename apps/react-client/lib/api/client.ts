import createClient from "openapi-fetch";
import type { paths } from "./schema.d";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const client = createClient<paths>({ baseUrl: API_URL });

export type TimeUnit = "minutes" | "hours" | "days" | "weeks" | "months";

export interface DataPoint {
	timestamp: string;
	value: number;
}

export interface DatasetQuery {
	start: string;
	end: string;
	points?: number;
	point_by?: TimeUnit;
}

export interface DatasetResponse {
	start: string;
	end: string;
	count: number;
	data: DataPoint[];
}

export interface HealthResponse {
	status: string;
	timestamp: string;
}
