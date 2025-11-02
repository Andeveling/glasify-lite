/**
 * Pagination Component
 *
 * Reusable pagination controls
 * Follows Single Responsibility Principle - only handles pagination UI
 */

"use client";

import { Button } from "@/components/ui/button";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function Pagination({
	currentPage,
	onPageChange,
	totalPages,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="mt-4 flex items-center justify-between">
			<p className="text-muted-foreground text-sm">
				Página {currentPage} de {totalPages}
			</p>
			<div className="flex gap-2">
				<Button
					disabled={currentPage === 1}
					onClick={() => onPageChange(currentPage - 1)}
					size="sm"
					variant="outline"
				>
					Anterior
				</Button>
				<Button
					disabled={currentPage === totalPages}
					onClick={() => onPageChange(currentPage + 1)}
					size="sm"
					variant="outline"
				>
					Siguiente
				</Button>
			</div>
		</div>
	);
}
