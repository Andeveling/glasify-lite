/**
 * Quotes Pagination Component (T035)
 *
 * Client Component for pagination controls
 * Uses URL search params for state management
 *
 * Features:
 * - Previous/Next buttons
 * - Page number display
 * - Result counter (Spanish)
 * - Preserves filters/search/sort in URL
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type QuotesPaginationProps = {
	total: number;
	totalPages: number;
	page: number;
	limit: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export function QuotesPagination({
	total,
	totalPages,
	page,
	limit,
	hasNextPage,
	hasPreviousPage,
}: QuotesPaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(newPage));
		router.push(`?${params.toString()}`);
	};

	const startItem = (page - 1) * limit + 1;
	const endItem = Math.min(page * limit, total);

	if (total === 0) {
		return null;
	}

	return (
		<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
			{/* Result counter */}
			<p className="text-muted-foreground text-sm">
				Mostrando {startItem}-{endItem} de {total} cotizaciones
			</p>

			{/* Pagination controls */}
			<div className="flex items-center gap-2">
				<Button
					disabled={!hasPreviousPage}
					onClick={() => handlePageChange(page - 1)}
					size="sm"
					variant="outline"
				>
					<ChevronLeft className="mr-1 size-4" />
					Anterior
				</Button>

				<div className="flex items-center gap-2">
					<span className="text-sm">
						Página {page} de {totalPages}
					</span>
				</div>

				<Button
					disabled={!hasNextPage}
					onClick={() => handlePageChange(page + 1)}
					size="sm"
					variant="outline"
				>
					Siguiente
					<ChevronRight className="ml-1 size-4" />
				</Button>
			</div>
		</div>
	);
}
