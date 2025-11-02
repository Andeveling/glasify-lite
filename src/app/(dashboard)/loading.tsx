/** biome-ignore-all lint/suspicious/noArrayIndexKey: Using array index as key is acceptable here because skeleton items are purely presentational and do not require stable identity. */
/** biome-ignore-all lint/style/noMagicNumbers: Magic numbers are used intentionally for animation delays and skeleton layout to match the design specification. */
import { generateStableKeyedArray } from "@/app/_utils/generate-keys.util";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_SKELETON_COUNT = 6;
const STATS_CARD_COUNT = 4;
const TABLE_HEADER_COUNT = 5;
const TABLE_ROW_COUNT = 8;
const TABLE_CELL_COUNT = 5;

export default function DashboardLoading() {
	const navItems = generateStableKeyedArray(NAV_SKELETON_COUNT, "nav-skeleton");
	const statsCards = generateStableKeyedArray(STATS_CARD_COUNT, "stats-card");
	const tableHeaders = generateStableKeyedArray(
		TABLE_HEADER_COUNT,
		"table-header",
	);
	const tableRows = generateStableKeyedArray(TABLE_ROW_COUNT, "table-row");

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar skeleton */}
			<div className="w-64 space-y-4 border-border border-r bg-muted/5 p-4">
				{/* Logo skeleton */}
				<div className="mb-8 flex items-center space-x-2">
					<Skeleton className="h-8 w-8 rounded" />
					<Skeleton className="h-6 w-24" />
				</div>

				{/* Navigation skeleton */}
				<nav className="space-y-2">
					{navItems.map((item) => (
						<div className="flex items-center space-x-3 p-2" key={item.key}>
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-4 w-20" />
						</div>
					))}
				</nav>

				{/* User section skeleton */}
				<div className="absolute right-4 bottom-4 left-4">
					<div className="flex items-center space-x-3 p-2">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="space-y-1">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				</div>
			</div>

			{/* Main content area */}
			<div className="flex flex-1 flex-col">
				{/* Header skeleton */}
				<header className="border-border border-b p-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-64" />
						</div>
						<div className="flex items-center space-x-4">
							<Skeleton className="h-8 w-8 rounded" />
							<Skeleton className="h-8 w-8 rounded" />
							<Skeleton className="h-8 w-24" />
						</div>
					</div>
				</header>

				{/* Main content skeleton */}
				<main className="flex-1 overflow-auto p-6">
					{/* Stats cards skeleton */}
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{statsCards.map((item) => (
							<div
								className="space-y-3 rounded-lg border border-border p-4"
								key={item.key}
							>
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-4" />
								</div>
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-3 w-24" />
							</div>
						))}
					</div>

					{/* Data table skeleton */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Skeleton className="h-6 w-32" />
							<div className="flex space-x-2">
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-16" />
							</div>
						</div>

						{/* Table header */}
						<div className="rounded-lg border border-border">
							<div className="flex space-x-4 border-border border-b bg-muted/5 p-4">
								{tableHeaders.map((item) => (
									<Skeleton className="h-4 flex-1" key={item.key} />
								))}
							</div>

							{/* Table rows */}
							{tableRows.map((rowItem) => {
								const tableCells = generateStableKeyedArray(
									TABLE_CELL_COUNT,
									`table-cell-${rowItem.index}`,
								);
								return (
									<div
										className="flex space-x-4 border-border border-b p-4 last:border-b-0"
										key={rowItem.key}
									>
										{tableCells.map((cellItem) => (
											<Skeleton className="h-4 flex-1" key={cellItem.key} />
										))}
									</div>
								);
							})}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
