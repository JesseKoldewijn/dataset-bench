import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
	title: "Dataset Bench - Time Series Data Generator",
	description: "A deterministic time-series dataset generation tool",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Providers>
					<ThemeToggle />
					{children}
				</Providers>
			</body>
		</html>
	);
}
