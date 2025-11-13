import {
  decimal,
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
  SERVICE_DECIMAL_PRECISION,
  SERVICE_FIELD_LENGTHS,
} from "./constants/service.constants";
import {
  SERVICE_TYPE_VALUES,
  SERVICE_UNIT_VALUES,
  serviceTypeEnum,
  serviceUnitEnum,
} from "./enums.schema";

export const services = pgTable(
  "Service",
  {
    id: varchar("id", { length: SERVICE_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: SERVICE_FIELD_LENGTHS.NAME }).notNull(),
    type: serviceTypeEnum("type").notNull(),
    unit: serviceUnitEnum("unit").notNull(),
    rate: decimal("rate", {
      precision: SERVICE_DECIMAL_PRECISION.RATE.precision,
      scale: SERVICE_DECIMAL_PRECISION.RATE.scale,
    }).notNull(),
    minimumBillingUnit: decimal("minimumBillingUnit", {
      precision: SERVICE_DECIMAL_PRECISION.MINIMUM_BILLING_UNIT.precision,
      scale: SERVICE_DECIMAL_PRECISION.MINIMUM_BILLING_UNIT.scale,
    }),
    isActive: text("isActive")
      .notNull()
      .$defaultFn(() => "true"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [index("Service_isActive_idx").on(table.isActive)]
);

export const serviceSelectSchema = createSelectSchema(services, {
  name: z.string().max(SERVICE_FIELD_LENGTHS.NAME).min(1),
  type: z.enum(SERVICE_TYPE_VALUES),
  unit: z.enum(SERVICE_UNIT_VALUES),
  rate: z.string(),
  minimumBillingUnit: z.string().optional(),
  isActive: z.enum(["true", "false"]),
});

export const serviceInsertSchema = createInsertSchema(services, {
  id: z.uuid().optional(),
  name: z.string().max(SERVICE_FIELD_LENGTHS.NAME).min(1),
  type: z.enum(SERVICE_TYPE_VALUES),
  unit: z.enum(SERVICE_UNIT_VALUES),
  rate: z.string(),
  minimumBillingUnit: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
}).omit({ createdAt: true, updatedAt: true });

export const serviceUpdateSchema = createUpdateSchema(services, {
  name: z.string().max(SERVICE_FIELD_LENGTHS.NAME).min(1),
  type: z.enum(SERVICE_TYPE_VALUES),
  unit: z.enum(SERVICE_UNIT_VALUES),
  rate: z.string(),
  minimumBillingUnit: z.string().optional(),
  isActive: z.enum(["true", "false"]),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
