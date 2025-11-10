import {
  boolean,
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
import { GLASS_TYPE_SOLUTION_FIELD_LENGTHS } from "./constants/glass-type-solution.constants";
import {
  PERFORMANCE_RATING_VALUES,
  performanceRatingEnum,
} from "./enums.schema";
import { glassSolutions } from "./glass-solution.schema";
import { glassTypes } from "./glass-type.schema";

export const glassTypeSolutions = pgTable(
  "GlassTypeSolution",
  {
    id: varchar("id", { length: GLASS_TYPE_SOLUTION_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    glassTypeId: varchar("glassTypeId", {
      length: GLASS_TYPE_SOLUTION_FIELD_LENGTHS.GLASS_TYPE_ID,
    }).notNull(),
    solutionId: varchar("solutionId", {
      length: GLASS_TYPE_SOLUTION_FIELD_LENGTHS.SOLUTION_ID,
    }).notNull(),
    /**
     * Calificación de rendimiento para esta solución (1-5)
     */
    performanceRating: performanceRatingEnum("performanceRating").notNull(),
    /**
     * Indica si esta es la solución principal del vidrio
     */
    isPrimary: boolean("isPrimary")
      .notNull()
      .$defaultFn(() => false),
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
      name: "GlassTypeSolution_glassTypeId_fkey",
    }).onDelete("cascade"),
    // Foreign key to glassSolutions table (cascade delete)
    foreignKey({
      columns: [table.solutionId],
      foreignColumns: [glassSolutions.id],
      name: "GlassTypeSolution_solutionId_fkey",
    }).onDelete("cascade"),
    // Unique constraint: one rating per solution per glass type
    unique("GlassTypeSolution_glassTypeId_solutionId_key").on(
      table.glassTypeId,
      table.solutionId
    ),
    // Indexes
    index("GlassTypeSolution_glassTypeId_idx").on(table.glassTypeId),
    index("GlassTypeSolution_solutionId_idx").on(table.solutionId),
  ]
);

/**
 * Zod schemas for GlassTypeSolution validation
 */
export const glassTypeSolutionSelectSchema = createSelectSchema(
  glassTypeSolutions,
  {
    glassTypeId: z.string().uuid(),
    solutionId: z.string().uuid(),
    performanceRating: z.enum(PERFORMANCE_RATING_VALUES),
    isPrimary: z.boolean(),
  }
);

export const glassTypeSolutionInsertSchema = createInsertSchema(
  glassTypeSolutions,
  {
    id: z.uuid().optional(),
    glassTypeId: z.string().uuid(),
    solutionId: z.string().uuid(),
    performanceRating: z.enum(PERFORMANCE_RATING_VALUES),
    isPrimary: z.boolean().optional(),
  }
).omit({ createdAt: true, updatedAt: true });

export const glassTypeSolutionUpdateSchema = createUpdateSchema(
  glassTypeSolutions,
  {
    glassTypeId: z.string().uuid(),
    solutionId: z.string().uuid(),
    performanceRating: z.enum(PERFORMANCE_RATING_VALUES),
    isPrimary: z.boolean(),
  }
)
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type GlassTypeSolution = typeof glassTypeSolutions.$inferSelect;
export type NewGlassTypeSolution = typeof glassTypeSolutions.$inferInsert;
