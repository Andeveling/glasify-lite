"use client";

/**
 * Cart Item Edit Modal
 *
 * Modal dialog for editing cart item dimensions and glass type.
 * Uses React Hook Form with Zod validation.
 *
 * Features:
 * - Inline validation with Spanish error messages
 * - Loading states during submission
 * - Auto-close on success
 * - Price recalculation note (no live preview)
 * - Accessibility: focus management, keyboard navigation, ARIA labels
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";
import { api } from "@/trpc/react";
import { UI_TEXT } from "../_constants/cart-item.constants";
import { useCartItemMutations } from "../_hooks/use-cart-item-mutations";
import { cartItemEditSchema } from "../_schemas/cart-item-edit.schema";
import {
	type CartItemWithRelations,
	getDefaultCartItemValues,
	transformEditData,
} from "../_utils/cart-item-edit.utils";

/**
 * Form data type (itemId excluded, will be added before submission)
 */
type CartItemEditFormData = {
	widthMm: number;
	heightMm: number;
	glassTypeId: string;
	name?: string;
	roomLocation?: string;
	quantity: number;
};

interface CartItemEditModalProps {
	/**
	 * Modal open state
	 */
	open: boolean;
	/**
	 * Callback when modal open state changes
	 */
	onOpenChange: (open: boolean) => void;
	/**
	 * Cart item to edit
	 */
	item: CartItemWithRelations;
}

/**
 * Cart item edit modal component
 *
 * Orchestrates edit form with validation and submission.
 * Keeps UI logic under 100 lines (form orchestration only).
 */
export function CartItemEditModal({
	open,
	onOpenChange,
	item,
}: CartItemEditModalProps) {
	const { updateItem } = useCartItemMutations();

	// Ref for first input (focus management)
	const firstInputRef = useRef<HTMLInputElement>(null);

	// Get current price from item
	// Note: item.subtotal is always a number in client-side cart (sessionStorage)
	// For server-side cart (Quote), it would be a Prisma Decimal with .toNumber()
	const displayPrice =
		typeof item.subtotal === "number"
			? item.subtotal
			: (item.subtotal as { toNumber(): number }).toNumber();

	// Fetch available glass types for this model
	const { data: availableGlassTypes, isLoading: isLoadingGlassTypes } =
		api.catalog["get-available-glass-types"].useQuery(
			{
				modelId: item.model.id,
			},
			{
				enabled: open, // Only fetch when modal is open
				staleTime: 5 * 60 * 1000, // 5 minutes
			},
		);

	// Initialize form with React Hook Form + Zod validation
	const form = useForm<CartItemEditFormData>({
		resolver: zodResolver(cartItemEditSchema.omit({ itemId: true })) as never,
		defaultValues: getDefaultCartItemValues(item),
	});

	// Reset form when item changes or modal opens
	useEffect(() => {
		if (open) {
			form.reset(getDefaultCartItemValues(item));

			// Set focus to first input after modal opens
			setTimeout(() => {
				firstInputRef.current?.focus();
			}, 100); // Small delay to ensure modal is fully rendered
		}
	}, [open, item, form]);

	/**
	 * Handle form submission
	 */
	const onSubmit = (data: CartItemEditFormData) => {
		const input = transformEditData(item.id, data);

		updateItem.mutate(input, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	};

	const isPending = updateItem.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				// Prevent closing while saving
				if (isPending && !newOpen) return;
				onOpenChange(newOpen);
			}}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{UI_TEXT.MODAL_TITLE}</DialogTitle>
					<DialogDescription>
						{item.model.name} - {item.glassType.name}
					</DialogDescription>
				</DialogHeader>

				{/* Current price indicator */}
				<div className="rounded-md border border-muted bg-muted/20 p-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-foreground">
							{UI_TEXT.CURRENT_PRICE_LABEL}:
						</span>
						<span className="text-lg font-semibold text-foreground">
							{formatCurrency(displayPrice)}
						</span>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">
						{UI_TEXT.PRICE_RECALC_NOTE}
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Width input */}
						<FormField
							control={form.control}
							name="widthMm"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{UI_TEXT.WIDTH_LABEL}</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											ref={(e) => {
												field.ref(e);
												firstInputRef.current = e;
											}}
											onChange={(e) =>
												field.onChange(Number.parseInt(e.target.value, 10))
											}
											disabled={isPending}
											aria-describedby="width-error"
										/>
									</FormControl>
									<FormMessage id="width-error" />
								</FormItem>
							)}
						/>

						{/* Height input */}
						<FormField
							control={form.control}
							name="heightMm"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{UI_TEXT.HEIGHT_LABEL}</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) =>
												field.onChange(Number.parseInt(e.target.value, 10))
											}
											disabled={isPending}
											aria-describedby="height-error"
										/>
									</FormControl>
									<FormMessage id="height-error" />
								</FormItem>
							)}
						/>

						{/* Glass type selector */}
						<FormField
							control={form.control}
							name="glassTypeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{UI_TEXT.GLASS_TYPE_LABEL}</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={isPending || isLoadingGlassTypes}
									>
										<FormControl>
											<SelectTrigger aria-describedby="glass-type-error">
												<SelectValue placeholder="Selecciona un tipo de vidrio" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{isLoadingGlassTypes ? (
												<SelectItem value="loading" disabled>
													Cargando...
												</SelectItem>
											) : (
												availableGlassTypes?.map((glassType) => (
													<SelectItem key={glassType.id} value={glassType.id}>
														{glassType.name} - $
														{glassType.pricePerSqm.toFixed(2)}
														/m²
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage id="glass-type-error" />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								{UI_TEXT.CANCEL_BUTTON}
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <Spinner className="mr-2 h-4 w-4" />}
								{isPending ? UI_TEXT.SAVING_BUTTON : UI_TEXT.SAVE_BUTTON}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
