import {
  boolean,
  index,
  pgTable,
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
import { COLOR_FIELD_LENGTHS } from "./constants/color.constants";

export const colors = pgTable(
  "Color",
  {
    id: varchar("id", { length: COLOR_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /**
     * Commercial color name (e.g., "Blanco", "Nogal Europeo")
     */
    name: varchar("name", { length: COLOR_FIELD_LENGTHS.NAME }).notNull(),
    /**
     * Industry standard RAL code (optional, e.g., "RAL 9010")
     */
    ralCode: varchar("ralCode", { length: COLOR_FIELD_LENGTHS.RAL_CODE }),
    /**
     * Hexadecimal color code for UI rendering (#RRGGBB format)
     */
    hexCode: varchar("hexCode", {
      length: COLOR_FIELD_LENGTHS.HEX_CODE,
    }).notNull(),
    /**
     * Soft delete flag (false = hidden in new assignments, but preserved in existing)
     */
    isActive: boolean("isActive")
      .notNull()
      .$defaultFn(() => true),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    // Unique constraint: prevent duplicate colors
    unique("Color_name_hexCode_key").on(table.name, table.hexCode),
    // Indexes
    index("Color_isActive_idx").on(table.isActive),
    index("Color_name_idx").on(table.name),
  ]
);

/**
 * Zod schemas for Color validation
 */
export const colorSelectSchema = createSelectSchema(colors, {
  name: z.string().max(COLOR_FIELD_LENGTHS.NAME).min(1),
  ralCode: z
    .string()
    .max(COLOR_FIELD_LENGTHS.RAL_CODE)
    .regex(/^RAL \d{4}$/)
    .optional(),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isActive: z.boolean(),
});

export const colorInsertSchema = createInsertSchema(colors, {
  id: z.cuid().optional(),
  name: z.string().max(COLOR_FIELD_LENGTHS.NAME).min(1),
  ralCode: z
    .string()
    .max(COLOR_FIELD_LENGTHS.RAL_CODE)
    .regex(/^RAL \d{4}$/)
    .optional(),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isActive: z.boolean().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const colorUpdateSchema = createUpdateSchema(colors, {
  name: z.string().max(COLOR_FIELD_LENGTHS.NAME).min(1),
  ralCode: z
    .string()
    .max(COLOR_FIELD_LENGTHS.RAL_CODE)
    .regex(/^RAL \d{4}$/),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isActive: z.boolean(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;
