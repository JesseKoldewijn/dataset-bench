import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./button";

expect.extend(toHaveNoViolations);

describe("Button", () => {
	it("should render without accessibility violations", async () => {
		const { container } = render(<Button>Click me</Button>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render with correct text", () => {
		render(<Button>Click me</Button>);
		expect(
			screen.getByRole("button", { name: "Click me" })
		).toBeInTheDocument();
	});

	it("should handle click events", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(handleClick).toHaveBeenCalledOnce();
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Click me</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
	});

	it("should not trigger click when disabled", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Click me
			</Button>
		);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(handleClick).not.toHaveBeenCalled();
	});

	it("should render different variants without violations", async () => {
		const variants = [
			"default",
			"destructive",
			"outline",
			"secondary",
			"ghost",
			"link",
		] as const;

		for (const variant of variants) {
			const { container } = render(
				<Button variant={variant}>{variant} button</Button>
			);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		}
	});

	it("should be keyboard accessible", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		const button = screen.getByRole("button");
		button.focus();
		expect(button).toHaveFocus();

		await user.keyboard("{Enter}");
		expect(handleClick).toHaveBeenCalled();
	});

	it("should render with icons and maintain accessibility", async () => {
		const { container } = render(
			<Button>
				<span>Icon</span>
				Click me
			</Button>
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
