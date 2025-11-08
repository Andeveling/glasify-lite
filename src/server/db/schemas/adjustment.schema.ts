import {
  decimal,
  foreignKey,
  index,
  pgTable,
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
  ADJUSTMENT_DECIMAL_PRECISION,
  ADJUSTMENT_FIELD_LENGTHS,
} from "./constants/adjustment.constants";
import {
  ADJUSTMENT_SCOPE_VALUES,
  ADJUSTMENT_SIGN_VALUES,
  adjustmentScopeEnum,
  adjustmentSignEnum,
  SERVICE_UNIT_VALUES,
  serviceUnitEnum,
} from "./enums.schema";
import { quotes } from "./quote.schema";
import { quoteItems } from "./quote-item.schema";

export const adjustments = pgTable(
  "Adjustment",
  {
    id: varchar("id", { length: ADJUSTMENT_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scope: adjustmentScopeEnum("scope").notNull(),
    concept: varchar("concept", {
      length: ADJUSTMENT_FIELD_LENGTHS.CONCEPT,
    }).notNull(),
    unit: serviceUnitEnum("unit").notNull(),
    value: decimal("value", {
      precision: ADJUSTMENT_DECIMAL_PRECISION.VALUE.precision,
      scale: ADJUSTMENT_DECIMAL_PRECISION.VALUE.scale,
    }).notNull(),
    sign: adjustmentSignEnum("sign").notNull(),
    quoteId: varchar("quoteId", { length: ADJUSTMENT_FIELD_LENGTHS.QUOTE_ID }),
    quoteItemId: varchar("quoteItemId", {
      length: ADJUSTMENT_FIELD_LENGTHS.QUOTE_ITEM_ID,
    }),
    amount: decimal("amount", {
      precision: ADJUSTMENT_DECIMAL_PRECISION.AMOUNT.precision,
      scale: ADJUSTMENT_DECIMAL_PRECISION.AMOUNT.scale,
    }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    // Foreign key to quotes table (cascade delete, optional)
    foreignKey({
      columns: [table.quoteId],
      foreignColumns: [quotes.id],
      name: "Adjustment_quoteId_fkey",
    }).onDelete("cascade"),
    // Foreign key to quoteItems table (cascade delete, optional)
    foreignKey({
      columns: [table.quoteItemId],
      foreignColumns: [quoteItems.id],
      name: "Adjustment_quoteItemId_fkey",
    }).onDelete("cascade"),
    // Indexes
    index("Adjustment_quoteId_idx").on(table.quoteId),
    index("Adjustment_quoteItemId_idx").on(table.quoteItemId),
  ]
);

/**
 * Zod schemas for Adjustment validation
 */
export const adjustmentSelectSchema = createSelectSchema(adjustments, {
  scope: z.enum(ADJUSTMENT_SCOPE_VALUES),
  concept: z.string().max(ADJUSTMENT_FIELD_LENGTHS.CONCEPT).min(1),
  unit: z.enum(SERVICE_UNIT_VALUES),
  value: z.number().nonnegative(),
  sign: z.enum(ADJUSTMENT_SIGN_VALUES),
  quoteId: z.string().cuid().nullable(),
  quoteItemId: z.string().cuid().nullable(),
  amount: z.number(),
});

export const adjustmentInsertSchema = createInsertSchema(adjustments, {
  id: z.cuid().optional(),
  scope: z.enum(ADJUSTMENT_SCOPE_VALUES),
  concept: z.string().max(ADJUSTMENT_FIELD_LENGTHS.CONCEPT).min(1),
  unit: z.enum(SERVICE_UNIT_VALUES),
  value: z.number().nonnegative(),
  sign: z.enum(ADJUSTMENT_SIGN_VALUES),
  quoteId: z.string().cuid().optional(),
  quoteItemId: z.string().cuid().optional(),
  amount: z.number(),
}).omit({ createdAt: true, updatedAt: true });

export const adjustmentUpdateSchema = createUpdateSchema(adjustments, {
  scope: z.enum(ADJUSTMENT_SCOPE_VALUES),
  concept: z.string().max(ADJUSTMENT_FIELD_LENGTHS.CONCEPT).min(1),
  unit: z.enum(SERVICE_UNIT_VALUES),
  value: z.number().nonnegative(),
  sign: z.enum(ADJUSTMENT_SIGN_VALUES),
  quoteId: z.string().cuid(),
  quoteItemId: z.string().cuid(),
  amount: z.number(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type Adjustment = typeof adjustments.$inferSelect;
export type NewAdjustment = typeof adjustments.$inferInsert;
