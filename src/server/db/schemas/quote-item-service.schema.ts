import {
  decimal,
  foreignKey,
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
import {
  QUOTE_ITEM_SERVICE_DECIMAL_PRECISION,
  QUOTE_ITEM_SERVICE_FIELD_LENGTHS,
} from "./constants/quote-item-service.constants";
import { SERVICE_UNIT_VALUES, serviceUnitEnum } from "./enums.schema";
import { quoteItems } from "./quote-item.schema";
import { services } from "./service.schema";

export const quoteItemServices = pgTable(
  "QuoteItemService",
  {
    id: varchar("id", { length: QUOTE_ITEM_SERVICE_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quoteItemId: varchar("quoteItemId", {
      length: QUOTE_ITEM_SERVICE_FIELD_LENGTHS.QUOTE_ITEM_ID,
    }).notNull(),
    serviceId: varchar("serviceId", {
      length: QUOTE_ITEM_SERVICE_FIELD_LENGTHS.SERVICE_ID,
    }).notNull(),
    unit: serviceUnitEnum("unit").notNull(),
    quantity: decimal("quantity", {
      precision: QUOTE_ITEM_SERVICE_DECIMAL_PRECISION.QUANTITY.precision,
      scale: QUOTE_ITEM_SERVICE_DECIMAL_PRECISION.QUANTITY.scale,
    }).notNull(),
    amount: decimal("amount", {
      precision: QUOTE_ITEM_SERVICE_DECIMAL_PRECISION.AMOUNT.precision,
      scale: QUOTE_ITEM_SERVICE_DECIMAL_PRECISION.AMOUNT.scale,
    }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    // Foreign key to quoteItems table (cascade delete)
    foreignKey({
      columns: [table.quoteItemId],
      foreignColumns: [quoteItems.id],
      name: "QuoteItemService_quoteItemId_fkey",
    }).onDelete("cascade"),
    // Foreign key to services table (cascade delete)
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [services.id],
      name: "QuoteItemService_serviceId_fkey",
    }).onDelete("cascade"),
    // Unique constraint: one service per quote item
    unique("QuoteItemService_quoteItemId_serviceId_key").on(
      table.quoteItemId,
      table.serviceId
    ),
  ]
);

/**
 * Zod schemas for QuoteItemService validation
 */
export const quoteItemServiceSelectSchema = createSelectSchema(
  quoteItemServices,
  {
    quoteItemId: z.string().uuid(),
    serviceId: z.string().uuid(),
    unit: z.enum(SERVICE_UNIT_VALUES),
    quantity: z.string(),
    amount: z.string(),
  }
);

export const quoteItemServiceInsertSchema = createInsertSchema(
  quoteItemServices,
  {
    id: z.uuid().optional(),
    quoteItemId: z.string().uuid(),
    serviceId: z.string().uuid(),
    unit: z.enum(SERVICE_UNIT_VALUES),
    quantity: z.string(),
    amount: z.string(),
  }
).omit({ createdAt: true, updatedAt: true });

export const quoteItemServiceUpdateSchema = createUpdateSchema(
  quoteItemServices,
  {
    quoteItemId: z.string().uuid(),
    serviceId: z.string().uuid(),
    unit: z.enum(SERVICE_UNIT_VALUES),
    quantity: z.number().positive(),
    amount: z.number().nonnegative(),
  }
)
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type QuoteItemService = typeof quoteItemServices.$inferSelect;
export type NewQuoteItemService = typeof quoteItemServices.$inferInsert;
