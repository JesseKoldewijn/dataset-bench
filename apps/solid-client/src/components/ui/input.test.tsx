import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Input } from "./input";

expect.extend(toHaveNoViolations);

describe("Input", () => {
	it("should render without accessibility violations", async () => {
		const { container } = render(() => <Input aria-label="Test input" />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render input element", () => {
		const { container } = render(() => <Input />);
		const input = container.querySelector("input");
		expect(input).toBeInTheDocument();
	});

	it("should accept value prop", () => {
		render(() => <Input value="test value" />);
		const input = screen.getByDisplayValue("test value");
		expect(input).toBeInTheDocument();
	});

	it("should accept placeholder", () => {
		render(() => <Input placeholder="Enter text" />);
		const input = screen.getByPlaceholderText("Enter text");
		expect(input).toBeInTheDocument();
	});

	it("should accept different input types", () => {
		const types = ["text", "email", "password", "number", "datetime-local"];

		types.forEach((type) => {
			const { container } = render(() => <Input type={type as any} />);
			const input = container.querySelector("input");
			expect(input).toHaveAttribute("type", type);
		});
	});

	it("should handle onInput events", async () => {
		const user = userEvent.setup();
		let inputValue = "";
		render(() => (
			<Input onInput={(e) => (inputValue = e.currentTarget.value)} />
		));

		const input = document.querySelector("input")!;
		await user.type(input, "hello");

		expect(inputValue).toBe("hello");
	});

	it("should be disabled when disabled prop is true", () => {
		const { container } = render(() => <Input disabled />);
		const input = container.querySelector("input");
		expect(input).toBeDisabled();
	});

	it("should accept custom className", () => {
		const { container } = render(() => <Input class="custom-class" />);
		const input = container.querySelector("input");
		expect(input).toHaveClass("custom-class");
	});

	it("should have proper styling classes", () => {
		const { container } = render(() => <Input />);
		const input = container.querySelector("input");
		expect(input).toHaveClass(
			"flex",
			"h-9",
			"w-full",
			"rounded-md",
			"border",
			"border-input"
		);
	});

	it("should accept min and max for number inputs", () => {
		const { container } = render(() => (
			<Input type="number" min={0} max={100} />
		));
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("min", "0");
		expect(input).toHaveAttribute("max", "100");
	});

	it("should accept required attribute", () => {
		const { container } = render(() => <Input required />);
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("required");
	});

	it("should accept id attribute", () => {
		const { container } = render(() => <Input id="test-input" />);
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("id", "test-input");
	});

	it("should render without violations when disabled", async () => {
		const { container } = render(() => (
			<Input disabled aria-label="Test input" />
		));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should accept aria-label", () => {
		const { container } = render(() => <Input aria-label="Search" />);
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("aria-label", "Search");
	});

	it("should handle onChange events", async () => {
		const user = userEvent.setup();
		let changed = false;
		render(() => <Input onInput={() => (changed = true)} />);

		const input = document.querySelector("input")!;
		await user.type(input, "a");

		expect(changed).toBe(true);
	});
});
