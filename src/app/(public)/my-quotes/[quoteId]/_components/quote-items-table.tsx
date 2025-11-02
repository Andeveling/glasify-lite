"use client";

/**
 * QuoteItemsTable Component
 *
 * Table displaying quote items with details (model, glass type, dimensions, prices).
 * Includes total amount calculation at the bottom.
 *
 * Atomic Design: Molecule
 * Responsibility: Quote items tabular display with totals
 */

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { TenantConfigPublic } from "@/providers/tenant-config-provider";
import type { QuoteDetailSchema } from "@/server/api/routers/quote/quote.schemas";

type QuoteItemsTableProps = {
	/** Quote items to display */
	items: QuoteDetailSchema["items"];
	/** Total amount */
	total: number;
	/** Number of items for header description */
	itemCount: number;
	/** Tenant configuration for formatting */
	tenantConfig: TenantConfigPublic;
};

export function QuoteItemsTable({
	itemCount,
	items,
	tenantConfig,
	total,
}: QuoteItemsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Items de la cotización</CardTitle>
				<CardDescription>
					{itemCount} {itemCount === 1 ? "item" : "items"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Modelo</TableHead>
							<TableHead>Tipo de vidrio</TableHead>
							<TableHead>Solución</TableHead>
							<TableHead>Dimensiones (mm)</TableHead>
							<TableHead className="text-right">Cantidad</TableHead>
							<TableHead className="text-right">Precio unitario</TableHead>
							<TableHead className="text-right">Subtotal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item) => (
							<TableRow key={item.id}>
								<TableCell className="font-medium">{item.name}</TableCell>
								<TableCell>{item.modelName}</TableCell>
								<TableCell>{item.glassTypeName}</TableCell>
								<TableCell>{item.solutionName ?? "—"}</TableCell>
								<TableCell>
									{item.widthMm} × {item.heightMm}
								</TableCell>
								<TableCell className="text-right">{item.quantity}</TableCell>
								<TableCell className="text-right">
									{formatCurrency(item.unitPrice, { context: tenantConfig })}
								</TableCell>
								<TableCell className="text-right">
									{formatCurrency(item.subtotal, { context: tenantConfig })}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{/* Total */}
				<div className="mt-4 flex justify-end">
					<div className="text-right">
						<p className="text-muted-foreground text-sm">Total</p>
						<p className="font-bold text-2xl">
							{formatCurrency(total, { context: tenantConfig })}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
