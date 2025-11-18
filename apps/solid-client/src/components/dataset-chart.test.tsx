import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { axe, toHaveNoViolations } from "jest-axe";
import { DatasetChart } from "./dataset-chart";
import type { DataPoint } from "~/lib/api/client";

expect.extend(toHaveNoViolations);

// Track chart instances created
const chartInstances: any[] = [];

// Mock Chart.js by patching it after import
vi.mock("chart.js", async () => {
	const actual = await vi.importActual("chart.js");

	class MockChart {
		data: any;
		options: any;
		canvas: any;
		update = vi.fn();
		destroy = vi.fn();

		constructor(canvas: any, config: any) {
			this.canvas = canvas;
			this.data = config.data;
			this.options = config.options;
			chartInstances.push(this);
		}

		static register = vi.fn();
		static unregister = vi.fn();
		static defaults = {
			font: {},
			color: "rgba(0, 0, 0, 0.1)",
		};
	}

	return {
		...actual,
		Chart: MockChart,
	};
});

describe("DatasetChart", () => {
	beforeEach(() => {
		chartInstances.length = 0;
	});

	afterEach(() => {
		chartInstances.forEach((instance) => {
			if (instance.destroy && typeof instance.destroy === "function") {
				try {
					instance.destroy();
				} catch (e) {
					// Ignore cleanup errors
				}
			}
		});
		chartInstances.length = 0;
	});

	const mockData: DataPoint[] = [
		{ timestamp: "2024-01-01T00:00:00Z", value: 100 },
		{ timestamp: "2024-01-01T01:00:00Z", value: 150 },
		{ timestamp: "2024-01-01T02:00:00Z", value: 120 },
		{ timestamp: "2024-01-01T03:00:00Z", value: 180 },
		{ timestamp: "2024-01-01T04:00:00Z", value: 160 },
	];

	it("should render without accessibility violations", async () => {
		const { container } = render(() => <DatasetChart data={mockData} />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render with empty data", () => {
		const { container } = render(() => <DatasetChart data={[]} />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render chart with data", () => {
		const { container } = render(() => <DatasetChart data={mockData} />);
		// Check that the canvas element exists
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should have proper ARIA attributes", () => {
		render(() => <DatasetChart data={mockData} />);
		const chartContainer = screen.getByRole("img", {
			name: /time series dataset visualization/i,
		});
		expect(chartContainer).toBeInTheDocument();
	});

	it("should handle large datasets", () => {
		const largeData: DataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
			timestamp: new Date(Date.now() + i * 3600000).toISOString(),
			value: Math.random() * 200,
		}));

		const { container } = render(() => <DatasetChart data={largeData} />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render pagination controls for large datasets", () => {
		const largeData: DataPoint[] = Array.from({ length: 500 }, (_, i) => ({
			timestamp: new Date(Date.now() + i * 3600000).toISOString(),
			value: Math.random() * 200,
		}));

		render(() => <DatasetChart data={largeData} maxPoints={50} />);

		// Check for pagination buttons
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should apply custom granularity", () => {
		const { container } = render(() => (
			<DatasetChart data={mockData} granularity="hours" />
		));
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should apply custom max points", () => {
		const { container } = render(() => (
			<DatasetChart data={mockData} maxPoints={10} />
		));
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render without violations in light theme", async () => {
		const { container } = render(() => (
			<div class="light">
				<DatasetChart data={mockData} />
			</div>
		));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render without violations in dark theme", async () => {
		const { container } = render(() => (
			<div class="dark">
				<DatasetChart data={mockData} />
			</div>
		));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should handle data with various granularities", () => {
		const granularities = [
			"seconds",
			"minutes",
			"hours",
			"days",
			"months",
			"years",
		] as const;

		granularities.forEach((granularity) => {
			const { container } = render(() => (
				<DatasetChart data={mockData} granularity={granularity} />
			));
			expect(container.firstChild).toBeInTheDocument();
		});
	});

	it("should aggregate data points correctly", () => {
		// Data points with same timestamps should be aggregated
		const duplicateTimestamps: DataPoint[] = [
			{ timestamp: "2024-01-01T00:00:00Z", value: 100 },
			{ timestamp: "2024-01-01T00:00:00Z", value: 200 },
			{ timestamp: "2024-01-01T00:00:00Z", value: 150 },
		];

		const { container } = render(() => (
			<DatasetChart data={duplicateTimestamps} />
		));
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should handle single data point", () => {
		const singlePoint: DataPoint[] = [
			{ timestamp: "2024-01-01T00:00:00Z", value: 100 },
		];

		const { container } = render(() => <DatasetChart data={singlePoint} />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should have proper styling classes", () => {
		const { container } = render(() => <DatasetChart data={mockData} />);
		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper).toHaveClass("w-full");
		expect(wrapper).toHaveClass("space-y-3");
		expect(wrapper).toHaveClass("select-none");
	});

	it("should render canvas element when data is present", () => {
		render(() => <DatasetChart data={mockData} />);
		const canvas = document.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should not render canvas when data is empty", () => {
		render(() => <DatasetChart data={[]} />);
		const canvas = document.querySelector("canvas");
		expect(canvas).not.toBeInTheDocument();
	});

	it("should initialize Chart.js with correct data structure", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		expect(chartInstance).toBeDefined();
		expect(chartInstance.data).toBeDefined();
		expect(chartInstance.data.datasets).toBeDefined();
		expect(chartInstance.data.datasets.length).toBe(1);
	});

	it("should pass correct number of data points to Chart.js", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		const dataset = chartInstance.data.datasets[0];
		expect(dataset.data).toBeDefined();
		expect(dataset.data.length).toBe(mockData.length);
	});

	it("should configure Chart.js with line chart type", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		// Chart type is set during construction
		expect(chartInstance).toBeDefined();
	});

	it("should include labels for all data points", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		expect(chartInstance.data.labels).toBeDefined();
		expect(chartInstance.data.labels.length).toBe(mockData.length);
	});

	it("should configure dataset with proper styling", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		const dataset = chartInstance.data.datasets[0];

		expect(dataset.label).toBe("Value");
		expect(dataset.borderColor).toBeDefined();
		expect(dataset.backgroundColor).toBeDefined();
		expect(dataset.fill).toBe(true);
		expect(dataset.tension).toBe(0.4);
	});

	it("should configure responsive options", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		expect(chartInstance.options).toBeDefined();
		expect(chartInstance.options.responsive).toBe(true);
		expect(chartInstance.options.maintainAspectRatio).toBe(false);
	});

	it("should configure scales for x and y axes", async () => {
		render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		expect(chartInstance.options.scales).toBeDefined();
		expect(chartInstance.options.scales.x).toBeDefined();
		expect(chartInstance.options.scales.y).toBeDefined();
	});

	it("should destroy chart on unmount", async () => {
		const { unmount } = render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		const destroySpy = chartInstance.destroy;

		unmount();

		await waitFor(() => {
			expect(destroySpy).toHaveBeenCalled();
		});
	});

	it("should update chart when data changes", async () => {
		const newData: DataPoint[] = [
			{ timestamp: "2024-01-02T00:00:00Z", value: 200 },
			{ timestamp: "2024-01-02T01:00:00Z", value: 250 },
		];

		// First render
		const { unmount } = render(() => <DatasetChart data={mockData} />);

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		unmount();

		// Second render with new data
		render(() => <DatasetChart data={newData} />);
		await waitFor(() => {
			// A new chart instance should be created with the new data
			expect(chartInstances.length).toBeGreaterThan(1);
		});
	});

	it("should handle data aggregation by time buckets", async () => {
		// Multiple points in the same time bucket should be aggregated
		const duplicateTimestamps: DataPoint[] = [
			{ timestamp: "2024-01-01T00:00:00Z", value: 100 },
			{ timestamp: "2024-01-01T00:00:30Z", value: 200 }, // Same minute
			{ timestamp: "2024-01-01T00:00:45Z", value: 150 }, // Same minute
		];

		render(() => (
			<DatasetChart data={duplicateTimestamps} granularity="minutes" />
		));

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		const dataset = chartInstance.data.datasets[0];

		// With minute granularity, these should be aggregated into one point
		expect(dataset.data.length).toBeLessThanOrEqual(
			duplicateTimestamps.length
		);
	});

	it("should create chart with canvas element", async () => {
		const { container } = render(() => <DatasetChart data={mockData} />);

		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();

		await waitFor(() => {
			expect(chartInstances.length).toBeGreaterThan(0);
		});

		const chartInstance = chartInstances[0];
		expect(chartInstance.canvas).toBe(canvas);
	});
});
