/**
 * Glass Supplier Form Hook
 *
 * Manages form state and validation for GlassSupplier entities.
 *
 * Responsibilities:
 * - Form initialization with default values
 * - Form validation with Zod schema
 * - Form reset logic
 *
 * Pattern: Custom Hook - Single Responsibility (Form State Management)
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type UseGlassSupplierFormProps = {
	mode: "create" | "edit";
	open: boolean;
	defaultValues?: FormValues & { id?: string };
};

// Create a schema with all required fields for the form (not API)
const formSchema = z.object({
	code: z.string().optional(),
	contactEmail: z.string().optional(),
	contactPhone: z.string().optional(),
	country: z.string().optional(),
	isActive: z.boolean(),
	name: z.string(),
	notes: z.string().optional(),
	website: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

/**
 * Use Glass Supplier Form Hook
 *
 * Handles form state for creating and editing glass suppliers.
 * Resets form when dialog opens/closes to ensure clean state.
 *
 * @param mode - 'create' or 'edit' mode
 * @param open - Dialog open state (used to reset form)
 * @param defaultValues - Existing supplier data for edit mode
 * @returns form instance from React Hook Form
 */
export function useGlassSupplierForm({
	mode,
	open,
	defaultValues,
}: UseGlassSupplierFormProps) {
	const form = useForm<FormValues>({
		defaultValues: {
			code: "",
			contactEmail: "",
			contactPhone: "",
			country: "",
			isActive: true,
			name: "",
			notes: "",
			website: "",
		},
		resolver: zodResolver(formSchema),
	});

	/**
	 * Reset form when dialog state changes
	 * - Opening with existing data: reset to that data
	 * - Opening in create mode: reset to empty state
	 * - Closing: clear form for next use
	 */
	useEffect(() => {
		if (open && defaultValues) {
			form.reset({
				code: defaultValues.code ?? "",
				contactEmail: defaultValues.contactEmail ?? "",
				contactPhone: defaultValues.contactPhone ?? "",
				country: defaultValues.country ?? "",
				isActive: defaultValues.isActive ?? true,
				name: defaultValues.name ?? "",
				notes: defaultValues.notes ?? "",
				website: defaultValues.website ?? "",
			});
		} else if (open && mode === "create") {
			form.reset({
				code: "",
				contactEmail: "",
				contactPhone: "",
				country: "",
				isActive: true,
				name: "",
				notes: "",
				website: "",
			});
		}
	}, [open, defaultValues, mode, form]);

	return { form };
}
