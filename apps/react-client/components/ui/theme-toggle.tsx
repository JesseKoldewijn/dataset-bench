"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	// useEffect only runs on the client, so now we can safely show the UI
	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Render a placeholder with the same dimensions to avoid layout shift
		return (
			<Button
				variant="outline"
				size="icon"
				className="fixed top-4 right-4 z-50"
				disabled
				aria-label="Toggle theme"
			>
				<Sun className="h-[1.2rem] w-[1.2rem]" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<Button
			variant="outline"
			size="icon"
			className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
			aria-pressed={isDark}
		>
			{isDark ? (
				<Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
			) : (
				<Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
