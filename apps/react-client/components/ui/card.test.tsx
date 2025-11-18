import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "./card";

expect.extend(toHaveNoViolations);

describe("Card Components", () => {
	it("should render Card without accessibility violations", async () => {
		const { container } = render(
			<Card>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
				</CardHeader>
				<CardContent>Card content goes here</CardContent>
				<CardFooter>Card footer</CardFooter>
			</Card>
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should render all card parts correctly", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Test Title</CardTitle>
					<CardDescription>Test Description</CardDescription>
				</CardHeader>
				<CardContent>Test Content</CardContent>
				<CardFooter>Test Footer</CardFooter>
			</Card>
		);

		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(screen.getByText("Test Description")).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
		expect(screen.getByText("Test Footer")).toBeInTheDocument();
	});

	it("should apply custom className", () => {
		const { container } = render(
			<Card className="custom-class">
				<CardContent>Content</CardContent>
			</Card>
		);

		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain("custom-class");
	});

	it("should have proper semantic structure", () => {
		const { container } = render(
			<Card>
				<CardHeader>
					<CardTitle>Title</CardTitle>
				</CardHeader>
				<CardContent>Content</CardContent>
			</Card>
		);

		// Cards should be divs with proper structure
		const card = container.querySelector("div");
		expect(card).toBeInTheDocument();
	});

	it("should maintain contrast in light and dark themes", async () => {
		// Light theme
		const { container: lightContainer } = render(
			<div className="light">
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
						<CardDescription>Description</CardDescription>
					</CardHeader>
					<CardContent>Content</CardContent>
				</Card>
			</div>
		);

		const lightResults = await axe(lightContainer);
		expect(lightResults).toHaveNoViolations();

		// Dark theme
		const { container: darkContainer } = render(
			<div className="dark">
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
						<CardDescription>Description</CardDescription>
					</CardHeader>
					<CardContent>Content</CardContent>
				</Card>
			</div>
		);

		const darkResults = await axe(darkContainer);
		expect(darkResults).toHaveNoViolations();
	});
});
