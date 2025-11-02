"use client";

import { Info } from "lucide-react";
import { Fragment } from "react";
import { useTenantConfig } from "@/app/_hooks/use-tenant-config";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type PriceBreakdownCategory = "model" | "glass" | "service" | "adjustment";

type PriceBreakdownItem = {
	amount: number;
	category: PriceBreakdownCategory;
	label: string;
};

type PriceBreakdownPopoverProps = {
	breakdown: PriceBreakdownItem[];
	className?: string;
	currency?: string;
	totalAmount: number;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Price Breakdown Popover Component (Atom)
 *
 * Displays itemized price details in a popover triggered by an info icon.
 * Groups items by category (model, glass, services, adjustments) for clarity.
 *
 * ## Features
 * - **Categorized breakdown**: Groups items by type with visual separators
 * - **Shadcn Popover**: Uses Radix UI popover for accessible overlay
 * - **Table Layout**: Itemized breakdown with labels and amounts
 * - **Total Row**: Bold total amount with separator
 * - **Responsive**: Adapts content width to available space
 * - **Accessibility**: Keyboard navigation, ARIA labels
 *
 * ## Category Indicators
 * - **Producto**: Base model price and dimensions
 * - **Vidrio**: Glass type pricing
 * - **Servicios**: Additional services (installation, sealing, etc.)
 * - **Ajustes**: Discounts/surcharges
 *
 * ## Usage
 * ```tsx
 * <PriceBreakdownPopover
 *   totalAmount={1444983}
 *   currency="$"
 *   breakdown={[
 *     { label: 'Base del modelo', amount: 650000, category: 'model' },
 *     { label: 'Vidrio Laminado 10mm (5+5)', amount: 120000, category: 'glass' },
 *     { label: 'Servicio de corte', amount: 25000, category: 'service' },
 *     { label: 'Descuento especial', amount: -50000, category: 'adjustment' }
 *   ]}
 * />
 * ```
 *
 * @example
 * // In sticky price header
 * <div className="flex items-center gap-2">
 *   <span className="text-3xl font-bold">${totalPrice.toLocaleString()}</span>
 *   <PriceBreakdownPopover breakdown={breakdown} totalAmount={totalPrice} />
 * </div>
 */
export function PriceBreakdownPopover({
	breakdown,
	className,
	totalAmount,
}: PriceBreakdownPopoverProps) {
	const { formatContext } = useTenantConfig();

	// Group items by category
	const groupedItems = breakdown.reduce(
		(acc, item) => {
			if (!acc[item.category]) {
				acc[item.category] = [];
			}
			acc[item.category].push(item);
			return acc;
		},
		{} as Record<PriceBreakdownCategory, PriceBreakdownItem[]>,
	);

	// Category labels in Spanish
	const categoryLabels: Record<PriceBreakdownCategory, string> = {
		adjustment: "Ajustes",
		glass: "Vidrio",
		model: "Producto",
		service: "Servicios",
	};

	// Category order for display
	const categoryOrder: PriceBreakdownCategory[] = [
		"model",
		"glass",
		"service",
		"adjustment",
	];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					aria-label="Ver desglose de precio"
					className={cn("h-8 w-8 p-0", className)}
					size="icon"
					type="button"
					variant="ghost"
				>
					<Info className="h-4 w-4 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="min-w-96">
				<div className="space-y-4">
					<h3 className="font-semibold text-sm">Desglose del precio</h3>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[60%]">Concepto</TableHead>
								<TableHead className="text-right">Monto</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categoryOrder.map((category) => {
								const items = groupedItems[category];
								if (!items || items.length === 0) {
									return null;
								}

								const categoryTotal = items.reduce(
									(sum, item) => sum + item.amount,
									0,
								);

								return (
									<Fragment key={category}>
										{/* Category header */}
										<TableRow className="bg-muted/50">
											<TableCell
												className="font-semibold text-muted-foreground text-xs uppercase"
												colSpan={2}
											>
												{categoryLabels[category]}
											</TableCell>
										</TableRow>
										{/* Category items */}
										{items.map((item, index) => (
											<TableRow key={`${category}-${index}`}>
												<TableCell className="pl-6 text-sm">
													{item.label}
												</TableCell>
												<TableCell
													className={cn(
														"text-right text-sm",
														item.amount < 0 &&
															"text-green-600 dark:text-green-400",
													)}
												>
													{formatCurrency(item.amount, {
														context: formatContext,
													})}
												</TableCell>
											</TableRow>
										))}
										{/* Category subtotal (if multiple items) */}
										{items.length > 1 && (
											<TableRow className="border-b">
												<TableCell className="pl-6 text-muted-foreground text-xs">
													Subtotal {categoryLabels[category].toLowerCase()}
												</TableCell>
												<TableCell className="text-right font-medium text-muted-foreground text-xs">
													{formatCurrency(categoryTotal, {
														context: formatContext,
													})}
												</TableCell>
											</TableRow>
										)}
									</Fragment>
								);
							})}
							{/* Total row */}
							<TableRow className="border-t-2">
								<TableCell className="font-bold">Total</TableCell>
								<TableCell className="text-right font-bold">
									{formatCurrency(totalAmount, { context: formatContext })}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</PopoverContent>
		</Popover>
	);
}
