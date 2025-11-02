/**
 * Zod Validation Schemas for ProfileSupplier
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { MaterialType } from "@prisma/client";
import { z } from "zod";

// Validation constants
const MAX_SUPPLIER_NAME_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;

/**
 * Material Type Schema
 */
export const materialTypeSchema = z.nativeEnum(MaterialType, {
	message: "Material type must be one of: PVC, ALUMINUM, WOOD, MIXED",
});

/**
 * Create ProfileSupplier Schema
 */
export const createProfileSupplierSchema = z.object({
	isActive: z.boolean().default(true),
	materialType: materialTypeSchema,
	name: z
		.string()
		.min(1, "Supplier name is required")
		.max(
			MAX_SUPPLIER_NAME_LENGTH,
			"Supplier name cannot exceed 100 characters",
		),
	notes: z
		.string()
		.max(MAX_NOTES_LENGTH, "Notes cannot exceed 500 characters")
		.optional()
		.nullable(),
});

/**
 * Update ProfileSupplier Schema
 * All fields are optional for updates
 */
export const updateProfileSupplierSchema =
	createProfileSupplierSchema.partial();

/**
 * ProfileSupplier Response Schema
 */
export const profileSupplierResponseSchema = createProfileSupplierSchema.extend(
	{
		createdAt: z.date(),
		id: z.string().cuid(),
		updatedAt: z.date(),
	},
);

/**
 * List ProfileSuppliers Query Schema
 */
export const listProfileSuppliersSchema = z.object({
	isActive: z.boolean().optional(),
	materialType: materialTypeSchema.optional(),
	search: z.string().optional(),
});

// Type exports for TypeScript inference
export type CreateProfileSupplierInput = z.infer<
	typeof createProfileSupplierSchema
>;
export type UpdateProfileSupplierInput = z.infer<
	typeof updateProfileSupplierSchema
>;
export type ProfileSupplierResponse = z.infer<
	typeof profileSupplierResponseSchema
>;
export type ListProfileSuppliersQuery = z.infer<
	typeof listProfileSuppliersSchema
>;
