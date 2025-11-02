"use client";

import { ActiveSearchParameters } from "@views/catalog/_components/molecules/active-filter-badges";
import { ResultCount } from "@views/catalog/_components/molecules/result-count";
import { useCatalogFilters } from "@views/catalog/_hooks/use-catalog";
import type { CatalogSortOption } from "@views/catalog/_utils/search-parameters.utils";
import {
	ArrowDownAZ,
	ArrowDownZA,
	ArrowUpDown,
	Building2,
	Filter,
	SortAsc,
	SortDesc,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type CatalogFiltersProps = {
	profileSuppliers?: Array<{
		id: string;
		name: string;
	}>;
	totalResults?: number;
	showControls?: boolean;
	showBadges?: boolean;
	showResultCount?: boolean;
	// Receive current search params as props to avoid multiple useSearchParams() calls
	currentProfileSupplier?: string;
	currentSort?: string;
	currentSearchQuery?: string;
};

/**
 * Catalog Filters Component
 * Issue: #002-ui-ux-requirements
 *
 * Presentational component for filtering and sorting catalog items.
 * Refactored following SOLID principles:
 * - Single Responsibility: Only handles UI rendering and event delegation
 * - Open/Closed: Extensible through composition with subcomponents
 * - Dependency Inversion: Delegates all logic to useCatalogFilters hook
 *
 * Composition with:
 * - ActiveSearchParameters: Displays ALL search parameters (q, sort, filters)
 * - ResultCount: Displays result count
 *
 * Memory Leak Fix:
 * - Receives searchParams as props instead of calling useSearchParams()
 * - Prevents EventEmitter memory leak warning
 * - Only one instance should be rendered per page (avoid duplicate listeners)
 *
 * Following UX best practices from Lollypop Design:
 * - Icon-first minimalist design
 * - Clear filter state visibility
 * - URL-based state management with query params
 * - Type-safe navigation with Next.js hooks
 */
export function CatalogFilters({
	profileSuppliers = [],
	totalResults,
	showControls = true,
	showBadges = true,
	showResultCount = true,
	currentProfileSupplier = "all",
	currentSort = "name-asc",
	currentSearchQuery,
}: CatalogFiltersProps) {
	// Delegate all logic to custom hook (SRP - Single Responsibility)
	const {
		handleClearFilters,
		handleProfileSupplierChange,
		handleRemoveProfileSupplier,
		handleRemoveSearch,
		handleRemoveSort,
		handleSortChange,
		hasActiveParameters,
		selectedProfileSupplierName,
	} = useCatalogFilters(
		{
			currentProfileSupplier,
			currentSearchQuery,
			currentSort,
		},
		profileSuppliers,
	);

	return (
		<div className="flex w-full flex-col gap-3">
			{/* Filter Controls - Compact on desktop, stacked on mobile */}
			{showControls && (
				<div className="flex w-full flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-end">
					<div className="hidden items-center gap-2 text-muted-foreground text-sm md:flex">
						<Filter className="size-4" />
						<span>Filtros</span>
					</div>

					{/* Profile Supplier filter */}
					{profileSuppliers.length > 0 && (
						<Select
							onValueChange={handleProfileSupplierChange}
							value={currentProfileSupplier}
						>
							<SelectTrigger className="w-full gap-2 md:w-auto md:min-w-[180px]">
								<Building2 className="size-4 opacity-70" />
								<SelectValue placeholder="Proveedor" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Proveedor de Perfiles</SelectLabel>
									<SelectItem value="all">Todos</SelectItem>
									{profileSuppliers.map((supplier) => (
										<SelectItem key={supplier.id} value={supplier.id}>
											{supplier.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					)}

					{/* Sort filter */}
					<Select onValueChange={handleSortChange} value={currentSort}>
						<SelectTrigger className="w-full gap-2 md:w-auto md:min-w-[180px]">
							<ArrowUpDown className="size-4 opacity-70" />
							<SelectValue placeholder="Ordenar" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Ordenar por</SelectLabel>
								<SelectItem value="name-asc">
									<div className="flex items-center gap-2">
										<ArrowDownAZ className="size-4 opacity-70" />
										Nombre (A-Z)
									</div>
								</SelectItem>
								<SelectItem value="name-desc">
									<div className="flex items-center gap-2">
										<ArrowDownZA className="size-4 opacity-70" />
										Nombre (Z-A)
									</div>
								</SelectItem>
								<SelectItem value="price-asc">
									<div className="flex items-center gap-2">
										<SortAsc className="size-4 opacity-70" />
										Precio (menor)
									</div>
								</SelectItem>
								<SelectItem value="price-desc">
									<div className="flex items-center gap-2">
										<SortDesc className="size-4 opacity-70" />
										Precio (mayor)
									</div>
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Full-width section for badges and result count */}
			<div className="w-full space-y-3">
				{/* Active Search Parameters - Badges Section */}
				{showBadges && hasActiveParameters && (
					<ActiveSearchParameters
						onClearAllAction={handleClearFilters}
						onRemoveProfileSupplierAction={handleRemoveProfileSupplier}
						onRemoveSearchAction={handleRemoveSearch}
						onRemoveSortAction={handleRemoveSort}
						searchQuery={currentSearchQuery ?? ""}
						selectedProfileSupplierName={selectedProfileSupplierName ?? null}
						sortType={currentSort as CatalogSortOption}
					/>
				)}

				{/* Results count */}
				{showResultCount && <ResultCount totalResults={totalResults} />}
			</div>
		</div>
	);
}
