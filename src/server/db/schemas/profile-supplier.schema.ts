import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { FIELD_LENGTHS } from "./constants/constants";
import { MATERIAL_TYPE_VALUES, materialTypeEnum } from "./enums.schema";

export const profileSuppliers = pgTable(
  "ProfileSupplier",
  {
    id: varchar("id", { length: FIELD_LENGTHS.PROFILE_SUPPLIER.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", {
      length: FIELD_LENGTHS.PROFILE_SUPPLIER.NAME,
    })
      .notNull()
      .unique(),
    materialType: materialTypeEnum("materialType").notNull(),
    isActive: text("isActive")
      .notNull()
      .$defaultFn(() => "true"),
    notes: varchar("notes", {
      length: FIELD_LENGTHS.PROFILE_SUPPLIER.NOTES,
    }),
    createdAt: text("createdAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updatedAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdateFn(() => new Date().toISOString()),
  },
  (table) => [
    index("ProfileSupplier_isActive_idx").on(table.isActive),
    index("ProfileSupplier_materialType_idx").on(table.materialType),
  ]
);

export const profileSupplierSelectSchema = createSelectSchema(
  profileSuppliers,
  {
    name: z.string().max(FIELD_LENGTHS.PROFILE_SUPPLIER.NAME).min(1),
    materialType: z.enum(MATERIAL_TYPE_VALUES),
    isActive: z.preprocess(
      (val) => val === "true" || val === true,
      z.boolean()
    ),
    notes: z.string().max(FIELD_LENGTHS.PROFILE_SUPPLIER.NOTES).optional(),
  }
);

export const profileSupplierInsertSchema = createInsertSchema(
  profileSuppliers,
  {
    id: z.cuid().optional(),
    name: z.string().max(FIELD_LENGTHS.PROFILE_SUPPLIER.NAME).min(1),
    materialType: z.enum(MATERIAL_TYPE_VALUES),
    isActive: z
      .preprocess(
        (val) => (val === true || val === "true" ? "true" : "false"),
        z.string()
      )
      .optional(),
    notes: z.string().max(FIELD_LENGTHS.PROFILE_SUPPLIER.NOTES).optional(),
  }
).omit({ createdAt: true, updatedAt: true });

export const profileSupplierUpdateSchema = createUpdateSchema(
  profileSuppliers,
  {
    name: z.string().max(FIELD_LENGTHS.PROFILE_SUPPLIER.NAME).min(1),
    materialType: z.enum(MATERIAL_TYPE_VALUES),
    isActive: z.preprocess(
      (val) => (val === true || val === "true" ? "true" : "false"),
      z.string()
    ),
    notes: z.string().max(FIELD_LENGTHS.PROFILE_SUPPLIER.NOTES).optional(),
  }
)
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type ProfileSupplier = typeof profileSuppliers.$inferSelect;
export type NewProfileSupplier = typeof profileSuppliers.$inferInsert;
