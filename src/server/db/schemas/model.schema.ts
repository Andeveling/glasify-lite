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
import { FIELD_LENGTHS } from "./constants/constants";
import { MODEL_STATUS_VALUES, modelStatusEnum } from "./enums.schema";
import { profileSuppliers } from "./profile-supplier.schema";

export const models = pgTable(
  "Model",
  {
    id: varchar("id", { length: FIELD_LENGTHS.MODEL.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileSupplierId: varchar("profileSupplierId", {
      length: FIELD_LENGTHS.PROFILE_SUPPLIER.ID,
    }),
    name: varchar("name", { length: FIELD_LENGTHS.MODEL.NAME }).notNull(),
    imageUrl: varchar("imageUrl", { length: FIELD_LENGTHS.MODEL.IMAGE_URL })
      .notNull()
      .$defaultFn(() => ""),
    status: modelStatusEnum("status")
      .notNull()
      .$defaultFn(() => "draft"),
    minWidthMm: text("minWidthMm").notNull(),
    maxWidthMm: text("maxWidthMm").notNull(),
    minHeightMm: text("minHeightMm").notNull(),
    maxHeightMm: text("maxHeightMm").notNull(),
    basePrice: decimal("basePrice", { precision: 12, scale: 4 }).notNull(),
    costPerMmWidth: decimal("costPerMmWidth", {
      precision: 12,
      scale: 4,
    }).notNull(),
    costPerMmHeight: decimal("costPerMmHeight", {
      precision: 12,
      scale: 4,
    }).notNull(),
    accessoryPrice: decimal("accessoryPrice", { precision: 12, scale: 4 }),
    glassDiscountWidthMm: text("glassDiscountWidthMm")
      .notNull()
      .$defaultFn(() => "0"),
    glassDiscountHeightMm: text("glassDiscountHeightMm")
      .notNull()
      .$defaultFn(() => "0"),
    compatibleGlassTypeIds: text("compatibleGlassTypeIds")
      .array()
      .notNull()
      .$defaultFn(() => []),
    profitMarginPercentage: decimal("profitMarginPercentage", {
      precision: 5,
      scale: 2,
    }),
    lastCostReviewDate: timestamp("lastCostReviewDate", { mode: "date" }),
    costNotes: varchar("costNotes", { length: FIELD_LENGTHS.MODEL.COST_NOTES }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.profileSupplierId],
      foreignColumns: [profileSuppliers.id],
      name: "Model_profileSupplierId_fkey",
    }).onDelete("set null"),
    index("Model_profileSupplierId_status_idx").on(
      table.profileSupplierId,
      table.status
    ),
    index("Model_name_idx").on(table.name),
    index("Model_status_idx").on(table.status),
    index("Model_createdAt_idx").on(table.createdAt),
    index("Model_updatedAt_idx").on(table.updatedAt),
  ]
);

export const modelSelectSchema = createSelectSchema(models, {
  name: z.string().max(FIELD_LENGTHS.MODEL.NAME).min(1),
  imageUrl: z.string().url().max(FIELD_LENGTHS.MODEL.IMAGE_URL),
  status: z.enum(MODEL_STATUS_VALUES),
  minWidthMm: z.number().int().positive(),
  maxWidthMm: z.number().int().positive(),
  minHeightMm: z.number().int().positive(),
  maxHeightMm: z.number().int().positive(),
  basePrice: z.number().nonnegative(),
  costPerMmWidth: z.number().nonnegative(),
  costPerMmHeight: z.number().nonnegative(),
  accessoryPrice: z.number().nonnegative().optional(),
  glassDiscountWidthMm: z.number().int().nonnegative(),
  glassDiscountHeightMm: z.number().int().nonnegative(),
  compatibleGlassTypeIds: z.array(z.string().cuid()),
  profitMarginPercentage: z.number().nonnegative().optional(),
  costNotes: z.string().max(FIELD_LENGTHS.MODEL.COST_NOTES).optional(),
  profileSupplierId: z.string().cuid().optional(),
});

export const modelInsertSchema = createInsertSchema(models, {
  id: z.cuid().optional(),
  name: z.string().max(FIELD_LENGTHS.MODEL.NAME).min(1),
  imageUrl: z.string().url().max(FIELD_LENGTHS.MODEL.IMAGE_URL).optional(),
  status: z.enum(MODEL_STATUS_VALUES).optional(),
  minWidthMm: z.number().int().positive(),
  maxWidthMm: z.number().int().positive(),
  minHeightMm: z.number().int().positive(),
  maxHeightMm: z.number().int().positive(),
  basePrice: z.number().nonnegative(),
  costPerMmWidth: z.number().nonnegative(),
  costPerMmHeight: z.number().nonnegative(),
  accessoryPrice: z.number().nonnegative().optional(),
  glassDiscountWidthMm: z.number().int().nonnegative().optional(),
  glassDiscountHeightMm: z.number().int().nonnegative().optional(),
  compatibleGlassTypeIds: z.array(z.string().cuid()).optional(),
  profitMarginPercentage: z.number().nonnegative().optional(),
  lastCostReviewDate: z.date().optional(),
  costNotes: z.string().max(FIELD_LENGTHS.MODEL.COST_NOTES).optional(),
  profileSupplierId: z.string().cuid().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const modelUpdateSchema = createUpdateSchema(models, {
  name: z.string().max(FIELD_LENGTHS.MODEL.NAME).min(1),
  imageUrl: z.string().url().max(FIELD_LENGTHS.MODEL.IMAGE_URL),
  status: z.enum(MODEL_STATUS_VALUES),
  minWidthMm: z.number().int().positive(),
  maxWidthMm: z.number().int().positive(),
  minHeightMm: z.number().int().positive(),
  maxHeightMm: z.number().int().positive(),
  basePrice: z.number().nonnegative(),
  costPerMmWidth: z.number().nonnegative(),
  costPerMmHeight: z.number().nonnegative(),
  accessoryPrice: z.number().nonnegative().optional(),
  glassDiscountWidthMm: z.number().int().nonnegative(),
  glassDiscountHeightMm: z.number().int().nonnegative(),
  compatibleGlassTypeIds: z.array(z.string().cuid()),
  profitMarginPercentage: z.number().nonnegative().optional(),
  lastCostReviewDate: z.date().optional(),
  costNotes: z.string().max(FIELD_LENGTHS.MODEL.COST_NOTES).optional(),
  profileSupplierId: z.string().cuid().optional(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
