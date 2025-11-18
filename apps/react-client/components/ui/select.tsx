"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOptionProps {
	value: string;
	children: React.ReactNode;
}

export interface SelectProps {
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
	children?: React.ReactNode;
	placeholder?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
	({ value, onChange, disabled, className, children, placeholder }, ref) => {
		const [isOpen, setIsOpen] = React.useState(false);
		const selectRef = React.useRef<HTMLDivElement>(null);

		React.useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					selectRef.current &&
					!selectRef.current.contains(event.target as Node)
				) {
					setIsOpen(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		const options = React.Children.toArray(children).filter(
			(child): child is React.ReactElement<SelectOptionProps> => {
				if (!React.isValidElement(child)) {
					return false;
				}
				const props = child.props as Partial<SelectOptionProps>;
				return typeof props.value === "string";
			}
		);

		const selectedOption = options.find(
			(option) => option.props.value === value && value !== ""
		);
		return (
			<div ref={selectRef} className={cn("relative w-full", className)}>
				<button
					type="button"
					onClick={() => !disabled && setIsOpen(!isOpen)}
					disabled={disabled}
					className={cn(
						"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
						!value && "text-muted-foreground"
					)}
				>
					<span>{selectedOption?.props.children || placeholder}</span>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</button>
				{isOpen && !disabled && (
					<div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
						<div className="max-h-60 overflow-auto p-1">
							{options.map((option, index) => (
								<button
									key={index}
									type="button"
									onClick={() => {
										onChange?.(option.props.value);
										setIsOpen(false);
									}}
									className={cn(
										"w-full text-left px-3 py-2 text-sm rounded-sm transition-colors cursor-pointer",
										value === option.props.value
											? "bg-accent text-accent-foreground"
											: "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
									)}
								>
									{option.props.children}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}
);
Select.displayName = "Select";

const SelectOption: React.FC<SelectOptionProps> = ({ children }) => {
	return <>{children}</>;
};
SelectOption.displayName = "SelectOption";

export { Select, SelectOption };
