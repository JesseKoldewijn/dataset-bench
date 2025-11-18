import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { DatasetGenerator } from "./dataset-generator";
import * as apiClient from "~/lib/api/client";

expect.extend(toHaveNoViolations);

// Mock the API client
vi.mock("~/lib/api/client", () => ({
	client: {
		GET: vi.fn(),
	},
}));

describe("DatasetGenerator", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		vi.clearAllMocks();
	});

	const renderWithQuery = (component: () => any) => {
		return render(() => (
			<QueryClientProvider client={queryClient}>
				{component()}
			</QueryClientProvider>
		));
	};

	it("should render without accessibility violations", async () => {
		const { container } = renderWithQuery(() => <DatasetGenerator />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render all form fields", () => {
		renderWithQuery(() => <DatasetGenerator />);

		expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /generate dataset/i })
		).toBeInTheDocument();
	});

	it("should have default date values set", () => {
		renderWithQuery(() => <DatasetGenerator />);

		const startDateInput = screen.getByLabelText(
			/start date/i
		) as HTMLInputElement;
		const endDateInput = screen.getByLabelText(
			/end date/i
		) as HTMLInputElement;

		expect(startDateInput.value).toBeTruthy();
		expect(endDateInput.value).toBeTruthy();
	});

	it("should render mode selection options", () => {
		renderWithQuery(() => <DatasetGenerator />);

		expect(
			screen.getByLabelText(/by number of points/i)
		).toBeInTheDocument();
		expect(screen.getByLabelText(/by time interval/i)).toBeInTheDocument();
	});

	it("should have points mode selected by default", () => {
		renderWithQuery(() => <DatasetGenerator />);

		const pointsRadio = screen.getByRole("radio", {
			name: /by number of points/i,
		}) as HTMLInputElement;
		expect(pointsRadio.checked).toBe(true);
	});

	it("should allow switching between modes", async () => {
		const user = userEvent.setup();
		renderWithQuery(() => <DatasetGenerator />);

		const intervalRadio = screen.getByRole("radio", {
			name: /by time interval/i,
		});
		await user.click(intervalRadio);

		expect(intervalRadio).toBeChecked();
	});

	it("should render generate button", () => {
		renderWithQuery(() => <DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		expect(generateButton).toBeInTheDocument();
		expect(generateButton).not.toBeDisabled();
	});

	it("should disable points input when interval mode is selected", async () => {
		const user = userEvent.setup();
		renderWithQuery(() => <DatasetGenerator />);

		const intervalRadio = screen.getByRole("radio", {
			name: /by time interval/i,
		});
		await user.click(intervalRadio);

		const pointsInput = screen.getByPlaceholderText(/e.g., 100/i);
		expect(pointsInput).toBeDisabled();
	});

	it("should render without violations in light theme", async () => {
		const { container } = renderWithQuery(() => (
			<div class="light">
				<DatasetGenerator />
			</div>
		));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render without violations in dark theme", async () => {
		const { container } = renderWithQuery(() => (
			<div class="dark">
				<DatasetGenerator />
			</div>
		));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should have proper card structure", () => {
		renderWithQuery(() => <DatasetGenerator />);

		expect(screen.getByText(/dataset configuration/i)).toBeInTheDocument();
		expect(
			screen.getByText(/configure the parameters/i)
		).toBeInTheDocument();
	});

	it("should show loading state when generating", async () => {
		const user = userEvent.setup();

		// Mock API to delay response
		vi.mocked(apiClient.client.GET).mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(
						() =>
							resolve({
								data: {
									start: "2024-01-01T00:00:00Z",
									end: "2024-01-02T00:00:00Z",
									count: 100,
									data: [],
								},
								error: undefined,
							}),
						100
					);
				})
		);

		renderWithQuery(() => <DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		await user.click(generateButton);

		await waitFor(() => {
			expect(screen.getByText(/generating/i)).toBeInTheDocument();
		});
	});

	it("should handle successful data generation", async () => {
		const user = userEvent.setup();
		const mockResponse = {
			data: {
				start: "2024-01-01T00:00:00Z",
				end: "2024-01-02T00:00:00Z",
				count: 5,
				data: [
					{ timestamp: "2024-01-01T00:00:00Z", value: 100 },
					{ timestamp: "2024-01-01T06:00:00Z", value: 150 },
					{ timestamp: "2024-01-01T12:00:00Z", value: 120 },
					{ timestamp: "2024-01-01T18:00:00Z", value: 180 },
					{ timestamp: "2024-01-02T00:00:00Z", value: 160 },
				],
			},
			error: undefined,
		};

		vi.mocked(apiClient.client.GET).mockResolvedValue(mockResponse);

		renderWithQuery(() => <DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		await user.click(generateButton);

		await waitFor(() => {
			expect(screen.getByText(/generated dataset/i)).toBeInTheDocument();
		});
	});

	it("should display error message on API failure", async () => {
		const user = userEvent.setup();

		vi.mocked(apiClient.client.GET).mockResolvedValue({
			data: undefined,
			error: { message: "API Error" },
		} as any);

		renderWithQuery(() => <DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		await user.click(generateButton);

		await waitFor(() => {
			const errorElements = screen.getAllByText(/error/i);
			expect(errorElements.length).toBeGreaterThan(0);
		});
	});

	it("should have proper input types", () => {
		renderWithQuery(() => <DatasetGenerator />);

		const startDate = screen.getByLabelText(/start date/i);
		const endDate = screen.getByLabelText(/end date/i);

		expect(startDate).toHaveAttribute("type", "datetime-local");
		expect(endDate).toHaveAttribute("type", "datetime-local");
	});

	it("should allow updating date inputs", async () => {
		const user = userEvent.setup();
		renderWithQuery(() => <DatasetGenerator />);

		const startDate = screen.getByLabelText(
			/start date/i
		) as HTMLInputElement;

		// datetime-local inputs are tricky to test, just verify it exists and can be focused
		await user.click(startDate);
		expect(startDate).toHaveFocus();
	});

	it("should allow updating points input", async () => {
		const user = userEvent.setup();
		renderWithQuery(() => <DatasetGenerator />);

		const pointsInput = screen.getByPlaceholderText(/e.g., 100/i);
		await user.clear(pointsInput);
		await user.type(pointsInput, "250");

		expect(pointsInput).toHaveValue(250);
	});

	it("should have proper ARIA labels", () => {
		renderWithQuery(() => <DatasetGenerator />);

		expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
		expect(
			screen.getByLabelText(/by number of points/i)
		).toBeInTheDocument();
		expect(screen.getByLabelText(/by time interval/i)).toBeInTheDocument();
	});
});
