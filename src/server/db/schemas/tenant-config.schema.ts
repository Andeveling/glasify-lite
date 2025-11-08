import { decimal, index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import {
  FIELD_LENGTHS,
  GEO_CONSTRAINTS,
  ISO_CONSTRAINTS,
} from "./constants/constants";

export const tenantConfigs = pgTable(
  "TenantConfig",
  {
    // Singleton pattern: fixed ID = "1"
    id: varchar("id", { length: 1 })
      .primaryKey()
      .$defaultFn(() => "1"),

    // Business information
    businessName: varchar("businessName", {
      length: FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_NAME,
    }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(), // ISO 4217 currency code
    quoteValidityDays: text("quoteValidityDays")
      .notNull()
      .$defaultFn(() => "15"),
    locale: varchar("locale", {
      length: FIELD_LENGTHS.TENANT_CONFIG.LOCALE,
    })
      .notNull()
      .$defaultFn(() => "es-CO"),
    timezone: varchar("timezone", {
      length: FIELD_LENGTHS.TENANT_CONFIG.TIMEZONE,
    })
      .notNull()
      .$defaultFn(() => "America/Bogota"),

    // Contact information
    contactEmail: varchar("contactEmail", {
      length: FIELD_LENGTHS.TENANT_CONFIG.CONTACT_EMAIL,
    }),
    contactPhone: varchar("contactPhone", {
      length: FIELD_LENGTHS.TENANT_CONFIG.CONTACT_PHONE,
    }),
    businessAddress: varchar("businessAddress", {
      length: FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_ADDRESS,
    }),

    // Branding
    logoUrl: varchar("logoUrl", {
      length: FIELD_LENGTHS.TENANT_CONFIG.LOGO_URL,
    }),
    primaryColor: varchar("primaryColor", { length: 7 })
      .notNull()
      .$defaultFn(() => "#3B82F6"), // Hex color format
    secondaryColor: varchar("secondaryColor", { length: 7 })
      .notNull()
      .$defaultFn(() => "#1E40AF"),

    // Social Media
    facebookUrl: varchar("facebookUrl", {
      length: FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL,
    }),
    instagramUrl: varchar("instagramUrl", {
      length: FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL,
    }),
    linkedinUrl: varchar("linkedinUrl", {
      length: FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL,
    }),

    // WhatsApp
    whatsappNumber: varchar("whatsappNumber", {
      length: FIELD_LENGTHS.TENANT_CONFIG.WHATSAPP_NUMBER,
    }),
    whatsappEnabled: text("whatsappEnabled")
      .notNull()
      .$defaultFn(() => "false"),

    // Warehouse location and transportation (001-delivery-address)
    warehouseLatitude: decimal("warehouseLatitude", {
      precision: 10,
      scale: 7,
    }),
    warehouseLongitude: decimal("warehouseLongitude", {
      precision: 10,
      scale: 7,
    }),
    warehouseCity: varchar("warehouseCity", {
      length: FIELD_LENGTHS.TENANT_CONFIG.WAREHOUSE_CITY,
    }),
    transportBaseRate: decimal("transportBaseRate", {
      precision: 10,
      scale: 2,
    }),
    transportPerKmRate: decimal("transportPerKmRate", {
      precision: 10,
      scale: 2,
    }),

    // Timestamps
    createdAt: text("createdAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updatedAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("TenantConfig_currency_idx").on(table.currency)]
);

export const tenantConfigSelectSchema = createSelectSchema(tenantConfigs, {
  businessName: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_NAME)
    .min(1),
  currency: z
    .string()
    .length(ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH)
    .regex(/^[A-Z]{3}$/),
  quoteValidityDays: z.number().int().positive(),
  locale: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.LOCALE)
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/), // IETF BCP 47 format
  timezone: z.string().max(FIELD_LENGTHS.TENANT_CONFIG.TIMEZONE),
  contactEmail: z
    .string()
    .email()
    .max(FIELD_LENGTHS.TENANT_CONFIG.CONTACT_EMAIL)
    .optional(),
  contactPhone: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.CONTACT_PHONE)
    .optional(),
  businessAddress: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_ADDRESS)
    .optional(),
  logoUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.LOGO_URL)
    .optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  facebookUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  instagramUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  linkedinUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+\d{1,15}$/)
    .max(FIELD_LENGTHS.TENANT_CONFIG.WHATSAPP_NUMBER)
    .optional(), // E.164 format
  whatsappEnabled: z.boolean(),
  warehouseLatitude: z
    .number()
    .min(GEO_CONSTRAINTS.LATITUDE.MIN)
    .max(GEO_CONSTRAINTS.LATITUDE.MAX)
    .optional(),
  warehouseLongitude: z
    .number()
    .min(GEO_CONSTRAINTS.LONGITUDE.MIN)
    .max(GEO_CONSTRAINTS.LONGITUDE.MAX)
    .optional(),
  warehouseCity: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.WAREHOUSE_CITY)
    .optional(),
  transportBaseRate: z.number().nonnegative().optional(),
  transportPerKmRate: z.number().nonnegative().optional(),
});

export const tenantConfigInsertSchema = createInsertSchema(tenantConfigs, {
  businessName: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_NAME)
    .min(1),
  currency: z
    .string()
    .length(ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH)
    .regex(/^[A-Z]{3}$/),
  quoteValidityDays: z.number().int().positive().optional(),
  locale: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.LOCALE)
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/)
    .optional(),
  timezone: z.string().max(FIELD_LENGTHS.TENANT_CONFIG.TIMEZONE).optional(),
  contactEmail: z
    .string()
    .email()
    .max(FIELD_LENGTHS.TENANT_CONFIG.CONTACT_EMAIL)
    .optional(),
  contactPhone: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.CONTACT_PHONE)
    .optional(),
  businessAddress: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_ADDRESS)
    .optional(),
  logoUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.LOGO_URL)
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  facebookUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  instagramUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  linkedinUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+\d{1,15}$/)
    .max(FIELD_LENGTHS.TENANT_CONFIG.WHATSAPP_NUMBER)
    .optional(),
  whatsappEnabled: z.boolean().optional(),
  warehouseLatitude: z
    .number()
    .min(GEO_CONSTRAINTS.LATITUDE.MIN)
    .max(GEO_CONSTRAINTS.LATITUDE.MAX)
    .optional(),
  warehouseLongitude: z
    .number()
    .min(GEO_CONSTRAINTS.LONGITUDE.MIN)
    .max(GEO_CONSTRAINTS.LONGITUDE.MAX)
    .optional(),
  warehouseCity: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.WAREHOUSE_CITY)
    .optional(),
  transportBaseRate: z.number().nonnegative().optional(),
  transportPerKmRate: z.number().nonnegative().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const tenantConfigUpdateSchema = createUpdateSchema(tenantConfigs, {
  businessName: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_NAME)
    .min(1),
  currency: z
    .string()
    .length(ISO_CONSTRAINTS.CURRENCY_CODE_LENGTH)
    .regex(/^[A-Z]{3}$/),
  quoteValidityDays: z.number().int().positive(),
  locale: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.LOCALE)
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/),
  timezone: z.string().max(FIELD_LENGTHS.TENANT_CONFIG.TIMEZONE),
  contactEmail: z
    .string()
    .email()
    .max(FIELD_LENGTHS.TENANT_CONFIG.CONTACT_EMAIL)
    .optional(),
  contactPhone: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.CONTACT_PHONE)
    .optional(),
  businessAddress: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.BUSINESS_ADDRESS)
    .optional(),
  logoUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.LOGO_URL)
    .optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  facebookUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  instagramUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  linkedinUrl: z
    .string()
    .url()
    .max(FIELD_LENGTHS.TENANT_CONFIG.SOCIAL_URL)
    .optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+\d{1,15}$/)
    .max(FIELD_LENGTHS.TENANT_CONFIG.WHATSAPP_NUMBER)
    .optional(),
  whatsappEnabled: z.boolean(),
  warehouseLatitude: z
    .number()
    .min(GEO_CONSTRAINTS.LATITUDE.MIN)
    .max(GEO_CONSTRAINTS.LATITUDE.MAX)
    .optional(),
  warehouseLongitude: z
    .number()
    .min(GEO_CONSTRAINTS.LONGITUDE.MIN)
    .max(GEO_CONSTRAINTS.LONGITUDE.MAX)
    .optional(),
  warehouseCity: z
    .string()
    .max(FIELD_LENGTHS.TENANT_CONFIG.WAREHOUSE_CITY)
    .optional(),
  transportBaseRate: z.number().nonnegative().optional(),
  transportPerKmRate: z.number().nonnegative().optional(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type TenantConfig = typeof tenantConfigs.$inferSelect;
export type NewTenantConfig = typeof tenantConfigs.$inferInsert;
