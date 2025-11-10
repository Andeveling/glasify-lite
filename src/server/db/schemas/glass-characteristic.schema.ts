import {
  boolean,
  index,
  integer,
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
import { GLASS_CHARACTERISTIC_FIELD_LENGTHS } from "./constants/glass-characteristic.constants";

export const glassCharacteristics = pgTable(
  "GlassCharacteristic",
  {
    id: varchar("id", { length: GLASS_CHARACTERISTIC_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /**
     * Unique key for the characteristic (e.g., 'tempered', 'laminated', 'low_e')
     */
    key: varchar("key", { length: GLASS_CHARACTERISTIC_FIELD_LENGTHS.KEY })
      .notNull()
      .unique(),
    /**
     * Technical name in English
     */
    name: varchar("name", {
      length: GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME,
    }).notNull(),
    /**
     * Commercial name in Spanish
     */
    nameEs: varchar("nameEs", {
      length: GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME_ES,
    }).notNull(),
    /**
     * Description of the characteristic
     */
    description: text("description"),
    /**
     * Category grouping (e.g., 'safety', 'thermal', 'acoustic', 'coating')
     */
    category: varchar("category", {
      length: GLASS_CHARACTERISTIC_FIELD_LENGTHS.CATEGORY,
    }).notNull(),
    /**
     * Whether this characteristic is active for assignment
     */
    isActive: boolean("isActive")
      .notNull()
      .$defaultFn(() => true),
    /**
     * Display order (lower = higher priority)
     */
    sortOrder: integer("sortOrder")
      .notNull()
      .$defaultFn(() => 0),
    /**
     * Flag for seed-generated characteristics (true) vs custom characteristics (false)
     */
    isSeeded: boolean("isSeeded")
      .notNull()
      .$defaultFn(() => false),
    /**
     * Seed data version (e.g., "1.0", "1.1") for idempotent updates
     */
    seedVersion: varchar("seedVersion", {
      length: GLASS_CHARACTERISTIC_FIELD_LENGTHS.SEED_VERSION,
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("GlassCharacteristic_category_idx").on(table.category),
    index("GlassCharacteristic_isActive_idx").on(table.isActive),
    index("GlassCharacteristic_isSeeded_idx").on(table.isSeeded),
  ]
);

/**
 * Zod schemas for GlassCharacteristic validation
 */
export const glassCharacteristicSelectSchema = createSelectSchema(
  glassCharacteristics,
  {
    key: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.KEY).min(1),
    name: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME).min(1),
    nameEs: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME_ES).min(1),
    description: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.DESCRIPTION)
      .optional(),
    category: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.CATEGORY)
      .min(1),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
    isSeeded: z.boolean(),
    seedVersion: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.SEED_VERSION)
      .optional(),
  }
);

export const glassCharacteristicInsertSchema = createInsertSchema(
  glassCharacteristics,
  {
    id: z.uuid().optional(),
    key: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.KEY).min(1),
    name: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME).min(1),
    nameEs: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME_ES).min(1),
    description: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.DESCRIPTION)
      .optional(),
    category: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.CATEGORY)
      .min(1),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    isSeeded: z.boolean().optional(),
    seedVersion: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.SEED_VERSION)
      .optional(),
  }
).omit({ createdAt: true, updatedAt: true });

export const glassCharacteristicUpdateSchema = createUpdateSchema(
  glassCharacteristics,
  {
    key: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.KEY).min(1),
    name: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME).min(1),
    nameEs: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.NAME_ES).min(1),
    description: z.string().max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.DESCRIPTION),
    category: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.CATEGORY)
      .min(1),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
    isSeeded: z.boolean(),
    seedVersion: z
      .string()
      .max(GLASS_CHARACTERISTIC_FIELD_LENGTHS.SEED_VERSION),
  }
)
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type GlassCharacteristic = typeof glassCharacteristics.$inferSelect;
export type NewGlassCharacteristic = typeof glassCharacteristics.$inferInsert;
