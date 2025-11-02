/**
 * Glass Supplier Dialog Component
 *
 * Modal dialog for creating and editing GlassSupplier entities.
 * Wraps form in a Dialog component with 3 sections: Basic Info, Contact Info, Additional.
 *
 * Pattern: Dialog-based CRUD (no separate pages)
 * Reason: 8-field form fits well in a modal with vertical scroll
 *
 * Architecture (SOLID):
 * - This component focuses on UI composition and user interaction
 * - Form state management delegated to useGlassSupplierForm hook
 * - Mutation logic delegated to useGlassSupplierMutations hook
 * - Follows Single Responsibility Principle
 *
 * Features:
 * - Optimistic updates with loading states
 * - Toast notifications (Spanish)
 * - Cache invalidation after mutations (SSR pattern)
 * - 8-field form with 3 grouped sections
 * - Scrollable content (max-h-[70vh])
 */

"use client";

import { Loader2 } from "lucide-react";
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FormValues } from "../_hooks/use-glass-supplier-form";
import { useGlassSupplierForm } from "../_hooks/use-glass-supplier-form";
import { useGlassSupplierMutations } from "../_hooks/use-glass-supplier-mutations";

type GlassSupplierDialogProps = {
	mode: "create" | "edit";
	open: boolean;
	onOpenChangeAction: (open: boolean) => void;
	defaultValues?: FormValues & { id?: string };
};

export function GlassSupplierDialog({
	mode,
	open,
	onOpenChangeAction,
	defaultValues,
}: GlassSupplierDialogProps) {
	// Custom hooks for separation of concerns
	const { form } = useGlassSupplierForm({ defaultValues, mode, open });

	const { handleCreate, handleUpdate, isPending } = useGlassSupplierMutations({
		onSuccess: () => {
			onOpenChangeAction(false);
			form.reset();
		},
	});

	// Handle form submission - routes to create or update
	const handleSubmit = (formData: FormValues) => {
		if (mode === "create") {
			handleCreate(formData);
		} else if (defaultValues?.id) {
			handleUpdate(defaultValues.id, formData);
		}
	};

	return (
		<Dialog onOpenChange={onOpenChangeAction} open={open}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{mode === "create"
							? "Crear Proveedor de Vidrio"
							: "Editar Proveedor de Vidrio"}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Complete los detalles para crear un nuevo proveedor."
							: "Actualice los detalles del proveedor."}
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[70vh] overflow-y-auto">
					<Form {...form}>
						<form
							className="space-y-6 p-4"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							{/* Section 1: Basic Information */}
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Información Básica</h3>
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nombre del Proveedor *</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isPending}
														placeholder="Ej: Guardian, Saint-Gobain"
														value={field.value ?? ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="code"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Código</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isPending}
														placeholder="Ej: GRD, SGB"
														value={field.value ?? ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>País</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={isPending}
													placeholder="Ej: México, Estados Unidos"
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Section 2: Contact Information */}
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Información de Contacto</h3>
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="website"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Sitio Web</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isPending}
														placeholder="https://www.ejemplo.com"
														type="url"
														value={field.value ?? ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="contactEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email de Contacto</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled={isPending}
														placeholder="ventas@ejemplo.com"
														type="email"
														value={field.value ?? ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="contactPhone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Teléfono de Contacto</FormLabel>
											<FormControl>
												<PhoneInput
													{...field}
													defaultCountry="MX"
													disabled={isPending}
													placeholder="Ingresa el número telefónico"
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Section 3: Additional */}
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Información Adicional</h3>
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notas</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													className="resize-none"
													disabled={isPending}
													placeholder="Notas adicionales sobre el proveedor"
													rows={3}
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="isActive"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Activo</FormLabel>
												<FormDescription>
													Indica si el proveedor está disponible para
													seleccionar
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													disabled={isPending}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter>
								<Button
									disabled={isPending}
									onClick={() => onOpenChangeAction(false)}
									type="button"
									variant="outline"
								>
									Cancelar
								</Button>
								<Button disabled={isPending} type="submit">
									{isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{mode === "create" ? "Crear Proveedor" : "Guardar Cambios"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
