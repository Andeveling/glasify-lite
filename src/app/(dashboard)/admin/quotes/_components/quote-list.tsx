/**
 * Quote List Container (US1 - T012)
 *
 * Client Component that renders the list of quotes
 * Delegates individual quote rendering to QuoteListItem
 *
 * Features:
 * - Maps over quotes array
 * - Handles empty state
 * - Responsive grid layout
 */

"use client";

import type { QuoteListItem as QuoteItem } from "../_types/quote-list.types";
import { QuoteListItem } from "./quote-list-item";
import { QuotesEmptyState } from "./quotes-empty-state";

type QuoteListProps = {
	initialData: {
		quotes: QuoteItem[];
		total: number;
		totalPages: number;
		page: number;
		limit: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	searchParams: {
		status?: string;
		search?: string;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
		page?: number;
	};
};

export function QuoteList({ initialData }: QuoteListProps) {
	const { quotes } = initialData;

	// Empty state
	if (quotes.length === 0) {
		return <QuotesEmptyState />;
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{quotes.map((quote) => (
				<QuoteListItem key={quote.id} quote={quote} />
			))}
		</div>
	);
}
