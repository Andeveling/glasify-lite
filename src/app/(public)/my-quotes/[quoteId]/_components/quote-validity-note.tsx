"use client";

/**
 * QuoteValidityNote Component
 *
 * Informational card displaying quote validity period and price lock notice.
 * Only displayed in public user view.
 *
 * Atomic Design: Molecule
 * Responsibility: Quote validity information display
 */

import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { TenantConfigPublic } from "@/providers/tenant-config-provider";

type QuoteValidityNoteProps = {
	/** Quote validity date (null for no limit) */
	validUntil: Date | null;
	/** Tenant configuration for formatting */
	tenantConfig: TenantConfigPublic;
};

export function QuoteValidityNote({
	tenantConfig,
	validUntil,
}: QuoteValidityNoteProps) {
	const { locale, timezone } = tenantConfig;

	return (
		<Card className="border-muted bg-muted/50">
			<CardContent className="pt-6">
				<p className="text-muted-foreground text-sm">
					<strong>Nota:</strong> Esta cotización tiene una validez de{" "}
					{validUntil
						? `hasta el ${formatDate(validUntil, locale, timezone)}`
						: "sin límite"}
					. Los precios están bloqueados al momento de la generación de la
					cotización.
				</p>
			</CardContent>
		</Card>
	);
}
