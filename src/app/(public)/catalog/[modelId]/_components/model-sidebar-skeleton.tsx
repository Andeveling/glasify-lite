/** biome-ignore-all lint/suspicious/noArrayIndexKey: Using array index as key is acceptable here because skeleton items are purely presentational and do not require stable identity. */
/** biome-ignore-all lint/style/noMagicNumbers: Magic numbers are used intentionally for animation delays and skeleton layout to match the design specification. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ModelSidebarSkeleton() {
	return (
		<div className="space-y-6">
			{/* Model Info Skeleton */}
			<Card className="overflow-hidden">
				<Skeleton className="h-64 w-full" />
				<div className="space-y-4 p-6">
					<Skeleton className="h-8 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-20 w-full" />
				</div>
			</Card>

			{/* Dimensions Skeleton */}
			<Card className="p-6">
				<Skeleton className="mb-4 h-6 w-1/2" />
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</Card>

			{/* Features Skeleton */}
			<Card className="p-6">
				<Skeleton className="mb-4 h-6 w-1/3" />
				<div className="space-y-3">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-4/6" />
					<Skeleton className="h-4 w-full" />
				</div>
			</Card>
		</div>
	);
}
