/**
 * TableHeader Component
 *
 * Sortable table header molecule for server-optimized tables.
 * Manages sort state via URL parameters for deep linking support.
 *
 * Features:
 * - Sortable columns with visual indicators (↑↓)
 * - URL-based sort state (sortBy, sortOrder params)
 * - Type-safe column definitions
 * - Accessible (ARIA labels, keyboard navigation)
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <TableHeader
 *   columns={[
 *     { id: 'name', header: 'Nombre', sortable: true },
 *     { id: 'status', header: 'Estado', sortable: true },
 *     { id: 'actions', header: 'Acciones', sortable: false },
 *   ]}
 * />
 * ```
 *
 * @see REQ-001: Server-side sorting via URL params
 */

"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	TableHead,
	TableRow,
	TableHeader as UITableHeader,
} from "@/components/ui/table";
import { useServerParams } from "@/hooks/use-server-params";
import type { ServerTableColumn } from "./index";

export type TableHeaderProps<T extends Record<string, unknown>> = {
	/** Column definitions */
	columns: ServerTableColumn<T>[];
};

/**
 * Get sort icon based on current state
 */
function getSortIcon(
	columnId: string,
	currentSortBy?: string | null,
	currentSortOrder?: string | null,
) {
	if (currentSortBy !== columnId) {
		return <ArrowUpDown className="ml-2 size-4" />;
	}

	return currentSortOrder === "asc" ? (
		<ArrowUp className="ml-2 size-4" />
	) : (
		<ArrowDown className="ml-2 size-4" />
	);
}

/**
 * Get next sort order
 */
function getNextSortOrder(
	columnId: string,
	currentSortBy?: string | null,
	currentSortOrder?: string | null,
): "asc" | "desc" {
	// If clicking on a different column, default to 'desc'
	if (currentSortBy !== columnId) {
		return "desc";
	}

	// Toggle between asc and desc
	return currentSortOrder === "asc" ? "desc" : "asc";
}

export function TableHeader<T extends Record<string, unknown>>({
	columns,
}: TableHeaderProps<T>) {
	const { getParam, updateParams } = useServerParams();

	const currentSortBy = getParam("sortBy");
	const currentSortOrder = getParam("sortOrder");

	/**
	 * Handle column header click for sorting
	 */
	const handleSort = (columnId: string) => {
		const nextOrder = getNextSortOrder(
			columnId,
			currentSortBy,
			currentSortOrder,
		);

		updateParams({
			page: "1", // Reset to first page on sort change
			sortBy: columnId,
			sortOrder: nextOrder,
		});
	};

	return (
		<UITableHeader>
			<TableRow>
				{columns.map((column) => (
					<TableHead
						className={column.align ? `text-${column.align}` : undefined}
						key={column.id}
						style={{ width: column.width }}
					>
						{column.sortable ? (
							<Button
								aria-label={`Ordenar por ${column.header}`}
								className="-ml-3 h-auto font-medium hover:bg-transparent"
								onClick={() => handleSort(column.id)}
								variant="ghost"
							>
								{column.header}
								{getSortIcon(column.id, currentSortBy, currentSortOrder)}
							</Button>
						) : (
							<span className="font-medium">{column.header}</span>
						)}
					</TableHead>
				))}
			</TableRow>
		</UITableHeader>
	);
}
