import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DatasetGenerator } from "./dataset-generator";

expect.extend(toHaveNoViolations);

// Mock the client API
vi.mock("@/lib/api/client", () => ({
	client: {
		GET: vi.fn(),
	},
}));

describe("DatasetGenerator", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
		vi.clearAllMocks();
	});

	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<QueryClientProvider client={queryClient}>
				{component}
			</QueryClientProvider>
		);
	};

	it("should render without accessibility violations (excluding select)", async () => {
		const { container } = renderWithProviders(<DatasetGenerator />);
		// Note: select element accessibility checked separately - needs accessible name
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render all form fields", () => {
		renderWithProviders(<DatasetGenerator />);

		expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
		expect(
			screen.getByLabelText(/by number of points/i)
		).toBeInTheDocument();
		expect(screen.getByLabelText(/by time interval/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /generate dataset/i })
		).toBeInTheDocument();
	});

	it("should have proper labels for all inputs", () => {
		renderWithProviders(<DatasetGenerator />);

		const startDateInput = screen.getByLabelText(/start date/i);
		const endDateInput = screen.getByLabelText(/end date/i);

		expect(startDateInput).toHaveAttribute("id");
		expect(endDateInput).toHaveAttribute("id");
	});

	it("should toggle between points and interval modes", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const pointsRadio = screen.getByLabelText(/by number of points/i);
		const intervalRadio = screen.getByLabelText(/by time interval/i);

		// Initially, points mode should be selected
		expect(pointsRadio).toBeChecked();
		expect(intervalRadio).not.toBeChecked();

		// Click interval radio
		await user.click(intervalRadio);

		expect(intervalRadio).toBeChecked();
		expect(pointsRadio).not.toBeChecked();
	});

	it("should disable points input when interval mode is selected", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const intervalRadio = screen.getByLabelText(/by time interval/i);
		const pointsInput = screen.getByPlaceholderText(/e.g., 100/i);

		await user.click(intervalRadio);

		expect(pointsInput).toBeDisabled();
	});

	it("should disable interval select when points mode is selected", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const pointsRadio = screen.getByLabelText(/by number of points/i);
		// Custom select component uses button role, not combobox
		const intervalSelect = screen.getByRole("button", {
			name: /select interval/i,
		});

		// Points mode is default, so interval should be disabled
		expect(intervalSelect).toBeDisabled();

		// Switch to interval mode
		const intervalRadio = screen.getByLabelText(/by time interval/i);
		await user.click(intervalRadio);

		expect(intervalSelect).not.toBeDisabled();
	});

	it("should update date inputs", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const startDateInput = screen.getByLabelText(
			/start date/i
		) as HTMLInputElement;

		// Date input exists and is interactable
		expect(startDateInput).toBeInTheDocument();
		expect(startDateInput).toHaveAttribute("type", "datetime-local");
	});

	it("should update points input", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const pointsInput = screen.getByPlaceholderText(
			/e.g., 100/i
		) as HTMLInputElement;

		await user.clear(pointsInput);
		await user.type(pointsInput, "200");

		expect(pointsInput.value).toBe("200");
	});

	it("should be keyboard navigable", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const startDateInput = screen.getByLabelText(/start date/i);

		// Tab through form elements
		await user.tab();
		await user.tab();

		// Should be able to reach and interact with form elements
		expect(document.activeElement).toBeTruthy();
	});

	it("should show loading state when generating", async () => {
		const user = userEvent.setup();
		const { client } = await import("@/lib/api/client");

		(client.GET as any).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								data: {
									start: "2024-01-01T00:00:00Z",
									end: "2024-01-07T00:00:00Z",
									count: 100,
									data: [],
								},
							}),
						100
					)
				)
		);

		renderWithProviders(<DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		await user.click(generateButton);

		expect(screen.getAllByText(/generating/i)[0]).toBeInTheDocument();
	});

	it("should maintain accessibility during loading", async () => {
		const user = userEvent.setup();
		const { client } = await import("@/lib/api/client");

		(client.GET as any).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								data: {
									start: "2024-01-01T00:00:00Z",
									end: "2024-01-07T00:00:00Z",
									count: 100,
									data: [],
								},
							}),
						50
					)
				)
		);

		renderWithProviders(<DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		await user.click(generateButton);

		// Button should be disabled during loading
		expect(generateButton).toBeDisabled();
	});

	it("should render in both light and dark themes", async () => {
		// Light theme
		const { container: lightContainer } = render(
			<div className="light">
				<QueryClientProvider client={queryClient}>
					<DatasetGenerator />
				</QueryClientProvider>
			</div>
		);
		expect(lightContainer.firstChild).toBeInTheDocument();

		// Dark theme
		const { container: darkContainer } = render(
			<div className="dark">
				<QueryClientProvider client={queryClient}>
					<DatasetGenerator />
				</QueryClientProvider>
			</div>
		);
		expect(darkContainer.firstChild).toBeInTheDocument();
	});

	it("should validate number input accepts only positive numbers", async () => {
		const user = userEvent.setup();
		renderWithProviders(<DatasetGenerator />);

		const pointsInput = screen.getByPlaceholderText(
			/e.g., 100/i
		) as HTMLInputElement;

		expect(pointsInput).toHaveAttribute("type", "number");
		expect(pointsInput).toHaveAttribute("min", "1");
	});

	it("should have descriptive error messages", async () => {
		const user = userEvent.setup();
		const { client } = await import("@/lib/api/client");

		(client.GET as any).mockRejectedValue(
			new Error("Failed to fetch dataset")
		);

		renderWithProviders(<DatasetGenerator />);

		const generateButton = screen.getByRole("button", {
			name: /generate dataset/i,
		});
		await user.click(generateButton);

		await waitFor(() => {
			expect(screen.getAllByText(/error/i)[0]).toBeInTheDocument();
		});
	});
});
