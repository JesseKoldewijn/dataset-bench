import { createSignal, onMount, Show } from "solid-js";
import { Moon, Sun } from "lucide-solid";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
	const [mounted, setMounted] = createSignal(false);
	const [theme, setTheme] = createSignal<"light" | "dark">("light");

	onMount(() => {
		// Check for saved theme preference or default to 'light'
		const savedTheme = localStorage.getItem("theme") as
			| "light"
			| "dark"
			| null;
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;

		const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
		setTheme(initialTheme);

		setMounted(true);
	});

	const toggleTheme = () => {
		const newTheme = theme() === "dark" ? "light" : "dark";
		setTheme(newTheme);
		document.documentElement.classList.toggle("dark", newTheme === "dark");
		localStorage.setItem("theme", newTheme);
	};

	return (
		<Show
			when={mounted()}
			fallback={
				<Button
					variant="outline"
					size="icon"
					class="fixed top-4 right-4 z-50"
					disabled
					aria-label="Toggle theme"
				>
					<Sun class="h-[1.2rem] w-[1.2rem]" />
					<span class="sr-only">Toggle theme</span>
				</Button>
			}
		>
			<Button
				variant="outline"
				size="icon"
				class="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
				onClick={toggleTheme}
				aria-label={`Switch to ${
					theme() === "dark" ? "light" : "dark"
				} mode`}
				aria-pressed={theme() === "dark"}
			>
				<Show
					when={theme() === "dark"}
					fallback={
						<Moon class="h-[1.2rem] w-[1.2rem] transition-all" />
					}
				>
					<Sun class="h-[1.2rem] w-[1.2rem] transition-all" />
				</Show>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</Show>
	);
}
