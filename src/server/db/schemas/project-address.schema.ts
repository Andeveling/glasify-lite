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
  PROJECT_ADDRESS_CONSTRAINTS,
  PROJECT_ADDRESS_DECIMAL_PRECISION,
  PROJECT_ADDRESS_FIELD_LENGTHS,
} from "./constants/project-address.constants";
import { quotes } from "./quote.schema";

export const projectAddresses = pgTable(
  "ProjectAddress",
  {
    id: varchar("id", { length: PROJECT_ADDRESS_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /**
     * Foreign key to Quote (optional for backward compatibility)
     */
    quoteId: varchar("quoteId", {
      length: PROJECT_ADDRESS_FIELD_LENGTHS.QUOTE_ID,
    }).unique(),
    /**
     * User-defined label (e.g., "Obra Principal", "Bodega Cliente")
     */
    label: varchar("label", { length: PROJECT_ADDRESS_FIELD_LENGTHS.LABEL }),
    /**
     * Country name (e.g., "Colombia")
     */
    country: varchar("country", {
      length: PROJECT_ADDRESS_FIELD_LENGTHS.COUNTRY,
    }),
    /**
     * Department/State (e.g., "Antioquia")
     */
    region: varchar("region", { length: PROJECT_ADDRESS_FIELD_LENGTHS.REGION }),
    /**
     * City/Municipality (e.g., "Medellín")
     */
    city: varchar("city", { length: PROJECT_ADDRESS_FIELD_LENGTHS.CITY }),
    /**
     * Neighborhood/District (e.g., "Barrio Granada")
     */
    district: varchar("district", {
      length: PROJECT_ADDRESS_FIELD_LENGTHS.DISTRICT,
    }),
    /**
     * Street address (e.g., "Calle 45 #23-10")
     */
    street: varchar("street", { length: PROJECT_ADDRESS_FIELD_LENGTHS.STREET }),
    /**
     * Landmark/reference (e.g., "Frente a finca Los Arrayanes")
     */
    reference: varchar("reference", {
      length: PROJECT_ADDRESS_FIELD_LENGTHS.REFERENCE,
    }),
    /**
     * Latitude coordinate (WGS84, -90 to +90, 7 decimal places)
     */
    latitude: decimal("latitude", {
      precision: PROJECT_ADDRESS_DECIMAL_PRECISION.LATITUDE.precision,
      scale: PROJECT_ADDRESS_DECIMAL_PRECISION.LATITUDE.scale,
    }),
    /**
     * Longitude coordinate (WGS84, -180 to +180, 7 decimal places)
     */
    longitude: decimal("longitude", {
      precision: PROJECT_ADDRESS_DECIMAL_PRECISION.LONGITUDE.precision,
      scale: PROJECT_ADDRESS_DECIMAL_PRECISION.LONGITUDE.scale,
    }),
    /**
     * Postal/ZIP code (optional for LATAM rural areas)
     */
    postalCode: varchar("postalCode", {
      length: PROJECT_ADDRESS_FIELD_LENGTHS.POSTAL_CODE,
    }),
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
      name: "ProjectAddress_quoteId_fkey",
    }).onDelete("cascade"),
    // Indexes for common queries
    index("ProjectAddress_quoteId_idx").on(table.quoteId), // FK lookup (most common query)
    index("ProjectAddress_city_idx").on(table.city), // Search/filter by city
    index("ProjectAddress_latitude_longitude_idx").on(
      table.latitude,
      table.longitude
    ), // Geospatial queries (future: radius search)
  ]
);

/**
 * Zod schemas for ProjectAddress validation
 */
export const projectAddressSelectSchema = createSelectSchema(projectAddresses, {
  quoteId: z.string().cuid().optional(),
  label: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.LABEL).optional(),
  country: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.COUNTRY).optional(),
  region: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.REGION).optional(),
  city: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.CITY).optional(),
  district: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.DISTRICT).optional(),
  street: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.STREET).optional(),
  reference: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.REFERENCE).optional(),
  latitude: z
    .number()
    .min(PROJECT_ADDRESS_CONSTRAINTS.LATITUDE_MIN)
    .max(PROJECT_ADDRESS_CONSTRAINTS.LATITUDE_MAX)
    .optional(),
  longitude: z
    .number()
    .min(PROJECT_ADDRESS_CONSTRAINTS.LONGITUDE_MIN)
    .max(PROJECT_ADDRESS_CONSTRAINTS.LONGITUDE_MAX)
    .optional(),
  postalCode: z
    .string()
    .max(PROJECT_ADDRESS_FIELD_LENGTHS.POSTAL_CODE)
    .optional(),
});

export const projectAddressInsertSchema = createInsertSchema(projectAddresses, {
  id: z.cuid().optional(),
  quoteId: z.string().cuid().optional(),
  label: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.LABEL).optional(),
  country: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.COUNTRY).optional(),
  region: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.REGION).optional(),
  city: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.CITY).optional(),
  district: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.DISTRICT).optional(),
  street: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.STREET).optional(),
  reference: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.REFERENCE).optional(),
  latitude: z
    .number()
    .min(PROJECT_ADDRESS_CONSTRAINTS.LATITUDE_MIN)
    .max(PROJECT_ADDRESS_CONSTRAINTS.LATITUDE_MAX)
    .optional(),
  longitude: z
    .number()
    .min(PROJECT_ADDRESS_CONSTRAINTS.LONGITUDE_MIN)
    .max(PROJECT_ADDRESS_CONSTRAINTS.LONGITUDE_MAX)
    .optional(),
  postalCode: z
    .string()
    .max(PROJECT_ADDRESS_FIELD_LENGTHS.POSTAL_CODE)
    .optional(),
}).omit({ createdAt: true, updatedAt: true });

export const projectAddressUpdateSchema = createUpdateSchema(projectAddresses, {
  quoteId: z.string().cuid(),
  label: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.LABEL),
  country: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.COUNTRY),
  region: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.REGION),
  city: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.CITY),
  district: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.DISTRICT),
  street: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.STREET),
  reference: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.REFERENCE),
  latitude: z
    .number()
    .min(PROJECT_ADDRESS_CONSTRAINTS.LATITUDE_MIN)
    .max(PROJECT_ADDRESS_CONSTRAINTS.LATITUDE_MAX),
  longitude: z
    .number()
    .min(PROJECT_ADDRESS_CONSTRAINTS.LONGITUDE_MIN)
    .max(PROJECT_ADDRESS_CONSTRAINTS.LONGITUDE_MAX),
  postalCode: z.string().max(PROJECT_ADDRESS_FIELD_LENGTHS.POSTAL_CODE),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type ProjectAddress = typeof projectAddresses.$inferSelect;
export type NewProjectAddress = typeof projectAddresses.$inferInsert;
