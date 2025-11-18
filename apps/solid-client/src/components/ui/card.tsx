import { splitProps, type JSX } from "solid-js";
import { cn } from "~/lib/utils";

export function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn(
				"rounded-xl border bg-card text-card-foreground shadow",
				local.class
			)}
			{...rest}
		/>
	);
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn("flex flex-col space-y-1.5 p-6", local.class)}
			{...rest}
		/>
	);
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn("font-semibold leading-none tracking-tight", local.class)}
			{...rest}
		/>
	);
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn("text-sm text-muted-foreground", local.class)}
			{...rest}
		/>
	);
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("p-6 pt-0", local.class)} {...rest} />;
}

export function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div class={cn("flex items-center p-6 pt-0", local.class)} {...rest} />
	);
}
