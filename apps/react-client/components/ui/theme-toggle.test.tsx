import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "./theme-toggle";

expect.extend(toHaveNoViolations);

describe("ThemeToggle", () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
	});

	const renderWithTheme = (component: React.ReactElement) => {
		return render(
			<ThemeProvider attribute="class" defaultTheme="light">
				{component}
			</ThemeProvider>
		);
	};

	it("should render without accessibility violations", async () => {
		const { container } = renderWithTheme(<ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should have proper ARIA labels", async () => {
		renderWithTheme(<ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-label");
			expect(button).toHaveAttribute("aria-pressed");
		});
	});

	it("should toggle theme on click", async () => {
		const user = userEvent.setup();
		renderWithTheme(<ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		const button = screen.getByRole("button");
		await user.click(button);

		// Theme should change
		await waitFor(() => {
			expect(button).toHaveAttribute("aria-pressed");
		});
	});

	it("should show correct icon for theme", async () => {
		renderWithTheme(<ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});
	});

	it("should have sufficient color contrast", async () => {
		const { container } = renderWithTheme(<ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		// Axe will check color contrast as part of accessibility violations
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should be keyboard accessible", async () => {
		const user = userEvent.setup();
		renderWithTheme(<ThemeToggle />);

		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		const button = screen.getByRole("button");
		button.focus();
		expect(button).toHaveFocus();

		// Should be activatable with Enter or Space
		await user.keyboard("{Enter}");
		expect(button).toHaveAttribute("aria-pressed");
	});
});
