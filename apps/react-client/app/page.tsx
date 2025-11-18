import { DatasetGenerator } from "@/components/dataset-generator";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-2">Dataset Bench</h1>
					<p className="text-muted-foreground">
						Generate deterministic time-series datasets with
						customizable parameters
					</p>
				</div>
				<DatasetGenerator />
			</div>
		</main>
	);
}
