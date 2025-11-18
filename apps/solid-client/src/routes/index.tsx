import { Title, Meta } from "@solidjs/meta";
import { DatasetGenerator } from "~/components/dataset-generator";

export default function Home() {
	return (
		<>
			<Title>Dataset Bench - Time Series Data Generator</Title>
			<Meta
				name="description"
				content="A deterministic time-series dataset generation tool"
			/>
			<main class="min-h-screen bg-background">
				<div class="container mx-auto px-4 py-8">
					<div class="mb-8">
						<h1 class="text-4xl font-bold mb-2">Dataset Bench</h1>
						<p class="text-muted-foreground">
							Generate deterministic time-series datasets with
							customizable parameters
						</p>
					</div>
					<DatasetGenerator />
				</div>
			</main>
		</>
	);
}
