import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Input } from "./input";
import { Label } from "./label";

expect.extend(toHaveNoViolations);

describe("Input", () => {
	it("should render without accessibility violations", async () => {
		const { container } = render(<Input aria-label="Test input" />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render with label without accessibility violations", async () => {
		const { container } = render(
			<>
				<Label htmlFor="test-input">Test Label</Label>
				<Input id="test-input" />
			</>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should handle text input", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		render(<Input onChange={handleChange} aria-label="Test input" />);

		const input = screen.getByLabelText("Test input");
		await user.type(input, "Hello");

		expect(handleChange).toHaveBeenCalled();
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Input disabled aria-label="Test input" />);
		const input = screen.getByLabelText("Test input");
		expect(input).toBeDisabled();
	});

	it("should accept different input types", () => {
		const { rerender } = render(
			<Input type="text" aria-label="Test input" />
		);
		let input = screen.getByLabelText("Test input");
		expect(input).toHaveAttribute("type", "text");

		rerender(<Input type="number" aria-label="Test input" />);
		input = screen.getByLabelText("Test input");
		expect(input).toHaveAttribute("type", "number");

		rerender(<Input type="email" aria-label="Test input" />);
		input = screen.getByLabelText("Test input");
		expect(input).toHaveAttribute("type", "email");
	});

	it("should show placeholder text", () => {
		render(<Input placeholder="Enter text" aria-label="Test input" />);
		const input = screen.getByPlaceholderText("Enter text");
		expect(input).toBeInTheDocument();
	});

	it("should be keyboard accessible", async () => {
		const user = userEvent.setup();
		render(<Input aria-label="Test input" />);

		const input = screen.getByLabelText("Test input");
		await user.tab();

		expect(input).toHaveFocus();
	});
});

describe("Label", () => {
	it("should render without accessibility violations", async () => {
		const { container } = render(<Label htmlFor="test">Test Label</Label>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should associate with input correctly", () => {
		render(
			<>
				<Label htmlFor="test-input">Test Label</Label>
				<Input id="test-input" />
			</>
		);

		const label = screen.getByText("Test Label");
		const input = screen.getByLabelText("Test Label");

		expect(label).toHaveAttribute("for", "test-input");
		expect(input).toHaveAttribute("id", "test-input");
	});

	it("should render custom content", () => {
		render(
			<Label htmlFor="test">
				<span>Custom</span> Label
			</Label>
		);

		expect(screen.getByText("Custom")).toBeInTheDocument();
		expect(screen.getByText("Label")).toBeInTheDocument();
	});
});
