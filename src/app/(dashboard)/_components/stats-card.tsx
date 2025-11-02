import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
	title: string;
	value: string | number;
	description?: string;
	icon?: LucideIcon;
	className?: string;
	trend?: {
		value: number;
		label: string;
		isPositive: boolean;
	};
};

export default function StatsCard({
	title,
	value,
	description,
	icon: Icon,
	className,
	trend,
}: StatsCardProps) {
	return (
		<Card className={cn("", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
				{trend && (
					<div className="mt-2 flex items-center text-xs">
						<span
							className={cn(
								"font-medium",
								trend.isPositive ? "text-green-600" : "text-red-600",
							)}
						>
							{trend.isPositive ? "+" : ""}
							{trend.value}%
						</span>
						<span className="ml-1 text-muted-foreground">{trend.label}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
