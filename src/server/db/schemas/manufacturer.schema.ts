import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { FIELD_LENGTHS, ISO_CONSTRAINTS } from "./constants/constants";

export const manufacturers = pgTable(
  "Manufacturer",
  {
    id: varchar("id", { length: FIELD_LENGTHS.MANUFACTURER.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", {
      length: FIELD_LENGTHS.MANUFACTURER.NAME,
    }).notNull(),
    currency: varchar("currency", {
      length: ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH,
    }).notNull(),
    quoteValidityDays: text("quoteValidityDays")
      .notNull()
      .$defaultFn(() => "15"),
    createdAt: text("createdAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updatedAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdateFn(() => new Date().toISOString()),
  },
  (table) => [index("Manufacturer_currency_idx").on(table.currency)]
);

export const manufacturerSelectSchema = createSelectSchema(manufacturers, {
  name: z.string().max(FIELD_LENGTHS.MANUFACTURER.NAME).min(1),
  currency: z
    .string()
    .length(ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH)
    .regex(/^[A-Z]{3}$/),
  quoteValidityDays: z.number().int().positive(),
});

export const manufacturerInsertSchema = createInsertSchema(manufacturers, {
  id: z.cuid().optional(),
  name: z.string().max(FIELD_LENGTHS.MANUFACTURER.NAME).min(1),
  currency: z
    .string()
    .length(ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH)
    .regex(/^[A-Z]{3}$/),
  quoteValidityDays: z.number().int().positive().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const manufacturerUpdateSchema = createUpdateSchema(manufacturers, {
  name: z.string().max(FIELD_LENGTHS.MANUFACTURER.NAME).min(1),
  currency: z
    .string()
    .length(ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH)
    .regex(/^[A-Z]{3}$/),
  quoteValidityDays: z.number().int().positive(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type Manufacturer = typeof manufacturers.$inferSelect;
export type NewManufacturer = typeof manufacturers.$inferInsert;
