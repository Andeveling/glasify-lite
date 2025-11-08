import {
  boolean,
  index,
  integer,
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
import { GLASS_SOLUTION_FIELD_LENGTHS } from "./constants/glass-solution.constants";

export const glassSolutions = pgTable(
  "GlassSolution",
  {
    id: varchar("id", { length: GLASS_SOLUTION_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /**
     * Clave única para identificar la solución (ej: 'security', 'thermal_insulation')
     */
    key: varchar("key", { length: GLASS_SOLUTION_FIELD_LENGTHS.KEY })
      .notNull()
      .unique(),
    /**
     * URL-friendly slug para rutas dinámicas (ej: 'solar-control', 'energy-efficiency')
     * Derivado de `key` reemplazando guiones bajos con guiones (kebab-case)
     */
    slug: varchar("slug", { length: GLASS_SOLUTION_FIELD_LENGTHS.SLUG })
      .notNull()
      .unique(),
    /**
     * Nombre técnico en inglés
     */
    name: varchar("name", {
      length: GLASS_SOLUTION_FIELD_LENGTHS.NAME,
    }).notNull(),
    /**
     * Nombre comercial en español
     */
    nameEs: varchar("nameEs", {
      length: GLASS_SOLUTION_FIELD_LENGTHS.NAME_ES,
    }).notNull(),
    /**
     * Descripción de la solución
     */
    description: text("description"),
    /**
     * Icono de Lucide React (ej: 'Shield', 'Snowflake')
     */
    icon: varchar("icon", { length: GLASS_SOLUTION_FIELD_LENGTHS.ICON }),
    /**
     * Orden de visualización (menor = más arriba)
     */
    sortOrder: integer("sortOrder")
      .notNull()
      .$defaultFn(() => 0),
    /**
     * Si la solución está activa para mostrarse a usuarios
     */
    isActive: boolean("isActive")
      .notNull()
      .$defaultFn(() => true),
    /**
     * Flag for seed-generated solutions (true) vs custom solutions (false)
     */
    isSeeded: boolean("isSeeded")
      .notNull()
      .$defaultFn(() => false),
    /**
     * Seed data version (e.g., "1.0", "1.1") for idempotent updates
     */
    seedVersion: varchar("seedVersion", {
      length: GLASS_SOLUTION_FIELD_LENGTHS.SEED_VERSION,
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("GlassSolution_sortOrder_idx").on(table.sortOrder),
    index("GlassSolution_isActive_idx").on(table.isActive),
    index("GlassSolution_isSeeded_idx").on(table.isSeeded),
    index("GlassSolution_slug_idx").on(table.slug),
  ]
);

/**
 * Zod schemas for GlassSolution validation
 */
export const glassSolutionSelectSchema = createSelectSchema(glassSolutions, {
  key: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.KEY).min(1),
  slug: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.SLUG).min(1),
  name: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.NAME).min(1),
  nameEs: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.NAME_ES).min(1),
  description: z
    .string()
    .max(GLASS_SOLUTION_FIELD_LENGTHS.DESCRIPTION)
    .optional(),
  icon: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.ICON).optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isSeeded: z.boolean(),
  seedVersion: z
    .string()
    .max(GLASS_SOLUTION_FIELD_LENGTHS.SEED_VERSION)
    .optional(),
});

export const glassSolutionInsertSchema = createInsertSchema(glassSolutions, {
  id: z.cuid().optional(),
  key: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.KEY).min(1),
  slug: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.SLUG).min(1),
  name: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.NAME).min(1),
  nameEs: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.NAME_ES).min(1),
  description: z
    .string()
    .max(GLASS_SOLUTION_FIELD_LENGTHS.DESCRIPTION)
    .optional(),
  icon: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.ICON).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isSeeded: z.boolean().optional(),
  seedVersion: z
    .string()
    .max(GLASS_SOLUTION_FIELD_LENGTHS.SEED_VERSION)
    .optional(),
}).omit({ createdAt: true, updatedAt: true });

export const glassSolutionUpdateSchema = createUpdateSchema(glassSolutions, {
  key: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.KEY).min(1),
  slug: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.SLUG).min(1),
  name: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.NAME).min(1),
  nameEs: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.NAME_ES).min(1),
  description: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.DESCRIPTION),
  icon: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.ICON),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isSeeded: z.boolean(),
  seedVersion: z.string().max(GLASS_SOLUTION_FIELD_LENGTHS.SEED_VERSION),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type GlassSolution = typeof glassSolutions.$inferSelect;
export type NewGlassSolution = typeof glassSolutions.$inferInsert;
