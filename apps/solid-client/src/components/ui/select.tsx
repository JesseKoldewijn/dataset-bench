import {
	createSignal,
	splitProps,
	Show,
	For,
	children as resolveChildren,
	onCleanup,
	type JSX,
	onMount,
} from "solid-js";
import { ChevronDown } from "lucide-solid";
import { cn } from "~/lib/utils";

export interface SelectProps {
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	class?: string;
	children?: JSX.Element;
	placeholder?: string;
}

export function Select(props: SelectProps) {
	const [local] = splitProps(props, [
		"value",
		"onChange",
		"disabled",
		"class",
		"children",
		"placeholder",
	]);
	const [isOpen, setIsOpen] = createSignal(false);

	let selectRef: HTMLDivElement | undefined;

	const handleClickOutside = (event: MouseEvent) => {
		if (selectRef && !selectRef.contains(event.target as Node)) {
			setIsOpen(false);
		}
	};

	onMount(() => {
		// Add click listener when component mounts
		document.addEventListener("mousedown", handleClickOutside);

		// Clean up listener when component unmounts
		onCleanup(() => {
			document.removeEventListener("mousedown", handleClickOutside);
		});
	});

	const resolved = resolveChildren(() => local.children);

	const options = () => {
		const kids = resolved();
		if (Array.isArray(kids)) {
			return kids.filter(
				(child) =>
					typeof child === "object" &&
					child !== null &&
					"value" in child
			);
		}
		return [];
	};

	const selectedOption = () => {
		return options().find(
			(option: any) => option.value === local.value && local.value !== ""
		);
	};

	return (
		<div ref={selectRef} class={cn("relative w-full", local.class)}>
			<button
				type="button"
				onClick={() => !local.disabled && setIsOpen(!isOpen())}
				disabled={local.disabled}
				class={cn(
					"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
					!local.value && "text-muted-foreground"
				)}
			>
				<span>
					{(selectedOption() as any)?.children || local.placeholder}
				</span>
				<ChevronDown class="h-4 w-4 opacity-50" />
			</button>
			<Show when={isOpen() && !local.disabled}>
				<div class="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
					<div class="max-h-60 overflow-auto p-1">
						<For each={options()}>
							{(option: any) => (
								<button
									type="button"
									onClick={() => {
										local.onChange?.(option.value);
										setIsOpen(false);
									}}
									class={cn(
										"w-full text-left px-3 py-2 text-sm rounded-sm transition-colors cursor-pointer",
										local.value === option.value
											? "bg-accent text-accent-foreground"
											: "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
									)}
								>
									{option.children}
								</button>
							)}
						</For>
					</div>
				</div>
			</Show>
		</div>
	);
}

export interface SelectOptionProps {
	value: string;
	children: JSX.Element;
}

export function SelectOption(props: SelectOptionProps) {
	return props as any;
}
