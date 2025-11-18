import { format } from "date-fns";
import {
	createSignal,
	createEffect,
	createMemo,
	onCleanup,
	Show,
} from "solid-js";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-solid";
import type { DataPoint } from "~/lib/api/client";
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
	Filler,
	type ChartData,
	type ChartOptions,
} from "chart.js";

// Register Chart.js components once at module level
ChartJS.register(
	Title,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
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

export function DatasetChart(props: DatasetChartProps) {
	const [currentPage, setCurrentPage] = createSignal(0);
	const [isMobile, setIsMobile] = createSignal(false);
	const [themeKey, setThemeKey] = createSignal(0);
	const [mounted, setMounted] = createSignal(false);
	let canvasRef: HTMLCanvasElement | undefined;
	let chartInstance: ChartJS<"line"> | undefined;

	const config = () => GRANULARITY_CONFIG[props.granularity || "minutes"];

	// Detect mobile viewport and set mounted
	createEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		setMounted(true);
		window.addEventListener("resize", checkMobile);
		onCleanup(() => window.removeEventListener("resize", checkMobile));
	});

	// Listen for theme changes
	createEffect(() => {
		if (!mounted()) return;

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === "class") {
					setThemeKey((prev) => prev + 1);
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		onCleanup(() => observer.disconnect());
	});

	// Adaptive max points based on device
	const adaptiveMaxPoints = () => props.maxPoints ?? (isMobile() ? 150 : 350);

	// Pre-aggregate all data once and cache it
	const aggregatedData = createMemo(() => {
		if (props.data.length === 0) return [];

		// Group data by time buckets
		const buckets = new Map<
			number,
			{ values: number[]; timestamp: number }
		>();

		props.data.forEach((point) => {
			const timestamp = new Date(point.timestamp).getTime();
			const bucketKey = Math.floor(timestamp / config().interval);

			if (!buckets.has(bucketKey)) {
				buckets.set(bucketKey, {
					values: [],
					timestamp: bucketKey * config().interval,
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
						config().format
					),
					value: avg,
					count: bucket.values.length,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	});

	// Pre-calculate all chunks for fast navigation
	const allChunks = createMemo(() => {
		const data = aggregatedData();
		if (data.length === 0) return [];

		const chunks = [];
		const maxPts = adaptiveMaxPoints();
		for (let i = 0; i < data.length; i += maxPts) {
			chunks.push(data.slice(i, i + maxPts));
		}

		// Ensure the last chunk has at least 2 datapoints
		// If the last chunk has only 1 datapoint, merge it with the previous chunk
		if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
			const lastPoint = chunks.pop()!;
			chunks[chunks.length - 1].push(...lastPoint);
		}

		return chunks;
	});

	// Get current chunk and metadata
	const chartData = createMemo(() => {
		const chunks = allChunks();
		if (chunks.length === 0)
			return { formattedData: [], totalPages: 0, pageInfo: null };

		const page = currentPage();
		const pageData = chunks[page] || [];
		const totalPages = chunks.length;

		const pageInfo = {
			currentPage: page + 1,
			totalPages,
			showing: pageData.length,
			total: aggregatedData().length,
			startTime: pageData[0]?.displayTime,
			endTime: pageData[pageData.length - 1]?.displayTime,
		};

		return {
			formattedData: pageData,
			totalPages,
			pageInfo,
		};
	});

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(0, prev - 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) =>
			Math.min(chartData().totalPages - 1, prev + 1)
		);
	};

	const handleFirstPage = () => {
		setCurrentPage(0);
	};

	const handleLastPage = () => {
		setCurrentPage(chartData().totalPages - 1);
	};

	// Prepare Chart.js data with gradient
	const chartJsData = createMemo((): ChartData<"line"> => {
		if (!mounted()) {
			return { labels: [], datasets: [] };
		}

		const data = chartData();
		// Track theme changes to force recalculation
		themeKey();

		// Get theme colors
		const primaryHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-primary")
			.trim();

		// Parse HSL values and convert to RGB for Chart.js
		const hslMatch = primaryHsl.match(
			/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/
		);
		let borderColor = "rgb(59, 130, 246)";
		let fillColor = "rgba(59, 130, 246, 0.1)";

		if (hslMatch) {
			const h = Number.parseFloat(hslMatch[1]);
			const s = Number.parseFloat(hslMatch[2]) / 100;
			const l = Number.parseFloat(hslMatch[3]) / 100;

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

			borderColor = `rgb(${red}, ${green}, ${blue})`;
			fillColor = `rgba(${red}, ${green}, ${blue}, 0.1)`;
		}

		// Get card background for hover point border
		const cardHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-card")
			.trim();
		const cardMatch = cardHsl.match(
			/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/
		);
		let cardColor = "#fff";

		if (cardMatch) {
			const h = Number.parseFloat(cardMatch[1]);
			const s = Number.parseFloat(cardMatch[2]) / 100;
			const l = Number.parseFloat(cardMatch[3]) / 100;
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

			cardColor = `rgb(${Math.round((r + m) * 255)}, ${Math.round(
				(g + m) * 255
			)}, ${Math.round((b + m) * 255)})`;
		}

		return {
			labels: data.formattedData.map((d) => d.displayTime),
			datasets: [
				{
					label: "Value",
					data: data.formattedData.map((d) => d.value),
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
	});

	// Chart.js options
	const chartOptions = createMemo((): ChartOptions<"line"> => {
		if (!mounted()) {
			return {} as ChartOptions<"line">;
		}

		// Track theme changes to force recalculation
		themeKey();

		// Get all theme colors
		const cardHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-card")
			.trim();
		const borderHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-border")
			.trim();
		const foregroundHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-foreground")
			.trim();
		const mutedHsl = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-muted-foreground")
			.trim();

		// Helper to convert HSL string to CSS color
		const hslToColor = (hslString: string, fallback: string) => {
			if (!hslString) return fallback;
			// If it already looks like HSL values, wrap in hsl()
			if (hslString.match(/^\d+\.?\d*\s+\d+\.?\d*%\s+\d+\.?\d*%$/)) {
				return `hsl(${hslString})`;
			}
			return hslString;
		};

		const cardBg = hslToColor(cardHsl, "#fff");
		const borderColor = hslToColor(borderHsl, "#e5e7eb");
		const textColor = hslToColor(foregroundHsl, "#000");
		const mutedColor = hslToColor(mutedHsl, "rgba(0,0,0,0.5)");

		return {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: "index",
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
							return `Value: ${
								context.parsed.y?.toFixed(2) ?? "N/A"
							}`;
						},
					},
				},
			},
			scales: {
				x: {
					grid: {
						color: `${mutedColor.replace(")", " / 0.2)")}`,
						drawTicks: true,
					},
					border: {
						color: borderColor,
					},
					ticks: {
						color: textColor,
						maxRotation: 0,
						autoSkip: true,
						maxTicksLimit: isMobile() ? 6 : 12,
						font: {
							size: isMobile() ? 9 : 12,
						},
					},
				},
				y: {
					grid: {
						color: `${mutedColor.replace(")", " / 0.2)")}`,
						drawTicks: true,
					},
					border: {
						color: borderColor,
					},
					ticks: {
						color: textColor,
						font: {
							size: isMobile() ? 9 : 12,
						},
					},
					title: isMobile()
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
	});

	// Create/update chart when data changes
	createEffect(() => {
		if (!canvasRef) return;

		const data = chartJsData();
		const options = chartOptions();

		if (chartInstance) {
			chartInstance.data = data;
			chartInstance.options = options;
			chartInstance.update("none"); // Use 'none' to disable animations on updates
		} else {
			chartInstance = new ChartJS(canvasRef, {
				type: "line",
				data,
				options,
			});
		}
	});

	// Cleanup chart on unmount
	onCleanup(() => {
		if (chartInstance) {
			chartInstance.destroy();
		}
	});

	return (
		<div class="w-full space-y-3 select-none">
			{/* Pagination Controls */}
			<Show when={chartData().totalPages > 1 && chartData().pageInfo}>
				{(pageInfo) => (
					<div class="flex items-center justify-between gap-2 px-2">
						<div class="flex items-center gap-1 sm:gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleFirstPage}
								disabled={currentPage() === 0}
								class="h-8 px-1.5 sm:px-2 text-xs"
							>
								<span class="hidden sm:inline">First</span>
								<span class="sm:hidden p-1">«</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handlePreviousPage}
								disabled={currentPage() === 0}
								class="h-8 px-1.5 sm:px-2"
							>
								<ChevronLeft class="h-3 w-3 sm:h-4 sm:w-4" />
							</Button>
						</div>

						<div class="flex flex-col items-center text-[10px] sm:text-xs text-muted-foreground">
							<span class="font-medium">
								Page {pageInfo().currentPage} of{" "}
								{pageInfo().totalPages}
							</span>
							<span class="text-[9px] sm:text-[10px] hidden sm:block">
								Showing {pageInfo().showing} of{" "}
								{pageInfo().total} points
							</span>
							<Show
								when={
									pageInfo().startTime && pageInfo().endTime
								}
							>
								<span class="text-[9px] sm:text-[10px] truncate max-w-[120px] sm:max-w-none">
									{pageInfo().startTime} →{" "}
									{pageInfo().endTime}
								</span>
							</Show>
						</div>

						<div class="flex items-center gap-1 sm:gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleNextPage}
								disabled={
									currentPage() === chartData().totalPages - 1
								}
								class="h-8 px-1.5 sm:px-2"
							>
								<ChevronRight class="h-3 w-3 sm:h-4 sm:w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleLastPage}
								disabled={
									currentPage() === chartData().totalPages - 1
								}
								class="h-8 px-2 text-xs"
							>
								<span class="hidden sm:inline">Last</span>
								<span class="sm:hidden p-1">»</span>
							</Button>
						</div>
					</div>
				)}
			</Show>

			{/* Chart */}
			<div
				class="relative w-full h-[300px] sm:h-[400px] min-h-[300px] sm:min-h-[400px] select-none overflow-hidden bg-card/30 rounded-lg p-1 sm:p-2"
				role="img"
				aria-label="Time series dataset visualization"
			>
				<Show when={chartData().formattedData.length > 0}>
					<canvas ref={canvasRef} />
				</Show>
			</div>
		</div>
	);
}
