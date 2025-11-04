"use client";

/**
 * Cart Item Edit Modal
 *
 * Enhanced modal with DimensionField and Combobox components for improved UX.
 *
 * Features:
 * - DimensionField for width/height (reused from catalog)
 * - Combobox for glass type selection with search
 * - Price indicator with currency formatting
 * - Loading states and error handling
 * - Accessibility improvements
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { DimensionField } from "@/app/(public)/catalog/[modelId]/_components/form/dimension-field";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
	MAX_DIMENSION,
	MIN_DIMENSION,
	UI_TEXT,
} from "../_constants/cart-item.constants";
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
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: CartItemWithRelations;
}

/**
 * Cart item edit modal component
 *
 * Enhanced version with DimensionField and Combobox for consistency with catalog UX
 */
export function CartItemEditModal({
	open,
	onOpenChange,
	item,
}: CartItemEditModalProps) {
	const { updateItem } = useCartItemMutations();
	const firstInputRef = useRef<HTMLInputElement>(null);
	const [openGlassCombobox, setOpenGlassCombobox] = useState(false);

	// Local state for dimension sliders
	const [localWidth, setLocalWidth] = useState(item.widthMm);
	const [localHeight, setLocalHeight] = useState(item.heightMm);

	// Get current price
	const displayPrice =
		typeof item.subtotal === "number"
			? item.subtotal
			: (item.subtotal as { toNumber(): number }).toNumber();

	// Fetch available glass types
	const { data: availableGlassTypes, isLoading: isLoadingGlassTypes } =
		api.catalog["get-available-glass-types"].useQuery(
			{ modelId: item.model.id },
			{ enabled: open, staleTime: 5 * 60 * 1000 },
		);

	// Initialize form
	const form = useForm<CartItemEditFormData>({
		resolver: zodResolver(cartItemEditSchema.omit({ itemId: true })) as never,
		defaultValues: getDefaultCartItemValues(item),
	});

	// Reset form when modal opens
	useEffect(() => {
		if (open) {
			const defaults = getDefaultCartItemValues(item);
			form.reset(defaults);
			setLocalWidth(item.widthMm);
			setLocalHeight(item.heightMm);

			setTimeout(() => {
				firstInputRef.current?.focus();
			}, 100);
		}
	}, [open, item, form]);

	// Sync local dimension state with form
	useEffect(() => {
		const subscription = form.watch((value) => {
			if (value.widthMm) setLocalWidth(value.widthMm);
			if (value.heightMm) setLocalHeight(value.heightMm);
		});
		return () => subscription.unsubscribe();
	}, [form]);

	// Form submission
	const onSubmit = (data: CartItemEditFormData) => {
		const input = transformEditData(item.id, data);

		// Get the new glass type name if glass type changed
		const newGlassTypeName =
			data.glassTypeId !== item.glassTypeId
				? availableGlassTypes?.find((gt) => gt.id === data.glassTypeId)?.name
				: undefined;

		updateItem.mutate(
			{ data: input, newGlassTypeName },
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	};

	const isPending = updateItem.isPending;

	// Dimension validation
	const isValidDimension = (value: number) =>
		value >= MIN_DIMENSION && value <= MAX_DIMENSION;

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
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
						{/* Width dimension field */}
						<DimensionField
							control={form.control}
							name="widthMm"
							label={UI_TEXT.WIDTH_LABEL}
							min={MIN_DIMENSION}
							max={MAX_DIMENSION}
							localValue={localWidth}
							onSliderChange={(values) => {
								setLocalWidth(values[0] ?? MIN_DIMENSION);
								form.setValue("widthMm", values[0] ?? MIN_DIMENSION);
							}}
							isValid={isValidDimension}
							suggestedValues={[]} // No suggested values in edit mode
							variant="compact" // Use compact variant for modal
						/>

						{/* Height dimension field */}
						<DimensionField
							control={form.control}
							name="heightMm"
							label={UI_TEXT.HEIGHT_LABEL}
							min={MIN_DIMENSION}
							max={MAX_DIMENSION}
							localValue={localHeight}
							onSliderChange={(values) => {
								setLocalHeight(values[0] ?? MIN_DIMENSION);
								form.setValue("heightMm", values[0] ?? MIN_DIMENSION);
							}}
							isValid={isValidDimension}
							suggestedValues={[]} // No suggested values in edit mode
							variant="compact" // Use compact variant for modal
						/>

						{/* Glass type combobox */}
						<FormField
							control={form.control}
							name="glassTypeId"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>{UI_TEXT.GLASS_TYPE_LABEL}</FormLabel>
									<Popover
										open={openGlassCombobox}
										onOpenChange={setOpenGlassCombobox}
									>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={openGlassCombobox}
													className={cn(
														"w-full justify-between",
														!field.value && "text-muted-foreground",
													)}
													disabled={isPending || isLoadingGlassTypes}
												>
													{field.value
														? availableGlassTypes?.find(
																(type) => type.id === field.value,
															)?.name
														: "Selecciona un tipo de vidrio"}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start">
											<Command>
												<CommandInput placeholder="Buscar vidrio..." />
												<CommandList>
													<CommandEmpty>
														{isLoadingGlassTypes
															? "Cargando..."
															: "No se encontró vidrio."}
													</CommandEmpty>
													<CommandGroup>
														{availableGlassTypes?.map((glassType) => (
															<CommandItem
																key={glassType.id}
																value={glassType.name}
																onSelect={() => {
																	form.setValue("glassTypeId", glassType.id);
																	setOpenGlassCombobox(false);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		glassType.id === field.value
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																<div className="flex flex-col">
																	<span className="font-medium">
																		{glassType.name}
																	</span>
																	<span className="text-muted-foreground text-xs">
																		${glassType.pricePerSqm.toFixed(2)}/m²
																	</span>
																</div>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormMessage />
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
