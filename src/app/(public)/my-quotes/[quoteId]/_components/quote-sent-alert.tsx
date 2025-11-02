"use client";

/**
 * QuoteSentAlert Component
 *
 * Alert message displayed when a quote has been sent to manufacturer.
 * Shows confirmation details, response time, and vendor contact.
 *
 * Atomic Design: Molecule
 * Responsibility: Quote sent confirmation display (US3)
 */

import { Clock, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";
import type { TenantConfigPublic } from "@/providers/tenant-config-provider";
import type { QuoteDetailSchema } from "@/server/api/routers/quote/quote.schemas";

type QuoteSentAlertProps = {
	/** Quote data with sent status */
	quote: QuoteDetailSchema;
	/** Tenant configuration for formatting */
	tenantConfig: TenantConfigPublic;
};

export function QuoteSentAlert({ quote, tenantConfig }: QuoteSentAlertProps) {
	// Only render if quote is sent
	if (quote.status !== "sent" || !quote.sentAt) {
		return null;
	}

	const { locale, timezone } = tenantConfig;

	return (
		<Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
			<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
			<AlertTitle className="text-blue-900 dark:text-blue-100">
				Cotización enviada el {formatDate(quote.sentAt, locale, timezone)}
			</AlertTitle>
			<AlertDescription className="space-y-2 text-blue-700 dark:text-blue-300">
				<p>
					El fabricante ha recibido tu solicitud y se pondrá en contacto contigo
					pronto.
				</p>

				<div className="flex items-start gap-2 text-sm">
					<Clock className="mt-0.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
					<p>
						<span className="font-medium">Tiempo de respuesta:</span> Recibirás
						una respuesta en 24-48 horas hábiles
					</p>
				</div>

				{quote.vendorContactPhone && (
					<div className="flex items-start gap-2 text-sm">
						<Phone className="mt-0.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
						<p>
							<span className="font-medium">Contacto del fabricante:</span>{" "}
							{quote.vendorContactPhone}
						</p>
					</div>
				)}

				<p className="text-blue-600 text-xs dark:text-blue-400">
					Mientras tanto, puedes revisar otras cotizaciones o crear una nueva.
				</p>
			</AlertDescription>
		</Alert>
	);
}
