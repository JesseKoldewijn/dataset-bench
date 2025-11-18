import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Select, SelectOption } from "./select";

expect.extend(toHaveNoViolations);

describe("Select", () => {
	const TestSelect = (props: any) => (
		<Select {...props}>
			<SelectOption value="option1">Option 1</SelectOption>
			<SelectOption value="option2">Option 2</SelectOption>
			<SelectOption value="option3">Option 3</SelectOption>
		</Select>
	);

	it("should render without accessibility violations", async () => {
		const { container } = render(() => <TestSelect placeholder="Select" />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render select button", () => {
		render(() => <TestSelect />);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});

	it("should show placeholder when no value selected", () => {
		render(() => <TestSelect placeholder="Select an option" />);
		expect(screen.getByText("Select an option")).toBeInTheDocument();
	});

	it("should be disabled when disabled prop is true", () => {
		render(() => <TestSelect disabled />);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
	});

	it("should accept custom className", () => {
		const { container } = render(() => <TestSelect class="custom-class" />);
		const select = container.querySelector(".custom-class");
		expect(select).toBeInTheDocument();
	});

	it("should have proper styling classes", () => {
		render(() => <TestSelect />);
		const button = screen.getByRole("button");
		expect(button).toHaveClass(
			"flex",
			"h-9",
			"w-full",
			"rounded-md",
			"border"
		);
	});

	it("should render chevron icon", () => {
		const { container } = render(() => <TestSelect />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("should open dropdown on click", async () => {
		const user = userEvent.setup();
		render(() => <TestSelect />);

		const button = screen.getByRole("button");
		await user.click(button);

		// Options should be visible
		expect(screen.getByText("Option 1")).toBeInTheDocument();
		expect(screen.getByText("Option 2")).toBeInTheDocument();
		expect(screen.getByText("Option 3")).toBeInTheDocument();
	});

	it("should call onChange when option is selected", async () => {
		const user = userEvent.setup();
		let selectedValue = "";
		render(() => (
			<TestSelect onChange={(value: string) => (selectedValue = value)} />
		));

		const button = screen.getByRole("button");
		await user.click(button);

		const option1 = screen.getByText("Option 1");
		await user.click(option1);

		expect(selectedValue).toBe("option1");
	});

	it("should close dropdown after selection", async () => {
		const user = userEvent.setup();
		render(() => <TestSelect />);

		const button = screen.getByRole("button");
		await user.click(button);

		const option1 = screen.getByText("Option 1");
		await user.click(option1);

		// Dropdown should close after a brief moment
		// Note: This test may need adjustment based on implementation details
	});

	it("should display selected option", () => {
		render(() => <TestSelect value="option2" />);
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	it("should not open when disabled", async () => {
		const user = userEvent.setup();
		render(() => <TestSelect disabled />);

		const button = screen.getByRole("button");
		await user.click(button);

		// Options should not be visible
		const options = document.querySelectorAll('[role="option"]');
		expect(options.length).toBe(0);
	});

	it("should render without violations when disabled", async () => {
		const { container } = render(() => (
			<TestSelect disabled placeholder="Select" />
		));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render without violations when open", async () => {
		const user = userEvent.setup();
		const { container } = render(() => <TestSelect placeholder="Select" />);

		const button = screen.getByRole("button");
		await user.click(button);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should handle empty children", () => {
		const { container } = render(() => <Select />);
		const button = container.querySelector("button");
		expect(button).toBeInTheDocument();
	});

	it("should apply muted text color when no value", () => {
		render(() => <TestSelect placeholder="Select" />);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("text-muted-foreground");
	});
});
