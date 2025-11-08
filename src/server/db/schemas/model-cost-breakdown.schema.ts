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
  MODEL_COST_BREAKDOWN_DECIMAL_PRECISION,
  MODEL_COST_BREAKDOWN_FIELD_LENGTHS,
} from "./constants/model-cost-breakdown.constants";
import { COST_TYPE_VALUES, costTypeEnum } from "./enums.schema";
import { models } from "./model.schema";

export const modelCostBreakdowns = pgTable(
  "ModelCostBreakdown",
  {
    id: varchar("id", { length: MODEL_COST_BREAKDOWN_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    modelId: varchar("modelId", {
      length: MODEL_COST_BREAKDOWN_FIELD_LENGTHS.MODEL_ID,
    }).notNull(),
    /**
     * Nombre del componente: 'perfil_vertical', 'perfil_horizontal', 'esquineros', 'herrajes', 'mano_obra', etc.
     */
    component: varchar("component", {
      length: MODEL_COST_BREAKDOWN_FIELD_LENGTHS.COMPONENT,
    }).notNull(),
    /**
     * Tipo de costo: fixed, per_mm_width, per_mm_height, per_sqm
     */
    costType: costTypeEnum("costType").notNull(),
    /**
     * Costo unitario del componente (en la moneda del fabricante)
     */
    unitCost: decimal("unitCost", {
      precision: MODEL_COST_BREAKDOWN_DECIMAL_PRECISION.UNIT_COST.precision,
      scale: MODEL_COST_BREAKDOWN_DECIMAL_PRECISION.UNIT_COST.scale,
    }).notNull(),
    /**
     * Notas adicionales sobre este componente
     */
    notes: text("notes"),
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
      name: "ModelCostBreakdown_modelId_fkey",
    }).onDelete("cascade"),
    // Indexes
    index("ModelCostBreakdown_modelId_idx").on(table.modelId),
    index("ModelCostBreakdown_modelId_costType_idx").on(
      table.modelId,
      table.costType
    ),
  ]
);

/**
 * Zod schemas for ModelCostBreakdown validation
 */
export const modelCostBreakdownSelectSchema = createSelectSchema(
  modelCostBreakdowns,
  {
    modelId: z.string().cuid(),
    component: z
      .string()
      .max(MODEL_COST_BREAKDOWN_FIELD_LENGTHS.COMPONENT)
      .min(1),
    costType: z.enum(COST_TYPE_VALUES),
    unitCost: z.number().nonnegative(),
    notes: z.string().max(MODEL_COST_BREAKDOWN_FIELD_LENGTHS.NOTES).optional(),
  }
);

export const modelCostBreakdownInsertSchema = createInsertSchema(
  modelCostBreakdowns,
  {
    id: z.cuid().optional(),
    modelId: z.string().cuid(),
    component: z
      .string()
      .max(MODEL_COST_BREAKDOWN_FIELD_LENGTHS.COMPONENT)
      .min(1),
    costType: z.enum(COST_TYPE_VALUES),
    unitCost: z.number().nonnegative(),
    notes: z.string().max(MODEL_COST_BREAKDOWN_FIELD_LENGTHS.NOTES).optional(),
  }
).omit({ createdAt: true, updatedAt: true });

export const modelCostBreakdownUpdateSchema = createUpdateSchema(
  modelCostBreakdowns,
  {
    modelId: z.string().cuid(),
    component: z
      .string()
      .max(MODEL_COST_BREAKDOWN_FIELD_LENGTHS.COMPONENT)
      .min(1),
    costType: z.enum(COST_TYPE_VALUES),
    unitCost: z.number().nonnegative(),
    notes: z.string().max(MODEL_COST_BREAKDOWN_FIELD_LENGTHS.NOTES),
  }
)
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type ModelCostBreakdown = typeof modelCostBreakdowns.$inferSelect;
export type NewModelCostBreakdown = typeof modelCostBreakdowns.$inferInsert;
