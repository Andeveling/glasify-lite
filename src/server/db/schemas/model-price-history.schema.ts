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
  MODEL_PRICE_HISTORY_DECIMAL_PRECISION,
  MODEL_PRICE_HISTORY_FIELD_LENGTHS,
} from "./constants/model-price-history.constants";
import { models } from "./model.schema";
import { users } from "./user.schema";

export const modelPriceHistories = pgTable(
  "ModelPriceHistory",
  {
    id: varchar("id", { length: MODEL_PRICE_HISTORY_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    modelId: varchar("modelId", {
      length: MODEL_PRICE_HISTORY_FIELD_LENGTHS.MODEL_ID,
    }).notNull(),
    /**
     * Precio base en el momento del cambio
     */
    basePrice: decimal("basePrice", {
      precision: MODEL_PRICE_HISTORY_DECIMAL_PRECISION.BASE_PRICE.precision,
      scale: MODEL_PRICE_HISTORY_DECIMAL_PRECISION.BASE_PRICE.scale,
    }).notNull(),
    /**
     * Costo por mm de ancho en el momento del cambio
     */
    costPerMmWidth: decimal("costPerMmWidth", {
      precision:
        MODEL_PRICE_HISTORY_DECIMAL_PRECISION.COST_PER_MM_WIDTH.precision,
      scale: MODEL_PRICE_HISTORY_DECIMAL_PRECISION.COST_PER_MM_WIDTH.scale,
    }).notNull(),
    /**
     * Costo por mm de alto en el momento del cambio
     */
    costPerMmHeight: decimal("costPerMmHeight", {
      precision:
        MODEL_PRICE_HISTORY_DECIMAL_PRECISION.COST_PER_MM_HEIGHT.precision,
      scale: MODEL_PRICE_HISTORY_DECIMAL_PRECISION.COST_PER_MM_HEIGHT.scale,
    }).notNull(),
    /**
     * Razón del cambio: 'aumento_material', 'ajuste_mercado', 'promocion', etc.
     */
    reason: text("reason"),
    /**
     * Fecha desde la cual este precio es efectivo
     */
    effectiveFrom: timestamp("effectiveFrom", { mode: "date" }).notNull(),
    /**
     * Usuario que realizó el cambio
     */
    createdBy: varchar("createdBy", {
      length: MODEL_PRICE_HISTORY_FIELD_LENGTHS.CREATED_BY,
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    // Foreign key to models table (cascade delete)
    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "ModelPriceHistory_modelId_fkey",
    }).onDelete("cascade"),
    // Foreign key to users table (set null on delete)
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "ModelPriceHistory_createdBy_fkey",
    }).onDelete("set null"),
    // Indexes
    index("ModelPriceHistory_modelId_effectiveFrom_idx").on(
      table.modelId,
      table.effectiveFrom
    ),
  ]
);

/**
 * Zod schemas for ModelPriceHistory validation
 */
export const modelPriceHistorySelectSchema = createSelectSchema(
  modelPriceHistories,
  {
    modelId: z.string().uuid(),
    basePrice: z.number().nonnegative(),
    costPerMmWidth: z.number().nonnegative(),
    costPerMmHeight: z.number().nonnegative(),
    reason: z.string().optional(),
    effectiveFrom: z.date(),
    createdBy: z.string().uuid().nullable(),
  }
);

export const modelPriceHistoryInsertSchema = createInsertSchema(
  modelPriceHistories,
  {
    id: z.uuid().optional(),
    modelId: z.string().uuid(),
    basePrice: z.number().nonnegative(),
    costPerMmWidth: z.number().nonnegative(),
    costPerMmHeight: z.number().nonnegative(),
    reason: z.string().optional(),
    effectiveFrom: z.date(),
    createdBy: z.string().uuid().optional(),
  }
).omit({ createdAt: true });

export const modelPriceHistoryUpdateSchema = createUpdateSchema(
  modelPriceHistories,
  {
    modelId: z.string().uuid(),
    basePrice: z.number().nonnegative(),
    costPerMmWidth: z.number().nonnegative(),
    costPerMmHeight: z.number().nonnegative(),
    reason: z.string(),
    effectiveFrom: z.date(),
    createdBy: z.string().uuid(),
  }
)
  .partial()
  .omit({ id: true, createdAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type ModelPriceHistory = typeof modelPriceHistories.$inferSelect;
export type NewModelPriceHistory = typeof modelPriceHistories.$inferInsert;
