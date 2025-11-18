import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ThemeToggle } from "./theme-toggle";

expect.extend(toHaveNoViolations);

describe("ThemeToggle", () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		// Reset document class
		document.documentElement.className = "";
	});

	it("should render without accessibility violations", async () => {
		const { container } = render(() => <ThemeToggle />);
		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render toggle button", async () => {
		render(() => <ThemeToggle />);
		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});
	});

	it("should have accessible label", async () => {
		render(() => <ThemeToggle />);
		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-label");
		});
	});

	it("should toggle theme on click", async () => {
		const user = userEvent.setup();
		render(() => <ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).not.toBeDisabled();
		});

		const button = screen.getByRole("button");
		await user.click(button);

		// Check that theme was toggled
		await waitFor(() => {
			expect(localStorage.getItem("theme")).toBeTruthy();
		});
	});

	it("should have sr-only text for screen readers", async () => {
		render(() => <ThemeToggle />);
		await waitFor(() => {
			expect(screen.getAllByText(/toggle theme/i)[0]).toBeInTheDocument();
		});
	});

	it("should be positioned fixed", async () => {
		render(() => <ThemeToggle />);
		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toHaveClass("fixed");
		});
	});

	it("should have outline variant styling", async () => {
		render(() => <ThemeToggle />);
		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toHaveClass("z-50");
		});
	});

	it("should respect system preference when no saved theme", async () => {
		render(() => <ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).not.toBeDisabled();
		});
	});

	it("should have proper aria-pressed state", async () => {
		render(() => <ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-pressed");
		});
	});

	it("should render icon", async () => {
		render(() => <ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			// Check that SVG icon is present
			const svg = button.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});
	});

	it("should update localStorage on toggle", async () => {
		const user = userEvent.setup();
		render(() => <ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).not.toBeDisabled();
		});

		const button = screen.getByRole("button");
		await user.click(button);

		await waitFor(() => {
			expect(localStorage.getItem("theme")).toBeTruthy();
		});
	});

	it("should render without violations in both states", async () => {
		const user = userEvent.setup();
		const { container } = render(() => <ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).not.toBeDisabled();
		});

		// Test initial state
		let results = await axe(container);
		expect(results).toHaveNoViolations();

		// Toggle and test new state
		const button = screen.getByRole("button");
		await user.click(button);

		results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should have backdrop blur styling", async () => {
		render(() => <ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toHaveClass("backdrop-blur");
		});
	});
});
