"use client";

import { format } from "date-fns";
import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DataPoint } from "@/lib/api/client";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
	Title,
	Tooltip,
	Legend,
	Filler,
	type ChartData,
	type ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
	Title,
	Tooltip,
	Legend,
	Filler
);

export type TimeGranularity =
	| "seconds"
	| "minutes"
	| "hours"
	| "days"
	| "months"
	| "years";

interface DatasetChartProps {
	data: DataPoint[];
	granularity?: TimeGranularity;
	maxPoints?: number;
}

const GRANULARITY_CONFIG: Record<
	TimeGranularity,
	{ interval: number; format: string; label: string }
> = {
	seconds: { interval: 1000, format: "MMM dd, HH:mm:ss", label: "Seconds" },
	minutes: { interval: 60000, format: "MMM dd, HH:mm", label: "Minutes" },
	hours: { interval: 3600000, format: "MMM dd, HH:mm", label: "Hours" },
	days: { interval: 86400000, format: "MMM dd", label: "Days" },
	months: { interval: 2592000000, format: "MMM yyyy", label: "Months" },
	years: { interval: 31536000000, format: "yyyy", label: "Years" },
};

export function DatasetChart({
	data,
	granularity = "minutes",
	maxPoints,
}: DatasetChartProps) {
	const [currentPage, setCurrentPage] = useState(0);
	const [isMobile, setIsMobile] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [themeClass, setThemeClass] = useState("");
	const [themeVersion, setThemeVersion] = useState(0);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<ChartJS<"line"> | null>(null);
	const config = GRANULARITY_CONFIG[granularity];

	// Detect mobile viewport and set mounted state
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		setMounted(true);
		setThemeClass(document.documentElement.className);
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Watch for theme class changes on the HTML element
	useEffect(() => {
		if (!mounted) return;

		const observer = new MutationObserver(() => {
			const newClass = document.documentElement.className;
			setThemeClass(newClass);
			setThemeVersion((prev) => {
				const newVersion = prev + 1;
				return newVersion;
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, [mounted]); // Adaptive max points based on device
	const adaptiveMaxPoints = maxPoints ?? (isMobile ? 150 : 350);

	// Pre-aggregate all data once and cache it
	const aggregatedData = useMemo(() => {
		if (data.length === 0) return [];

		// Group data by time buckets
		const buckets = new Map<
			number,
			{ values: number[]; timestamp: number }
		>();

		data.forEach((point) => {
			const timestamp = new Date(point.timestamp).getTime();
			const bucketKey = Math.floor(timestamp / config.interval);

			if (!buckets.has(bucketKey)) {
				buckets.set(bucketKey, {
					values: [],
					timestamp: bucketKey * config.interval,
				});
			}
			buckets.get(bucketKey)!.values.push(point.value);
		});

		// Calculate average for each bucket and format
		return Array.from(buckets.values())
			.map((bucket) => {
				const avg =
					bucket.values.reduce((sum, val) => sum + val, 0) /
					bucket.values.length;
				return {
					timestamp: bucket.timestamp,
					displayTime: format(
						new Date(bucket.timestamp),
						config.format
					),
					value: avg,
					count: bucket.values.length,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [data, config.interval, config.format]);

	// Pre-calculate all chunks for fast navigation
	const allChunks = useMemo(() => {
		if (aggregatedData.length === 0) return [];

		const chunks = [];
		for (let i = 0; i < aggregatedData.length; i += adaptiveMaxPoints) {
			chunks.push(aggregatedData.slice(i, i + adaptiveMaxPoints));
		}

		// Ensure the last chunk has at least 2 datapoints
		// If the last chunk has only 1 datapoint, merge it with the previous chunk
		if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
			const lastPoint = chunks.pop()!;
			chunks[chunks.length - 1].push(...lastPoint);
		}

		return chunks;
	}, [aggregatedData, adaptiveMaxPoints]);

	// Get current chunk and metadata
	const { formattedData, totalPages, pageInfo } = useMemo(() => {
		if (allChunks.length === 0)
			return { formattedData: [], totalPages: 0, pageInfo: null };

		const pageData = allChunks[currentPage] || [];
		const totalPages = allChunks.length;

		const pageInfo = {
			currentPage: currentPage + 1,
			totalPages,
			showing: pageData.length,
			total: aggregatedData.length,
			startTime: pageData[0]?.displayTime,
			endTime: pageData[pageData.length - 1]?.displayTime,
		};

		return {
			formattedData: pageData,
			totalPages,
			pageInfo,
		};
	}, [allChunks, currentPage, aggregatedData.length]);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(0, prev - 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
	};

	const handleFirstPage = () => {
		setCurrentPage(0);
	};

	const handleLastPage = () => {
		setCurrentPage(totalPages - 1);
	};

	// Helper to convert HSL to RGB (matching Solid implementation)
	const hslToRgb = (hslString: string): string => {
		const hslMatch = hslString.match(
			/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/
		);
		if (!hslMatch) return "rgb(59, 130, 246)";

		const h = parseFloat(hslMatch[1]);
		const s = parseFloat(hslMatch[2]) / 100;
		const l = parseFloat(hslMatch[3]) / 100;

		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;

		let r = 0,
			g = 0,
			b = 0;
		if (h >= 0 && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (h >= 60 && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (h >= 120 && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (h >= 180 && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (h >= 240 && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (h >= 300 && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		const red = Math.round((r + m) * 255);
		const green = Math.round((g + m) * 255);
		const blue = Math.round((b + m) * 255);

		return `rgb(${red}, ${green}, ${blue})`;
	};

	// Helper to convert hex to RGB
	const hexToRgb = (hex: string): string => {
		// Remove # if present
		hex = hex.replace("#", "");

		// Handle 3-character hex codes (e.g., #fff -> #ffffff)
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}

		// Parse hex values
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		return `rgb(${r}, ${g}, ${b})`;
	};

	// Convert any color format to RGB
	const toRgb = (colorString: string): string => {
		if (!colorString) return "rgb(59, 130, 246)";

		// Check if it's hex format
		if (colorString.startsWith("#")) {
			return hexToRgb(colorString);
		}

		// Check if it's HSL format
		if (colorString.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/)) {
			return hslToRgb(colorString);
		}

		// Return as-is if already in rgb/rgba format or fallback
		return colorString || "rgb(59, 130, 246)";
	};

	const hslToColor = (hslString: string, fallback: string) => {
		if (!hslString) return fallback;

		// Check if it's hex format (Tailwind v4 in Next.js)
		if (hslString.startsWith("#")) {
			return hslString;
		}

		// If it already looks like HSL values, wrap in hsl()
		if (hslString.match(/^\d+\.?\d*\s+\d+\.?\d*%\s+\d+\.?\d*%$/)) {
			return `hsl(${hslString})`;
		}
		return hslString || fallback;
	}; // Prepare Chart.js data - recalculate when theme changes
	const chartData = useMemo((): ChartData<"line"> => {
		if (typeof window === "undefined" || !mounted) {
			return { labels: [], datasets: [] };
		}

		// Get theme colors - matching Solid implementation
		const primaryHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-primary")
			.trim();
		const cardHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-card")
			.trim();

		// Convert to RGB (handles both hex and HSL formats)
		const borderColor = toRgb(primaryHsl);
		const fillColor = borderColor
			.replace("rgb", "rgba")
			.replace(")", ", 0.1)");
		const cardColor = toRgb(cardHsl);

		return {
			labels: formattedData.map((d) => d.displayTime),
			datasets: [
				{
					label: "Value",
					data: formattedData.map((d) => d.value),
					borderColor: borderColor,
					backgroundColor: fillColor,
					fill: true,
					tension: 0.4,
					pointRadius: 0,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: borderColor,
					pointHoverBorderColor: cardColor,
					pointHoverBorderWidth: 3,
					borderWidth: 2,
				},
			],
		};
	}, [formattedData, mounted, themeClass]);

	// Chart.js options - recalculate on every render to get fresh colors
	const getChartOptions = (): ChartOptions<"line"> => {
		if (typeof window === "undefined" || !mounted) {
			return {} as ChartOptions<"line">;
		}

		const timestamp = Date.now();
		// Force fresh read by accessing DOM at calculation time
		const currentTheme = document.documentElement.classList.contains("dark")
			? "dark"
			: "light";
		console.debug(
			`[chartOptions ${timestamp}] Recalculating - themeClass:`,
			themeClass,
			"currentTheme:",
			currentTheme
		);

		const cardBg =
			getComputedStyle(document.documentElement)
				.getPropertyValue("--color-card")
				.trim() || "#fff";
		const borderColor =
			getComputedStyle(document.documentElement)
				.getPropertyValue("--color-border")
				.trim() || "#e5e7eb";
		const textColor =
			getComputedStyle(document.documentElement)
				.getPropertyValue("--color-foreground")
				.trim() || "#000";
		const mutedColor =
			getComputedStyle(document.documentElement)
				.getPropertyValue("--color-muted-foreground")
				.trim() || "rgba(0,0,0,0.5)";

		// Create grid color with transparency using the muted color
		const gridColor = mutedColor.startsWith("#")
			? mutedColor + "26" // Add 15% opacity in hex (26 in hex = ~15%)
			: mutedColor;

		return {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: "index" as const,
				intersect: false,
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					backgroundColor: cardBg,
					titleColor: textColor,
					bodyColor: textColor,
					borderColor: borderColor,
					borderWidth: 2,
					padding: 12,
					cornerRadius: 8,
					displayColors: true,
					titleFont: {
						weight: "bold",
						size: 13,
					},
					bodyFont: {
						size: 12,
					},
					callbacks: {
						label: (context) => {
							return `Value: ${context.parsed.y?.toFixed(2)}`;
						},
					},
				},
			},
			scales: {
				x: {
					grid: {
						color: gridColor,
						drawTicks: true,
					},
					border: {
						color: borderColor,
					},
					ticks: {
						color: textColor,
						maxRotation: 0,
						autoSkip: true,
						maxTicksLimit: isMobile ? 6 : 12,
						font: {
							size: isMobile ? 9 : 12,
						},
					},
				},
				y: {
					grid: {
						color: gridColor,
						drawTicks: true,
					},
					border: {
						color: borderColor,
					},
					ticks: {
						color: textColor,
						font: {
							size: isMobile ? 9 : 12,
						},
					},
					title: isMobile
						? undefined
						: {
								display: true,
								text: "Value",
								color: textColor,
								font: {
									size: 12,
								},
						  },
				},
			},
		};
	};

	const chartOptions = getChartOptions();

	// Create/update chart
	useEffect(() => {
		if (!canvasRef.current || !mounted) return;

		if (!chartRef.current) {
			chartRef.current = new ChartJS(canvasRef.current, {
				type: "line",
				data: chartData,
				options: chartOptions,
			});
		}

		return () => {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
		};
	}, [chartData, chartOptions, mounted, themeClass]);

	// Cleanup chart on unmount
	useEffect(() => {
		return () => {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
		};
	}, []);

	return (
		<div className="w-full space-y-3 select-none">
			{/* Pagination Controls */}
			{totalPages > 1 && pageInfo && (
				<div className="flex items-center justify-between gap-2 px-2">
					<div className="flex items-center gap-1 sm:gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleFirstPage}
							disabled={currentPage === 0}
							className="h-8 px-1.5 sm:px-2 text-xs"
						>
							<span className="hidden sm:inline">First</span>
							<span className="sm:hidden p-1">«</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={currentPage === 0}
							className="h-8 px-1.5 sm:px-2"
						>
							<ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
					</div>

					<div className="flex flex-col items-center text-[10px] sm:text-xs text-muted-foreground">
						<span className="font-medium">
							Page {pageInfo.currentPage} of {pageInfo.totalPages}
						</span>
						<span className="text-[9px] sm:text-[10px] hidden sm:block">
							Showing {pageInfo.showing} of {pageInfo.total}{" "}
							points
						</span>
						{pageInfo.startTime && pageInfo.endTime && (
							<span className="text-[9px] sm:text-[10px] truncate max-w-[120px] sm:max-w-none">
								{pageInfo.startTime} → {pageInfo.endTime}
							</span>
						)}
					</div>

					<div className="flex items-center gap-1 sm:gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={currentPage === totalPages - 1}
							className="h-8 px-1.5 sm:px-2"
						>
							<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleLastPage}
							disabled={currentPage === totalPages - 1}
							className="h-8 px-2 text-xs"
						>
							<span className="hidden sm:inline">Last</span>
							<span className="sm:hidden p-1">»</span>
						</Button>
					</div>
				</div>
			)}

			{/* Chart */}
			<div
				className="relative w-full h-[300px] sm:h-[400px] min-h-[300px] sm:min-h-[400px] select-none overflow-hidden bg-card/30 rounded-lg p-1 sm:p-2"
				role="img"
				aria-label="Time series dataset visualization"
			>
				{formattedData.length > 0 && <canvas ref={canvasRef} />}
			</div>
		</div>
	);
}
