"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { DatasetChart } from "@/components/dataset-chart";
import { client, type TimeUnit } from "@/lib/api/client";

export function DatasetGenerator() {
	const now = new Date();
	const oneMonthFromNow = new Date(now);
	oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

	const [startDate, setStartDate] = useState(now.toISOString());
	const [endDate, setEndDate] = useState(oneMonthFromNow.toISOString());
	const [points, setPoints] = useState<number | undefined>(100);
	const [pointBy, setPointBy] = useState<TimeUnit | undefined>(undefined);
	const [mode, setMode] = useState<"points" | "point_by">("points");

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["dataset", startDate, endDate, points, pointBy],
		queryFn: async () => {
			const params: any = {
				start: startDate,
				end: endDate,
			};

			if (mode === "points" && points) {
				params.points = points;
			} else if (mode === "point_by" && pointBy) {
				params.point_by = pointBy;
			}

			const { data, error } = await client.GET("/api/dataset", {
				params: { query: params },
			});

			if (error) throw new Error("Failed to fetch dataset");
			return data;
		},
		enabled: false,
	});

	const handleGenerate = () => {
		refetch();
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Dataset Configuration</CardTitle>
					<CardDescription>
						Configure the parameters for generating your time-series
						dataset
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="start-date">Start Date</Label>
							<Input
								id="start-date"
								type="datetime-local"
								value={startDate.slice(0, 16)}
								onChange={(e) =>
									setStartDate(e.target.value + ":00Z")
								}
								className="w-full"
							/>
						</div>{" "}
						<div className="space-y-2">
							<Label htmlFor="end-date">End Date</Label>
							<Input
								id="end-date"
								type="datetime-local"
								value={endDate.slice(0, 16)}
								onChange={(e) =>
									setEndDate(e.target.value + ":00Z")
								}
								className="w-full"
							/>
						</div>
					</div>
					<div className="space-y-4">
						<Label>Generation Mode</Label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="mode-points"
										checked={mode === "points"}
										onChange={() => setMode("points")}
										className="h-4 w-4 cursor-pointer"
									/>
									<Label
										htmlFor="mode-points"
										className="cursor-pointer"
									>
										By Number of Points
									</Label>
								</div>
								<Input
									type="number"
									placeholder="e.g., 100"
									value={points || ""}
									onChange={(e) =>
										setPoints(
											Number(e.target.value) || undefined
										)
									}
									disabled={mode !== "points"}
									min={1}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="mode-interval"
										checked={mode === "point_by"}
										onChange={() => setMode("point_by")}
										className="h-4 w-4 cursor-pointer"
									/>
									<Label
										htmlFor="mode-interval"
										className="cursor-pointer"
									>
										By Time Interval
									</Label>
								</div>
								<Select
									value={pointBy || ""}
									onChange={(value) =>
										setPointBy(
											(value as TimeUnit) || undefined
										)
									}
									disabled={mode !== "point_by"}
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
						disabled={isLoading}
						className="w-full"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Generating...
							</>
						) : (
							"Generate Dataset"
						)}
					</Button>
				</CardContent>
			</Card>

			{error && (
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="text-destructive">
							Error
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{String(error)}
						</p>
					</CardContent>
				</Card>
			)}

			{data && (
				<Card>
					<CardHeader>
						<CardTitle>Generated Dataset</CardTitle>
						<CardDescription>
							{data.count} data points from{" "}
							{format(new Date(data.start), "PPpp")} to{" "}
							{format(new Date(data.end), "PPpp")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<DatasetChart data={data.data} />
					</CardContent>
				</Card>
			)}
		</div>
	);
}
