import {
  decimal,
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
import {
  GLASS_TYPE_CONSTRAINTS,
  GLASS_TYPE_FIELD_LENGTHS,
  GLASS_TYPE_PRECISION,
} from "./constants/glass-type.constants";
import { glassSuppliers } from "./glass-supplier.schema";

export const glassTypes = pgTable(
  "GlassType",
  {
    id: varchar("id", { length: GLASS_TYPE_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: GLASS_TYPE_FIELD_LENGTHS.NAME })
      .notNull()
      .unique(),
    code: varchar("code", { length: GLASS_TYPE_FIELD_LENGTHS.CODE })
      .notNull()
      .unique(),
    series: varchar("series", { length: GLASS_TYPE_FIELD_LENGTHS.SERIES }),
    manufacturer: varchar("manufacturer", {
      length: GLASS_TYPE_FIELD_LENGTHS.MANUFACTURER,
    }),
    glassSupplierId: varchar("glassSupplierId", {
      length: GLASS_TYPE_FIELD_LENGTHS.ID,
    }),
    thicknessMm: text("thicknessMm").notNull(),
    pricePerSqm: decimal("pricePerSqm", {
      precision: GLASS_TYPE_PRECISION.PRICE_PER_SQM.precision,
      scale: GLASS_TYPE_PRECISION.PRICE_PER_SQM.scale,
    }).notNull(),
    uValue: decimal("uValue", {
      precision: GLASS_TYPE_PRECISION.U_VALUE.precision,
      scale: GLASS_TYPE_PRECISION.U_VALUE.scale,
    }),
    description: varchar("description", {
      length: GLASS_TYPE_FIELD_LENGTHS.DESCRIPTION,
    }),
    solarFactor: decimal("solarFactor", {
      precision: GLASS_TYPE_PRECISION.SOLAR_FACTOR.precision,
      scale: GLASS_TYPE_PRECISION.SOLAR_FACTOR.scale,
    }),
    lightTransmission: decimal("lightTransmission", {
      precision: GLASS_TYPE_PRECISION.LIGHT_TRANSMISSION.precision,
      scale: GLASS_TYPE_PRECISION.LIGHT_TRANSMISSION.scale,
    }),
    isActive: text("isActive")
      .notNull()
      .$defaultFn(() => "true"),
    lastReviewDate: timestamp("lastReviewDate", { mode: "date" }),
    isSeeded: text("isSeeded")
      .notNull()
      .$defaultFn(() => "false"),
    seedVersion: varchar("seedVersion", {
      length: GLASS_TYPE_FIELD_LENGTHS.SEED_VERSION,
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.glassSupplierId],
      foreignColumns: [glassSuppliers.id],
      name: "GlassType_glassSupplierId_fkey",
    }).onDelete("set null"),
    index("GlassType_name_idx").on(table.name),
    index("GlassType_code_idx").on(table.code),
    index("GlassType_series_idx").on(table.series),
    index("GlassType_manufacturer_idx").on(table.manufacturer),
    index("GlassType_glassSupplierId_idx").on(table.glassSupplierId),
    index("GlassType_isActive_idx").on(table.isActive),
    index("GlassType_isSeeded_idx").on(table.isSeeded),
    index("GlassType_thicknessMm_idx").on(table.thicknessMm),
    index("GlassType_pricePerSqm_idx").on(table.pricePerSqm),
    index("GlassType_createdAt_idx").on(table.createdAt),
    index("GlassType_updatedAt_idx").on(table.updatedAt),
  ]
);

export const glassTypeSelectSchema = createSelectSchema(glassTypes, {
  name: z.string().max(GLASS_TYPE_FIELD_LENGTHS.NAME).min(1),
  code: z.string().max(GLASS_TYPE_FIELD_LENGTHS.CODE).min(1),
  series: z.string().max(GLASS_TYPE_FIELD_LENGTHS.SERIES).optional(),
  manufacturer: z
    .string()
    .max(GLASS_TYPE_FIELD_LENGTHS.MANUFACTURER)
    .optional(),
  glassSupplierId: z.string().optional(),
  thicknessMm: z
    .number()
    .int()
    .min(GLASS_TYPE_CONSTRAINTS.THICKNESS_MM.min)
    .max(GLASS_TYPE_CONSTRAINTS.THICKNESS_MM.max),
  pricePerSqm: z.string(),
  uValue: z.string().optional(),
  description: z.string().max(GLASS_TYPE_FIELD_LENGTHS.DESCRIPTION).optional(),
  solarFactor: z.string().optional(),
  lightTransmission: z.string().optional(),
  isActive: z.boolean(),
  lastReviewDate: z.date().optional(),
  isSeeded: z.boolean(),
  seedVersion: z.string().max(GLASS_TYPE_FIELD_LENGTHS.SEED_VERSION).optional(),
});

export const glassTypeInsertSchema = createInsertSchema(glassTypes, {
  id: z.uuid().optional(),
  name: z.string().max(GLASS_TYPE_FIELD_LENGTHS.NAME).min(1),
  code: z.string().max(GLASS_TYPE_FIELD_LENGTHS.CODE).min(1),
  series: z.string().max(GLASS_TYPE_FIELD_LENGTHS.SERIES).optional(),
  manufacturer: z
    .string()
    .max(GLASS_TYPE_FIELD_LENGTHS.MANUFACTURER)
    .optional(),
  glassSupplierId: z.string().optional(),
  thicknessMm: z
    .number()
    .int()
    .min(GLASS_TYPE_CONSTRAINTS.THICKNESS_MM.min)
    .max(GLASS_TYPE_CONSTRAINTS.THICKNESS_MM.max),
  pricePerSqm: z.string(),
  uValue: z.string().optional(),
  description: z.string().max(GLASS_TYPE_FIELD_LENGTHS.DESCRIPTION).optional(),
  solarFactor: z.string().optional(),
  lightTransmission: z.string().optional(),
  isActive: z.boolean().optional(),
  lastReviewDate: z.date().optional(),
  isSeeded: z.boolean().optional(),
  seedVersion: z.string().max(GLASS_TYPE_FIELD_LENGTHS.SEED_VERSION).optional(),
}).omit({ createdAt: true, updatedAt: true });

export const glassTypeUpdateSchema = createUpdateSchema(glassTypes, {
  name: z.string().max(GLASS_TYPE_FIELD_LENGTHS.NAME).min(1),
  code: z.string().max(GLASS_TYPE_FIELD_LENGTHS.CODE).min(1),
  series: z.string().max(GLASS_TYPE_FIELD_LENGTHS.SERIES).optional(),
  manufacturer: z
    .string()
    .max(GLASS_TYPE_FIELD_LENGTHS.MANUFACTURER)
    .optional(),
  glassSupplierId: z.string().optional(),
  thicknessMm: z
    .number()
    .int()
    .min(GLASS_TYPE_CONSTRAINTS.THICKNESS_MM.min)
    .max(GLASS_TYPE_CONSTRAINTS.THICKNESS_MM.max),
  pricePerSqm: z.string(),
  uValue: z.string().optional(),
  description: z.string().max(GLASS_TYPE_FIELD_LENGTHS.DESCRIPTION).optional(),
  solarFactor: z.string().optional(),
  lightTransmission: z.string().optional(),
  isActive: z.boolean(),
  lastReviewDate: z.date().optional(),
  isSeeded: z.boolean(),
  seedVersion: z.string().max(GLASS_TYPE_FIELD_LENGTHS.SEED_VERSION).optional(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type GlassType = typeof glassTypes.$inferSelect;
export type NewGlassType = typeof glassTypes.$inferInsert;
