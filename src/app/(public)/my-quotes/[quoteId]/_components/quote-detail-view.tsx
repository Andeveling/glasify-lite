"use client";

/**
 * QuoteDetailView Component (Refactored)
 *
 * Orchestrates the display of full quote details using atomic molecules.
 * Acts as a template that composes smaller, focused components.
 *
 * Atomic Design: Template
 * Responsibility: Composition and data transformation only
 *
 * Uses centralized formatters from @lib/format with TenantConfig context.
 */

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTenantConfig } from "@/providers/tenant-config-provider";
import type { QuoteDetailSchema } from "@/server/api/routers/quote/quote.schemas";
import { QuoteDetailHeader } from "./quote-detail-header";
import { type QuoteItemData, QuoteItemsGrid } from "./quote-items-grid";
import { QuoteItemsTable } from "./quote-items-table";
import { QuoteMainInfoCard } from "./quote-main-info-card";
import { QuoteSentAlert } from "./quote-sent-alert";
import { QuoteValidityNote } from "./quote-validity-note";

type QuoteDetailViewProps = {
	quote: QuoteDetailSchema;
	/** Whether this is the public user view (vs admin dashboard view) */
	isPublicView?: boolean;
};

export function QuoteDetailView({
	isPublicView = false,
	quote,
}: QuoteDetailViewProps) {
	const tenantConfig = useTenantConfig();

	// Navigation configuration
	const backLink = isPublicView ? "/my-quotes" : "/admin/quotes";
	const backLabel = isPublicView
		? "Volver a mis cotizaciones"
		: "Volver a cotizaciones";

	// Transform quote items for grid display
	const gridItems: QuoteItemData[] = quote.items.map((item) => ({
		glassType: item.glassTypeName,
		height: item.heightMm ? Math.round(item.heightMm / 10) : null,
		id: item.id,
		manufacturer: quote.manufacturerName,
		modelImageUrl: item.modelImageUrl,
		modelName: item.modelName,
		width: item.widthMm ? Math.round(item.widthMm / 10) : null, // Convert mm to cm
	}));

	return (
		<div className="space-y-6">
			{/* Header with navigation and actions */}
			<QuoteDetailHeader
				backLabel={backLabel}
				backLink={backLink}
				isPublicView={isPublicView}
				quote={quote}
			/>

			{/* Enhanced confirmation message for sent quotes (US3) */}
			<QuoteSentAlert quote={quote} tenantConfig={tenantConfig} />

			{/* Main quote information card */}
			<QuoteMainInfoCard quote={quote} tenantConfig={tenantConfig} />

			{/* US2: Visual product grid with thumbnails */}
			{gridItems.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Vista de productos</CardTitle>
						<CardDescription>
							Haga clic en una imagen para ver detalles completos
						</CardDescription>
					</CardHeader>
					<CardContent>
						<QuoteItemsGrid eager items={gridItems} />
					</CardContent>
				</Card>
			)}

			{/* Items table with totals */}
			<QuoteItemsTable
				itemCount={quote.itemCount}
				items={quote.items}
				tenantConfig={tenantConfig}
				total={quote.total}
			/>

			{/* Validity note - only for public view */}
			{isPublicView && (
				<QuoteValidityNote
					tenantConfig={tenantConfig}
					validUntil={quote.validUntil}
				/>
			)}
		</div>
	);
}
