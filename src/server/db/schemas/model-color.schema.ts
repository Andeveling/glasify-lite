import {
  boolean,
  decimal,
  foreignKey,
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
import { colors } from "./color.schema";
import {
  MODEL_COLOR_DECIMAL_PRECISION,
  MODEL_COLOR_FIELD_LENGTHS,
} from "./constants/model-color.constants";
import { models } from "./model.schema";

export const modelColors = pgTable(
  "ModelColor",
  {
    id: varchar("id", { length: MODEL_COLOR_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    modelId: varchar("modelId", {
      length: MODEL_COLOR_FIELD_LENGTHS.MODEL_ID,
    }).notNull(),
    colorId: varchar("colorId", {
      length: MODEL_COLOR_FIELD_LENGTHS.COLOR_ID,
    }).notNull(),
    /**
     * Percentage surcharge added to model base price (0.00-100.00)
     */
    surchargePercentage: decimal("surchargePercentage", {
      precision: MODEL_COLOR_DECIMAL_PRECISION.SURCHARGE_PERCENTAGE.precision,
      scale: MODEL_COLOR_DECIMAL_PRECISION.SURCHARGE_PERCENTAGE.scale,
    }).notNull(),
    /**
     * One color per model must be default (auto-selected if client doesn't choose)
     */
    isDefault: boolean("isDefault")
      .notNull()
      .$defaultFn(() => false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    // Foreign key to models table (cascade delete)
    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "ModelColor_modelId_fkey",
    }).onDelete("cascade"),
    // Foreign key to colors table (restrict delete)
    foreignKey({
      columns: [table.colorId],
      foreignColumns: [colors.id],
      name: "ModelColor_colorId_fkey",
    }).onDelete("restrict"),
    // Unique constraint: prevent duplicate color assignments per model
    unique("ModelColor_modelId_colorId_key").on(table.modelId, table.colorId),
    // Indexes
    index("ModelColor_modelId_isDefault_idx").on(
      table.modelId,
      table.isDefault
    ),
  ]
);

/**
 * Zod schemas for ModelColor validation
 */
export const modelColorSelectSchema = createSelectSchema(modelColors, {
  modelId: z.string().uuid(),
  colorId: z.string().uuid(),
  surchargePercentage: z.number().nonnegative(),
  isDefault: z.boolean(),
});

export const modelColorInsertSchema = createInsertSchema(modelColors, {
  id: z.uuid().optional(),
  modelId: z.string().uuid(),
  colorId: z.string().uuid(),
  surchargePercentage: z.number().nonnegative(),
  isDefault: z.boolean().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const modelColorUpdateSchema = createUpdateSchema(modelColors, {
  modelId: z.string().uuid(),
  colorId: z.string().uuid(),
  surchargePercentage: z.number().nonnegative(),
  isDefault: z.boolean(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type ModelColor = typeof modelColors.$inferSelect;
export type NewModelColor = typeof modelColors.$inferInsert;
