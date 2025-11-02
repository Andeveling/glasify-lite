"use client";

/**
 * QuoteMainInfoCard Component
 *
 * Main information card displaying quote header with project details,
 * manufacturer, address, contact, validity, and status badges.
 *
 * Atomic Design: Molecule
 * Responsibility: Quote header information display
 * Reusable: Can be used in both public and admin views
 */

import {
	Building2,
	Calendar,
	Clock,
	MapPin,
	Package,
	Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import type { TenantConfigPublic } from "@/providers/tenant-config-provider";
import type { QuoteDetailSchema } from "@/server/api/routers/quote/quote.schemas";
import { QuoteStatusBadge } from "../../_components/quote-status-badge";

type QuoteMainInfoCardProps = {
	/** Quote data to display */
	quote: QuoteDetailSchema;
	/** Tenant configuration for formatting */
	tenantConfig: TenantConfigPublic;
};

export function QuoteMainInfoCard({
	quote,
	tenantConfig,
}: QuoteMainInfoCardProps) {
	const { locale, timezone } = tenantConfig;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1.5">
						<CardTitle className="text-2xl">
							{quote.projectAddress.projectName}
						</CardTitle>
						<CardDescription className="flex items-center gap-1.5 text-sm">
							<Calendar className="h-3.5 w-3.5" />
							Creada el {formatDate(quote.createdAt, locale, timezone)}
						</CardDescription>
					</div>

					<div className="flex gap-2">
						<QuoteStatusBadge
							showIcon={true}
							showTooltip={true}
							size="default"
							status={quote.status}
						/>
						{quote.isExpired && (
							<Badge
								className="border-destructive text-destructive"
								variant="outline"
							>
								Vencida
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<Separator />

			<CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
				{/* Fabricante */}
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
						<Building2 className="h-4 w-4 text-primary" />
					</div>
					<div className="space-y-0.5">
						<p className="font-medium text-muted-foreground text-xs">
							Fabricante
						</p>
						<p className="font-semibold leading-tight">
							{quote.manufacturerName}
						</p>
					</div>
				</div>

				{/* Dirección del proyecto */}
				<div className="flex items-start gap-3 sm:col-span-2">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
						<MapPin className="h-4 w-4 text-primary" />
					</div>
					<div className="space-y-0.5">
						<p className="font-medium text-muted-foreground text-xs">
							Dirección del proyecto
						</p>
						<p className="font-semibold leading-tight">
							{quote.projectAddress.projectStreet}
						</p>
						<p className="text-muted-foreground text-sm">
							{quote.projectAddress.projectCity},{" "}
							{quote.projectAddress.projectState}
							{quote.projectAddress.projectPostalCode
								? ` ${quote.projectAddress.projectPostalCode}`
								: ""}
						</p>
					</div>
				</div>

				{/* Contacto (si existe) */}
				{quote.contactPhone && (
					<div className="flex items-start gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/30">
							<Phone className="h-4 w-4 text-accent-foreground" />
						</div>
						<div className="space-y-0.5">
							<p className="font-medium text-muted-foreground text-xs">
								Teléfono de contacto
							</p>
							<p className="font-semibold leading-tight">
								{quote.contactPhone}
							</p>
						</div>
					</div>
				)}

				{/* Validez */}
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
						<Clock className="h-4 w-4 text-secondary-foreground" />
					</div>
					<div className="space-y-0.5">
						<p className="font-medium text-muted-foreground text-xs">
							Válida hasta
						</p>
						<p className="font-semibold leading-tight">
							{quote.validUntil
								? formatDate(quote.validUntil, locale, timezone)
								: "Sin límite"}
						</p>
					</div>
				</div>

				{/* Total de unidades */}
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-1/20">
						<Package className="h-4 w-4 text-chart-1" />
					</div>
					<div className="space-y-0.5">
						<p className="font-medium text-muted-foreground text-xs">
							Total de unidades
						</p>
						<p className="font-semibold leading-tight">{quote.totalUnits}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
