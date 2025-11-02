/**
 * Quote Expiration Badge Component (US2 - T017)
 *
 * Displays warning badge if quote has expired
 * Only renders if validUntil exists and is in the past
 *
 * Features:
 * - Computed isExpired logic
 * - Spanish label "Expirada"
 * - Warning variant (destructive)
 */

"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type QuoteExpirationBadgeProps = {
	validUntil: Date | null;
};

export function QuoteExpirationBadge({
	validUntil,
}: QuoteExpirationBadgeProps) {
	if (!validUntil) {
		return null;
	}

	const isExpired = validUntil < new Date();
	if (!isExpired) {
		return null;
	}

	return (
		<Badge variant="destructive">
			<AlertTriangle className="mr-1 size-3" />
			Expirada
		</Badge>
	);
}
