/**
 * Profile Supplier Form Hook
 *
 * Manages form state and validation for ProfileSupplier entities.
 *
 * Responsibilities:
 * - Form initialization with default values
 * - Form validation with Zod schema
 * - Form reset logic
 *
 * Pattern: Custom Hook - Single Responsibility (Form State Management)
 */

import { zodResolver } from "@hookform/resolvers/zod";
import type { MaterialType, ProfileSupplier } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createProfileSupplierSchema } from "@/lib/validations/admin/profile-supplier.schema";

export type FormValues = {
	name: string;
	materialType: MaterialType;
	notes?: string;
	isActive?: boolean;
};

type UseProfileSupplierFormProps = {
	mode: "create" | "edit";
	open: boolean;
	defaultValues?: ProfileSupplier;
};

export function useProfileSupplierForm({
	mode,
	open,
	defaultValues,
}: UseProfileSupplierFormProps) {
	const form = useForm<FormValues>({
		defaultValues: {
			isActive: defaultValues?.isActive ?? true,
			materialType: defaultValues?.materialType ?? "PVC",
			name: defaultValues?.name ?? "",
			notes: defaultValues?.notes ?? "",
		},
		resolver: zodResolver(createProfileSupplierSchema),
	});

	/**
	 * Reset form when dialog state changes
	 * - Opening with existing data: reset to that data
	 * - Opening in create mode: reset to empty state
	 */
	useEffect(() => {
		if (open && defaultValues) {
			form.reset({
				isActive: defaultValues.isActive,
				materialType: defaultValues.materialType,
				name: defaultValues.name,
				notes: defaultValues.notes ?? "",
			});
		} else if (open && mode === "create") {
			form.reset({
				isActive: true,
				materialType: "PVC",
				name: "",
				notes: "",
			});
		}
	}, [open, mode, defaultValues, form]);

	return { form };
}
