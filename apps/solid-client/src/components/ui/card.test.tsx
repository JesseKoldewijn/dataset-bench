import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
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
	describe("Card", () => {
		it("should render without accessibility violations", async () => {
			const { container } = render(() => <Card>Content</Card>);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render with content", () => {
			render(() => <Card>Card content</Card>);
			expect(screen.getByText("Card content")).toBeInTheDocument();
		});

		it("should apply proper styling classes", () => {
			const { container } = render(() => <Card>Content</Card>);
			const card = container.firstChild as HTMLElement;
			expect(card).toHaveClass(
				"rounded-xl",
				"border",
				"bg-card",
				"shadow"
			);
		});

		it("should accept custom className", () => {
			const { container } = render(() => (
				<Card class="custom-class">Content</Card>
			));
			const card = container.firstChild as HTMLElement;
			expect(card).toHaveClass("custom-class");
		});
	});

	describe("CardHeader", () => {
		it("should render without accessibility violations", async () => {
			const { container } = render(() => <CardHeader>Header</CardHeader>);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render with content", () => {
			render(() => <CardHeader>Header content</CardHeader>);
			expect(screen.getByText("Header content")).toBeInTheDocument();
		});

		it("should apply proper styling classes", () => {
			const { container } = render(() => <CardHeader>Header</CardHeader>);
			const header = container.firstChild as HTMLElement;
			expect(header).toHaveClass(
				"flex",
				"flex-col",
				"space-y-1.5",
				"p-6"
			);
		});
	});

	describe("CardTitle", () => {
		it("should render without accessibility violations", async () => {
			const { container } = render(() => <CardTitle>Title</CardTitle>);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render with content", () => {
			render(() => <CardTitle>Card Title</CardTitle>);
			expect(screen.getByText("Card Title")).toBeInTheDocument();
		});

		it("should apply proper styling classes", () => {
			const { container } = render(() => <CardTitle>Title</CardTitle>);
			const title = container.firstChild as HTMLElement;
			expect(title).toHaveClass(
				"font-semibold",
				"leading-none",
				"tracking-tight"
			);
		});
	});

	describe("CardDescription", () => {
		it("should render without accessibility violations", async () => {
			const { container } = render(() => (
				<CardDescription>Description</CardDescription>
			));
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render with content", () => {
			render(() => <CardDescription>Card description</CardDescription>);
			expect(screen.getByText("Card description")).toBeInTheDocument();
		});

		it("should apply proper styling classes", () => {
			const { container } = render(() => (
				<CardDescription>Description</CardDescription>
			));
			const description = container.firstChild as HTMLElement;
			expect(description).toHaveClass("text-sm", "text-muted-foreground");
		});
	});

	describe("CardContent", () => {
		it("should render without accessibility violations", async () => {
			const { container } = render(() => (
				<CardContent>Content</CardContent>
			));
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render with content", () => {
			render(() => <CardContent>Card content</CardContent>);
			expect(screen.getByText("Card content")).toBeInTheDocument();
		});

		it("should apply proper styling classes", () => {
			const { container } = render(() => (
				<CardContent>Content</CardContent>
			));
			const content = container.firstChild as HTMLElement;
			expect(content).toHaveClass("p-6", "pt-0");
		});
	});

	describe("CardFooter", () => {
		it("should render without accessibility violations", async () => {
			const { container } = render(() => <CardFooter>Footer</CardFooter>);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render with content", () => {
			render(() => <CardFooter>Footer content</CardFooter>);
			expect(screen.getByText("Footer content")).toBeInTheDocument();
		});

		it("should apply proper styling classes", () => {
			const { container } = render(() => <CardFooter>Footer</CardFooter>);
			const footer = container.firstChild as HTMLElement;
			expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
		});
	});

	describe("Complete Card Structure", () => {
		it("should render complete card without violations", async () => {
			const { container } = render(() => (
				<Card>
					<CardHeader>
						<CardTitle>Test Title</CardTitle>
						<CardDescription>Test Description</CardDescription>
					</CardHeader>
					<CardContent>Test Content</CardContent>
					<CardFooter>Test Footer</CardFooter>
				</Card>
			));
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should render all parts correctly", () => {
			render(() => (
				<Card>
					<CardHeader>
						<CardTitle>Test Title</CardTitle>
						<CardDescription>Test Description</CardDescription>
					</CardHeader>
					<CardContent>Test Content</CardContent>
					<CardFooter>Test Footer</CardFooter>
				</Card>
			));

			expect(screen.getByText("Test Title")).toBeInTheDocument();
			expect(screen.getByText("Test Description")).toBeInTheDocument();
			expect(screen.getByText("Test Content")).toBeInTheDocument();
			expect(screen.getByText("Test Footer")).toBeInTheDocument();
		});
	});
});
