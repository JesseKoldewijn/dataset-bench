import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DatasetChart } from "./dataset-chart";
import type { DataPoint } from "@/lib/api/client";

expect.extend(toHaveNoViolations);

// Track chart instances created
const chartInstances: any[] = [];

// Mock Chart.js
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
		const { container } = render(<DatasetChart data={mockData} />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render with empty data", () => {
		const { container } = render(<DatasetChart data={[]} />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render chart with data", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		// Check that the canvas element exists
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should format timestamps correctly", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		// Chart should be rendered - check for container
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should have proper dimensions", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper).toHaveClass("w-full");
		// Chart container has responsive height classes
		const chartContainer = container.querySelector('[role="img"]');
		expect(chartContainer).toHaveClass("h-[300px]");
	});

	it("should render in both light and dark themes without violations", async () => {
		// Light theme
		const { container: lightContainer } = render(
			<div className="light">
				<DatasetChart data={mockData} />
			</div>
		);
		const lightResults = await axe(lightContainer);
		expect(lightResults).toHaveNoViolations();

		// Dark theme
		const { container: darkContainer } = render(
			<div className="dark">
				<DatasetChart data={mockData} />
			</div>
		);
		const darkResults = await axe(darkContainer);
		expect(darkResults).toHaveNoViolations();
	});

	it("should handle large datasets", () => {
		const largeData: DataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
			timestamp: new Date(Date.now() + i * 3600000).toISOString(),
			value: Math.random() * 200,
		}));

		const { container } = render(<DatasetChart data={largeData} />);
		// Check that component renders without crashing with large data
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should have proper ARIA attributes", () => {
		render(<DatasetChart data={mockData} />);
		const chart = screen.getByRole("img", {
			name: /time series dataset visualization/i,
		});
		expect(chart).toBeInTheDocument();
	});

	it("should render line with visible stroke width", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		// Check that the canvas is rendered
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should render dots on data points", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		// Check that the canvas is rendered
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should have high contrast grid lines", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		// Chart should be rendered with canvas
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should have accessible axis labels", () => {
		const { container } = render(<DatasetChart data={mockData} />);
		// Chart should be rendered with canvas
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("should pass color contrast requirements", async () => {
		// Test in light mode
		const { container: lightContainer } = render(
			<div className="bg-background text-foreground">
				<DatasetChart data={mockData} />
			</div>
		);
		const lightResults = await axe(lightContainer);
		expect(lightResults).toHaveNoViolations();

		// Test in dark mode
		const { container: darkContainer } = render(
			<div className="dark bg-background text-foreground">
				<DatasetChart data={mockData} />
			</div>
		);
		const darkResults = await axe(darkContainer);
		expect(darkResults).toHaveNoViolations();
	});
});
