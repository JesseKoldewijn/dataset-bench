import { createSignal, Show } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { format } from "date-fns";
import { Loader2, LoaderCircle } from "lucide-solid";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectOption } from "~/components/ui/select";
import { DatasetChart } from "~/components/dataset-chart";
import { client, type TimeUnit } from "~/lib/api/client";

export function DatasetGenerator() {
	const now = new Date();
	const oneMonthFromNow = new Date(now);
	oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

	const [startDate, setStartDate] = createSignal(
		now.toISOString().slice(0, -1)
	);
	const [endDate, setEndDate] = createSignal(
		oneMonthFromNow.toISOString().slice(0, -1)
	);
	const [points, setPoints] = createSignal<number | undefined>(100);
	const [pointBy, setPointBy] = createSignal<TimeUnit | undefined>(undefined);
	const [mode, setMode] = createSignal<"points" | "point_by">("points");

	// Track submitted parameters separately from form state
	const [submittedParams, setSubmittedParams] = createSignal<{
		start: string;
		end: string;
		points?: number;
		pointBy?: TimeUnit;
		mode: "points" | "point_by";
	} | null>(null);

	let pointsInputRef: HTMLInputElement | undefined;
	let startDateInputRef: HTMLInputElement | undefined;
	let endDateInputRef: HTMLInputElement | undefined;

	const query = createQuery(() => ({
		queryKey: ["dataset", submittedParams()],
		queryFn: async () => {
			const params = submittedParams();
			if (!params) return null;

			// Ensure dates are in proper ISO 8601 format with Z suffix
			const start = params.start.endsWith("Z")
				? params.start
				: params.start + "Z";
			const end = params.end.endsWith("Z")
				? params.end
				: params.end + "Z";

			const queryParams: any = {
				start,
				end,
			};

			if (params.mode === "points" && params.points) {
				queryParams.points = params.points;
			} else if (params.mode === "point_by" && params.pointBy) {
				queryParams.point_by = params.pointBy;
			}

			const { data, error } = await client.GET("/api/dataset", {
				params: { query: queryParams },
			});

			if (error) throw new Error("Failed to fetch dataset");
			return data;
		},
		enabled: () => submittedParams() !== null,
	}));

	const handleGenerate = () => {
		setSubmittedParams({
			start: startDate(),
			end: endDate(),
			points: points(),
			pointBy: pointBy(),
			mode: mode(),
		});
	};

	return (
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Dataset Configuration</CardTitle>
					<CardDescription>
						Configure the parameters for generating your time-series
						dataset
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="start-date">Start Date</Label>
							<Input
								ref={startDateInputRef}
								id="start-date"
								type="datetime-local"
								value={startDate().slice(0, 16)}
								onInput={(e) => {
									const value = e.currentTarget.value;
									if (value) {
										setStartDate(
											new Date(value)
												.toISOString()
												.slice(0, -1)
										);
									}
								}}
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							/>
						</div>
						<div class="space-y-2">
							<Label for="end-date">End Date</Label>
							<Input
								ref={endDateInputRef}
								id="end-date"
								type="datetime-local"
								value={endDate().slice(0, 16)}
								onInput={(e) => {
									const value = e.currentTarget.value;
									if (value) {
										setEndDate(
											new Date(value)
												.toISOString()
												.slice(0, -1)
										);
									}
								}}
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							/>
						</div>
					</div>
					<div class="space-y-4">
						<Label>Generation Mode</Label>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-2">
								<div class="flex items-center space-x-2">
									<input
										type="radio"
										id="mode-points"
										checked={mode() === "points"}
										onChange={() => setMode("points")}
										class="h-4 w-4 cursor-pointer"
									/>
									<Label
										for="mode-points"
										class="cursor-pointer"
									>
										By Number of Points
									</Label>
								</div>
								<Input
									ref={pointsInputRef}
									type="number"
									placeholder="e.g., 100"
									value={points() || ""}
									onChange={(e) => {
										const val = Number(
											e.currentTarget.value
										);
										setPoints(val || undefined);
									}}
									disabled={mode() !== "points"}
									min={1}
									class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
								/>
							</div>

							<div class="space-y-2">
								<div class="flex items-center space-x-2">
									<input
										type="radio"
										id="mode-interval"
										checked={mode() === "point_by"}
										onChange={() => setMode("point_by")}
										class="h-4 w-4 cursor-pointer"
									/>
									<Label
										for="mode-interval"
										class="cursor-pointer"
									>
										By Time Interval
									</Label>
								</div>
								<Select
									value={pointBy() || ""}
									onChange={(value) =>
										setPointBy(
											(value as TimeUnit) || undefined
										)
									}
									disabled={mode() !== "point_by"}
									placeholder="Select interval"
								>
									<SelectOption value="minutes">
										Minutes
									</SelectOption>
									<SelectOption value="hours">
										Hours
									</SelectOption>
									<SelectOption value="days">
										Days
									</SelectOption>
									<SelectOption value="weeks">
										Weeks
									</SelectOption>
									<SelectOption value="months">
										Months
									</SelectOption>
								</Select>
							</div>
						</div>
					</div>
					<Button
						onClick={handleGenerate}
						disabled={query.isLoading}
						class="w-full"
					>
						<Show
							when={!query.isLoading}
							fallback={
								<>
									<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
									Generating...
								</>
							}
						>
							Generate Dataset
						</Show>
					</Button>
				</CardContent>
			</Card>

			<Show when={query.error}>
				<Card class="border-destructive">
					<CardHeader>
						<CardTitle class="text-destructive">Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							{String(query.error)}
						</p>
					</CardContent>
				</Card>
			</Show>

			<Show when={query.data}>
				{(data) => (
					<Card>
						<CardHeader>
							<CardTitle>Generated Dataset</CardTitle>
							<CardDescription>
								{data().count} data points from{" "}
								{format(new Date(data().start), "PPpp")} to{" "}
								{format(new Date(data().end), "PPpp")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DatasetChart data={data().data} />
						</CardContent>
					</Card>
				)}
			</Show>
		</div>
	);
}
