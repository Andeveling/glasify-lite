import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS } from "./constants/glass-type-characteristic.constants";
import { glassCharacteristics } from "./glass-characteristic.schema";
import { glassTypes } from "./glass-type.schema";

export const glassTypeCharacteristics = pgTable(
  "GlassTypeCharacteristic",
  {
    id: varchar("id", { length: GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    glassTypeId: varchar("glassTypeId", {
      length: GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.GLASS_TYPE_ID,
    }).notNull(),
    characteristicId: varchar("characteristicId", {
      length: GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.CHARACTERISTIC_ID,
    }).notNull(),
    /**
     * Optional value for the characteristic (e.g., '6.38mm' for laminated thickness)
     */
    value: varchar("value", {
      length: GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.VALUE,
    }),
    /**
     * Optional certification reference (e.g., 'EN 12150' for tempered glass)
     */
    certification: varchar("certification", {
      length: GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.CERTIFICATION,
    }),
    /**
     * Additional notes about this characteristic application
     */
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    // Foreign key to glassTypes table (cascade delete)
    foreignKey({
      columns: [table.glassTypeId],
      foreignColumns: [glassTypes.id],
      name: "GlassTypeCharacteristic_glassTypeId_fkey",
    }).onDelete("cascade"),
    // Foreign key to glassCharacteristics table (cascade delete)
    foreignKey({
      columns: [table.characteristicId],
      foreignColumns: [glassCharacteristics.id],
      name: "GlassTypeCharacteristic_characteristicId_fkey",
    }).onDelete("cascade"),
    // Unique constraint: one characteristic per glass type
    unique("GlassTypeCharacteristic_glassTypeId_characteristicId_key").on(
      table.glassTypeId,
      table.characteristicId
    ),
    // Indexes
    index("GlassTypeCharacteristic_glassTypeId_idx").on(table.glassTypeId),
    index("GlassTypeCharacteristic_characteristicId_idx").on(
      table.characteristicId
    ),
  ]
);

/**
 * Zod schemas for GlassTypeCharacteristic validation
 */
export const glassTypeCharacteristicSelectSchema = createSelectSchema(
  glassTypeCharacteristics,
  {
    glassTypeId: z.string().uuid(),
    characteristicId: z.string().uuid(),
    value: z
      .string()
      .max(GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.VALUE)
      .optional(),
    certification: z
      .string()
      .max(GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.CERTIFICATION)
      .optional(),
    notes: z.string().optional(),
  }
);

export const glassTypeCharacteristicInsertSchema = createInsertSchema(
  glassTypeCharacteristics,
  {
    id: z.uuid().optional(),
    glassTypeId: z.string().uuid(),
    characteristicId: z.string().uuid(),
    value: z
      .string()
      .max(GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.VALUE)
      .optional(),
    certification: z
      .string()
      .max(GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.CERTIFICATION)
      .optional(),
    notes: z.string().optional(),
  }
).omit({ createdAt: true, updatedAt: true });

export const glassTypeCharacteristicUpdateSchema = createUpdateSchema(
  glassTypeCharacteristics,
  {
    glassTypeId: z.string().uuid(),
    characteristicId: z.string().uuid(),
    value: z.string().max(GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.VALUE),
    certification: z
      .string()
      .max(GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS.CERTIFICATION),
    notes: z.string(),
  }
)
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type GlassTypeCharacteristic =
  typeof glassTypeCharacteristics.$inferSelect;
export type NewGlassTypeCharacteristic =
  typeof glassTypeCharacteristics.$inferInsert;
