import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./button";

expect.extend(toHaveNoViolations);

describe("Button", () => {
	it("should render without accessibility violations", async () => {
		const { container } = render(() => <Button>Click me</Button>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render button with text", () => {
		render(() => <Button>Click me</Button>);
		expect(
			screen.getByRole("button", { name: /click me/i })
		).toBeInTheDocument();
	});

	it("should handle click events", async () => {
		const user = userEvent.setup();
		let clicked = false;
		render(() => (
			<Button onClick={() => (clicked = true)}>Click me</Button>
		));

		const button = screen.getByRole("button");
		await user.click(button);

		expect(clicked).toBe(true);
	});

	it("should apply default variant", () => {
		render(() => <Button>Default</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-primary");
	});

	it("should apply destructive variant", () => {
		render(() => <Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-destructive");
	});

	it("should apply outline variant", () => {
		render(() => <Button variant="outline">Outline</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("border");
	});

	it("should apply secondary variant", () => {
		render(() => <Button variant="secondary">Secondary</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-secondary");
	});

	it("should apply ghost variant", () => {
		render(() => <Button variant="ghost">Ghost</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("hover:bg-accent");
	});

	it("should apply link variant", () => {
		render(() => <Button variant="link">Link</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("underline-offset-4");
	});

	it("should apply small size", () => {
		render(() => <Button size="sm">Small</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("h-8");
	});

	it("should apply large size", () => {
		render(() => <Button size="lg">Large</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("h-10");
	});

	it("should apply icon size", () => {
		render(() => <Button size="icon">×</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("h-9", "w-9");
	});

	it("should be disabled when disabled prop is true", () => {
		render(() => <Button disabled>Disabled</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
	});

	it("should not trigger click when disabled", async () => {
		const user = userEvent.setup();
		let clicked = false;
		render(() => (
			<Button disabled onClick={() => (clicked = true)}>
				Disabled
			</Button>
		));

		const button = screen.getByRole("button");
		await user.click(button);

		expect(clicked).toBe(false);
	});

	it("should accept custom className", () => {
		render(() => <Button class="custom-class">Custom</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("custom-class");
	});

	it("should render with children", () => {
		render(() => (
			<Button>
				<span>Icon</span>
				<span>Text</span>
			</Button>
		));
		expect(screen.getByText("Icon")).toBeInTheDocument();
		expect(screen.getByText("Text")).toBeInTheDocument();
	});

	it("should render without violations for all variants", async () => {
		const variants = [
			"default",
			"destructive",
			"outline",
			"secondary",
			"ghost",
			"link",
		] as const;

		for (const variant of variants) {
			const { container } = render(() => (
				<Button variant={variant}>Button</Button>
			));
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		}
	});

	it("should render without violations for all sizes", async () => {
		const sizes = ["default", "sm", "lg", "icon"] as const;

		for (const size of sizes) {
			const { container } = render(() => <Button size={size}>B</Button>);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		}
	});

	it("should accept type attribute", () => {
		render(() => <Button type="submit">Submit</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "submit");
	});
});
