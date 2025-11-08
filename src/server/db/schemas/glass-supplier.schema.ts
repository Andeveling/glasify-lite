import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { GLASS_SUPPLIER_FIELD_LENGTHS } from "./constants/glass-supplier.constants";
import { tenantConfigs } from "./tenant-config.schema";

export const glassSuppliers = pgTable(
  "GlassSupplier",
  {
    id: varchar("id", { length: GLASS_SUPPLIER_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantConfigId: varchar("tenantConfigId", {
      length: GLASS_SUPPLIER_FIELD_LENGTHS.TENANT_CONFIG_ID,
    }).$defaultFn(() => "1"),
    name: varchar("name", { length: GLASS_SUPPLIER_FIELD_LENGTHS.NAME })
      .notNull()
      .unique(),
    code: varchar("code", {
      length: GLASS_SUPPLIER_FIELD_LENGTHS.CODE,
    }).unique(),
    country: varchar("country", {
      length: GLASS_SUPPLIER_FIELD_LENGTHS.COUNTRY,
    }),
    website: varchar("website", {
      length: GLASS_SUPPLIER_FIELD_LENGTHS.WEBSITE,
    }),
    contactEmail: varchar("contactEmail", {
      length: GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_EMAIL,
    }),
    contactPhone: varchar("contactPhone", {
      length: GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_PHONE,
    }),
    isActive: text("isActive")
      .notNull()
      .$defaultFn(() => "true"),
    notes: varchar("notes", { length: GLASS_SUPPLIER_FIELD_LENGTHS.NOTES }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.tenantConfigId],
      foreignColumns: [tenantConfigs.id],
      name: "GlassSupplier_tenantConfigId_fkey",
    }).onDelete("set null"),
    index("GlassSupplier_isActive_idx").on(table.isActive),
  ]
);

export const glassSupplierSelectSchema = createSelectSchema(glassSuppliers, {
  name: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NAME).min(1),
  code: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.CODE).optional(),
  country: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.COUNTRY).optional(),
  website: z.url().max(GLASS_SUPPLIER_FIELD_LENGTHS.WEBSITE).optional(),
  contactEmail: z
    .email()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_EMAIL)
    .optional(),
  contactPhone: z
    .string()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_PHONE)
    .optional(),
  isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()),
  notes: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NOTES).optional(),
  tenantConfigId: z.string().optional(),
});

export const glassSupplierInsertSchema = createInsertSchema(glassSuppliers, {
  id: z.cuid().optional(),
  name: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NAME).min(1),
  code: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.CODE).optional(),
  country: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.COUNTRY).optional(),
  website: z
    .string()
    .url()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.WEBSITE)
    .optional(),
  contactEmail: z
    .string()
    .email()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_EMAIL)
    .optional(),
  contactPhone: z
    .string()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_PHONE)
    .optional(),
  isActive: z
    .preprocess(
      (val) => (val === true || val === "true" ? "true" : "false"),
      z.string()
    )
    .optional(),
  notes: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NOTES).optional(),
  tenantConfigId: z.string().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const glassSupplierUpdateSchema = createUpdateSchema(glassSuppliers, {
  name: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NAME).min(1),
  code: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.CODE).optional(),
  country: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.COUNTRY).optional(),
  website: z
    .string()
    .url()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.WEBSITE)
    .optional(),
  contactEmail: z
    .string()
    .email()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_EMAIL)
    .optional(),
  contactPhone: z
    .string()
    .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_PHONE)
    .optional(),
  isActive: z.preprocess(
    (val) => (val === true || val === "true" ? "true" : "false"),
    z.string()
  ),
  notes: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NOTES).optional(),
  tenantConfigId: z.string().optional(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type GlassSupplier = typeof glassSuppliers.$inferSelect;
export type NewGlassSupplier = typeof glassSuppliers.$inferInsert;
