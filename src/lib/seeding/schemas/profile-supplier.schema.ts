/**
 * @file ProfileSupplier Zod Schema
 * @description Type-safe validation schema for ProfileSupplier seeding
 * Generated from Drizzle schema, ORM-agnostic
 */

import { z } from "zod";

// Validation constraints
const SUPPLIER_NAME_MIN_LENGTH = 2;
const SUPPLIER_NAME_MAX_LENGTH = 100;
const SUPPLIER_NOTES_MAX_LENGTH = 500;

/**
 * Material types for ProfileSupplier
 * Determines the type of material the supplier provides
 */
export const MaterialTypeEnum = z.enum(["PVC", "ALUMINUM", "WOOD", "MIXED"]);

export type MaterialType = z.infer<typeof MaterialTypeEnum>;

/**
 * ProfileSupplier validation schema
 * Used by both factory and seeder for type-safe data validation
 *
 * @example
 * ```typescript
 * const data = { name: 'Rehau', materialType: 'PVC', ... };
 * const result = profileSupplierSchema.safeParse(data);
 * ```
 */
export const profileSupplierSchema = z.object({
  /**
   * Unique identifier (CUID format: c + 24 random alphanumeric)
   * Generated automatically if not provided
   * @default Generated CUID
   */
  id: z.string().cuid("Must be valid CUID format").optional().or(z.literal("")),

  /**
   * Supplier name (unique across all suppliers)
   * Examples: Rehau, Deceuninck, Azembla, Aluminios ABC
   *
   * @validation
   * - Required
   * - Between 2 and 100 characters
   * - Unique (checked at database level)
   * - Can contain letters, numbers, spaces, and hyphens
   */
  name: z
    .string()
    .trim()
    .min(
      SUPPLIER_NAME_MIN_LENGTH,
      "Supplier name must be at least 2 characters"
    )
    .max(
      SUPPLIER_NAME_MAX_LENGTH,
      "Supplier name must not exceed 100 characters"
    )
    .regex(
      /^[a-zA-Z0-9\s\-&()]+$/,
      "Supplier name can only contain letters, numbers, spaces, hyphens, ampersands and parentheses"
    ),

  /**
   * Type of material the supplier provides
   * Determines compatibility with different product lines
   *
   * @validation
   * - Required
   * - Must be one of: PVC, ALUMINUM, WOOD, MIXED
   */
  materialType: MaterialTypeEnum,

  /**
   * Whether this supplier is active for selection
   * Inactive suppliers still appear in history but not in selection dropdowns
   *
   * @default true
   * @validation
   * - Boolean
   * - Defaults to true if not provided
   */
  isActive: z.boolean().default(true),

  /**
   * Additional notes about the supplier
   * Can include contact info, special notes, quality info, etc.
   *
   * @validation
   * - Optional
   * - If provided, max 500 characters
   */
  notes: z
    .string()
    .trim()
    .max(SUPPLIER_NOTES_MAX_LENGTH, "Notes must not exceed 500 characters")
    .nullable()
    .optional(),

  /**
   * Creation timestamp
   * Generated automatically by database
   * @default current timestamp
   */
  createdAt: z.date().optional().or(z.string().datetime()),

  /**
   * Last update timestamp
   * Updated automatically by database on each update
   * @default current timestamp
   */
  updatedAt: z.date().optional().or(z.string().datetime()),
});

/**
 * Parsed and validated ProfileSupplier type
 * Guaranteed to meet all schema constraints
 */
export type ProfileSupplier = z.infer<typeof profileSupplierSchema>;

/**
 * ProfileSupplier creation input (without timestamps)
 * Used when creating new ProfileSuppliers
 */
export const profileSupplierCreateInput = profileSupplierSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type ProfileSupplierCreateInput = z.infer<
  typeof profileSupplierCreateInput
>;

/**
 * ProfileSupplier with optional fields (for partial updates)
 */
export const profileSupplierUpdateInput = profileSupplierCreateInput.partial();

export type ProfileSupplierUpdateInput = z.infer<
  typeof profileSupplierUpdateInput
>;

/**
 * Presets for common ProfileSupplier configurations
 * Used for quick testing and demos
 */

/**
 * Standard profile suppliers (PVC window frames)
 */
export const PVC_SUPPLIERS: readonly ProfileSupplierCreateInput[] = [
  {
    name: "Rehau",
    materialType: "PVC",
    isActive: true,
    notes: "Premium German PVC frame system, eco-friendly",
  },
  {
    name: "Deceuninck",
    materialType: "PVC",
    isActive: true,
    notes: "Belgian quality, thermally optimized frames",
  },
  {
    name: "Azembla",
    materialType: "PVC",
    isActive: true,
    notes: "Colombian manufacturer, affordable quality",
  },
] as const;

/**
 * Aluminum profile suppliers
 */
export const ALUMINUM_SUPPLIERS: readonly ProfileSupplierCreateInput[] = [
  {
    name: "Aluminios ABC",
    materialType: "ALUMINUM",
    isActive: true,
    notes: "Industrial aluminum profiles for structural glazing",
  },
  {
    name: "Hydro Aluminum",
    materialType: "ALUMINUM",
    isActive: true,
    notes: "Architectural aluminum systems",
  },
] as const;

/**
 * Mixed material suppliers
 */
export const MIXED_SUPPLIERS: readonly ProfileSupplierCreateInput[] = [
  {
    name: "Universal Profiles",
    materialType: "MIXED",
    isActive: true,
    notes: "Supplies both PVC and aluminum profiles",
  },
] as const;

/**
 * All preset suppliers
 */
export const ALL_SUPPLIERS = [
  ...PVC_SUPPLIERS,
  ...ALUMINUM_SUPPLIERS,
  ...MIXED_SUPPLIERS,
] as const;
