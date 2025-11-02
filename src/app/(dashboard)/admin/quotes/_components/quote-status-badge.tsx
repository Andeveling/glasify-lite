/**
 * Quote Status Badge Component (US2 - T016)
 *
 * Displays color-coded badge for quote status
 * Uses QUOTE_STATUS_CONFIG for consistent styling
 *
 * Features:
 * - Spanish labels (Borrador, Enviada, Cancelada)
 * - Icon from lucide-react
 * - Shadcn Badge with variant
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { QUOTE_STATUS_CONFIG } from "../_constants/quote-status.constants";

type QuoteStatusBadgeProps = {
	status: "draft" | "sent" | "canceled";
};

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
	const config = QUOTE_STATUS_CONFIG[status];
	const Icon = config.icon;

	return (
		<Badge variant={config.variant}>
			<Icon className="mr-1 size-3" />
			{config.label}
		</Badge>
	);
}
