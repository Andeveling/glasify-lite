"use client";

/**
 * QuoteDetailHeader Component
 *
 * Header section with navigation and action buttons.
 * Displays back link and export/send buttons based on view context.
 *
 * Atomic Design: Molecule
 * Responsibility: Header navigation and actions only
 */

import { BackLink } from "@/components/ui/back-link";
import type { QuoteDetailSchema } from "@/server/api/routers/quote/quote.schemas";
import { QuoteExportButtons } from "./quote-export-buttons";
import { SendQuoteButton } from "./send-quote-button";

type QuoteDetailHeaderProps = {
	/** Navigation link for back button */
	backLink: string;
	/** Label text for back button */
	backLabel: string;
	/** Quote data for send button */
	quote: QuoteDetailSchema;
	/** Whether this is the public user view */
	isPublicView: boolean;
};

export function QuoteDetailHeader({
	backLabel,
	backLink,
	isPublicView,
	quote,
}: QuoteDetailHeaderProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<BackLink href={backLink} icon="chevron" variant="link">
				{backLabel}
			</BackLink>

			<div className="flex items-center gap-2">
				{/* Send quote button - only for draft quotes in public view */}
				{isPublicView && <SendQuoteButton quote={quote} />}

				{/* Export buttons - Always show for both public and admin views */}
				<QuoteExportButtons quoteId={quote.id} size="sm" variant="full" />
			</div>
		</div>
	);
}
