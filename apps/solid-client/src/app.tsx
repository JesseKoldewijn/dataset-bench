// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MetaProvider } from "@solidjs/meta";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import "~/app.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			refetchOnWindowFocus: false,
		},
	},
});

export default function App() {
	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<QueryClientProvider client={queryClient}>
						<ThemeToggle />
						<Suspense>{props.children}</Suspense>
					</QueryClientProvider>
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
