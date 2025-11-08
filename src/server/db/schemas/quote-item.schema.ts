import {
  boolean,
  decimal,
  foreignKey,
  index,
  integer,
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
  QUOTE_ITEM_DECIMAL_PRECISION,
  QUOTE_ITEM_FIELD_LENGTHS,
} from "./constants/quote-item.constants";
import { glassTypes } from "./glass-type.schema";
import { models } from "./model.schema";
import { quotes } from "./quote.schema";

export const quoteItems = pgTable(
  "QuoteItem",
  {
    id: varchar("id", { length: QUOTE_ITEM_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quoteId: varchar("quoteId", {
      length: QUOTE_ITEM_FIELD_LENGTHS.QUOTE_ID,
    }).notNull(),
    modelId: varchar("modelId", {
      length: QUOTE_ITEM_FIELD_LENGTHS.MODEL_ID,
    }).notNull(),
    glassTypeId: varchar("glassTypeId", {
      length: QUOTE_ITEM_FIELD_LENGTHS.GLASS_TYPE_ID,
    }).notNull(),
    // User-editable item identification
    name: varchar("name", { length: QUOTE_ITEM_FIELD_LENGTHS.NAME }).notNull(),
    quantity: integer("quantity")
      .notNull()
      .$defaultFn(() => 1),
    roomLocation: varchar("roomLocation", {
      length: QUOTE_ITEM_FIELD_LENGTHS.ROOM_LOCATION,
    }),
    // Dimensions
    widthMm: integer("widthMm").notNull(),
    heightMm: integer("heightMm").notNull(),
    accessoryApplied: boolean("accessoryApplied")
      .notNull()
      .$defaultFn(() => false),
    subtotal: decimal("subtotal", {
      precision: QUOTE_ITEM_DECIMAL_PRECISION.SUBTOTAL.precision,
      scale: QUOTE_ITEM_DECIMAL_PRECISION.SUBTOTAL.scale,
    }).notNull(),
    // Color selection (optional) - Snapshot for quote immutability
    colorId: varchar("colorId", { length: QUOTE_ITEM_FIELD_LENGTHS.COLOR_ID }),
    colorSurchargePercentage: decimal("colorSurchargePercentage", {
      precision:
        QUOTE_ITEM_DECIMAL_PRECISION.COLOR_SURCHARGE_PERCENTAGE.precision,
      scale: QUOTE_ITEM_DECIMAL_PRECISION.COLOR_SURCHARGE_PERCENTAGE.scale,
    }),
    colorHexCode: varchar("colorHexCode", {
      length: QUOTE_ITEM_FIELD_LENGTHS.COLOR_HEX_CODE,
    }),
    colorName: varchar("colorName", {
      length: QUOTE_ITEM_FIELD_LENGTHS.COLOR_NAME,
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    // Foreign key to quotes table (cascade delete)
    foreignKey({
      columns: [table.quoteId],
      foreignColumns: [quotes.id],
      name: "QuoteItem_quoteId_fkey",
    }).onDelete("cascade"),
    // Foreign key to models table (restrict delete)
    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "QuoteItem_modelId_fkey",
    }).onDelete("restrict"),
    // Foreign key to glassTypes table (restrict delete)
    foreignKey({
      columns: [table.glassTypeId],
      foreignColumns: [glassTypes.id],
      name: "QuoteItem_glassTypeId_fkey",
    }).onDelete("restrict"),
    // TODO: Add foreign key to colors table when Color schema is migrated
    // foreignKey({
    //   columns: [table.colorId],
    //   foreignColumns: [colors.id],
    //   name: "QuoteItem_colorId_fkey",
    // }).onDelete("restrict"),
    // Indexes
    index("QuoteItem_quoteId_idx").on(table.quoteId),
    index("QuoteItem_colorId_idx").on(table.colorId),
  ]
);

/**
 * Zod schemas for QuoteItem validation
 */
export const quoteItemSelectSchema = createSelectSchema(quoteItems, {
  quoteId: z.string().cuid(),
  modelId: z.string().cuid(),
  glassTypeId: z.string().cuid(),
  colorId: z.string().cuid().nullable(),
  name: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.NAME).min(1),
  quantity: z.number().int().positive(),
  roomLocation: z
    .string()
    .max(QUOTE_ITEM_FIELD_LENGTHS.ROOM_LOCATION)
    .optional(),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  accessoryApplied: z.boolean(),
  subtotal: z.number().nonnegative(),
  colorSurchargePercentage: z.number().nonnegative().optional(),
  colorHexCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  colorName: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.COLOR_NAME).optional(),
});

export const quoteItemInsertSchema = createInsertSchema(quoteItems, {
  id: z.cuid().optional(),
  quoteId: z.string().cuid(),
  modelId: z.string().cuid(),
  glassTypeId: z.string().cuid(),
  colorId: z.string().cuid().optional(),
  name: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.NAME).min(1),
  quantity: z.number().int().positive().optional(),
  roomLocation: z
    .string()
    .max(QUOTE_ITEM_FIELD_LENGTHS.ROOM_LOCATION)
    .optional(),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  accessoryApplied: z.boolean().optional(),
  subtotal: z.number().nonnegative(),
  colorSurchargePercentage: z.number().nonnegative().optional(),
  colorHexCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  colorName: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.COLOR_NAME).optional(),
}).omit({ createdAt: true, updatedAt: true });

export const quoteItemUpdateSchema = createUpdateSchema(quoteItems, {
  quoteId: z.string().cuid(),
  modelId: z.string().cuid(),
  glassTypeId: z.string().cuid(),
  colorId: z.string().cuid(),
  name: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.NAME).min(1),
  quantity: z.number().int().positive(),
  roomLocation: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.ROOM_LOCATION),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  accessoryApplied: z.boolean(),
  subtotal: z.number().nonnegative(),
  colorSurchargePercentage: z.number().nonnegative(),
  colorHexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  colorName: z.string().max(QUOTE_ITEM_FIELD_LENGTHS.COLOR_NAME),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
