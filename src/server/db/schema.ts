import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  numeric,
  jsonb,
  uniqueIndex,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { cuid } from "@paralleldrive/cuid2";

// ==========================================
// ENUMS
// ==========================================

// Model status enum
export const modelStatusEnum = pgEnum("ModelStatus", ["draft", "published"]);

// Service type enum
export const serviceTypeEnum = pgEnum("ServiceType", [
  "area",
  "perimeter",
  "fixed",
]);

// Service unit enum
export const serviceUnitEnum = pgEnum("ServiceUnit", ["unit", "sqm", "ml"]);

// Quote lifecycle status enum
export const quoteStatusEnum = pgEnum("QuoteStatus", [
  "draft",
  "sent",
  "canceled",
]);

// Adjustment scope enum
export const adjustmentScopeEnum = pgEnum("AdjustmentScope", [
  "item",
  "quote",
]);

// Adjustment sign enum
export const adjustmentSignEnum = pgEnum("AdjustmentSign", [
  "positive",
  "negative",
]);

// Glass purpose enum (deprecated)
export const glassPurposeEnum = pgEnum("GlassPurpose", [
  "general",
  "insulation",
  "security",
  "decorative",
]);

// Performance rating enum
export const performanceRatingEnum = pgEnum("PerformanceRating", [
  "basic",
  "standard",
  "good",
  "very_good",
  "excellent",
]);

// Cost type enum
export const costTypeEnum = pgEnum("CostType", [
  "fixed",
  "per_mm_width",
  "per_mm_height",
  "per_sqm",
]);

// Material type enum
export const materialTypeEnum = pgEnum("MaterialType", [
  "PVC",
  "ALUMINUM",
  "WOOD",
  "MIXED",
]);

// User role enum
export const userRoleEnum = pgEnum("UserRole", ["admin", "seller", "user"]);

// ==========================================
// AUTH TABLES
// ==========================================

export const accounts = pgTable(
  "Account",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    accountId: varchar("providerAccountId", { length: 256 }).notNull(),
    providerId: varchar("provider", { length: 256 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("expires_at"),
    idToken: text("id_token"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    userId: varchar("userId", { length: 256 }).notNull(),
    refreshTokenExpiresAt: timestamp(),
    scope: varchar("scope", { length: 256 }),
    password: varchar("password", { length: 256 }),
  },
  (table) => ({
    uniqueProviderAccount: uniqueIndex("Account_provider_accountId_key").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const sessions = pgTable(
  "Session",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    expiresAt: timestamp("expires").notNull(),
    token: varchar("sessionToken", { length: 256 }).unique().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    userId: varchar("userId", { length: 256 }).notNull(),
    ipAddress: varchar("ipAddress", { length: 256 }),
    userAgent: text("userAgent"),
  },
  (table) => ({
    userIdIdx: index("Session_userId_idx").on(table.userId),
  })
);

export const users = pgTable(
  "User",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    name: varchar("name", { length: 256 }),
    email: varchar("email", { length: 256 }).unique(),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("User_role_idx").on(table.role),
    emailIdx: index("User_email_idx").on(table.email),
  })
);

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 256 }).notNull(),
    token: varchar("token", { length: 256 }).unique().notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    identifierTokenKey: uniqueIndex(
      "VerificationToken_identifier_token_key"
    ).on(table.identifier, table.token),
  })
);

export const verifications = pgTable(
  "Verification",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    identifier: varchar("identifier", { length: 256 }).notNull(),
    value: varchar("value", { length: 256 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    identifierValueKey: uniqueIndex("Verification_identifier_value_key").on(
      table.identifier,
      table.value
    ),
  })
);

// ==========================================
// TENANT & CONFIGURATION
// ==========================================

export const tenantConfigs = pgTable(
  "TenantConfig",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(() => "1"),
    businessName: varchar("businessName", { length: 256 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    quoteValidityDays: integer("quoteValidityDays").default(15).notNull(),
    locale: varchar("locale", { length: 20 }).default("es-CO").notNull(),
    timezone: varchar("timezone", { length: 50 })
      .default("America/Bogota")
      .notNull(),
    contactEmail: varchar("contactEmail", { length: 256 }),
    contactPhone: varchar("contactPhone", { length: 20 }),
    businessAddress: text("businessAddress"),
    logoUrl: text("logoUrl"),
    primaryColor: varchar("primaryColor", { length: 7 })
      .default("#3B82F6")
      .notNull(),
    secondaryColor: varchar("secondaryColor", { length: 7 })
      .default("#1E40AF")
      .notNull(),
    facebookUrl: text("facebookUrl"),
    instagramUrl: text("instagramUrl"),
    linkedinUrl: text("linkedinUrl"),
    whatsappNumber: varchar("whatsappNumber", { length: 20 }),
    whatsappEnabled: boolean("whatsappEnabled").default(false).notNull(),
    warehouseLatitude: decimal("warehouseLatitude", {
      precision: 10,
      scale: 7,
    }),
    warehouseLongitude: decimal("warehouseLongitude", {
      precision: 10,
      scale: 7,
    }),
    warehouseCity: varchar("warehouseCity", { length: 100 }),
    transportBaseRate: decimal("transportBaseRate", {
      precision: 10,
      scale: 2,
    }),
    transportPerKmRate: decimal("transportPerKmRate", {
      precision: 10,
      scale: 2,
    }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    currencyIdx: index("TenantConfig_currency_idx").on(table.currency),
  })
);

// ==========================================
// MANUFACTURERS & SUPPLIERS
// ==========================================

export const profileSuppliers = pgTable(
  "ProfileSupplier",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    name: varchar("name", { length: 256 }).unique().notNull(),
    materialType: materialTypeEnum("materialType").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("ProfileSupplier_isActive_idx").on(table.isActive),
    materialTypeIdx: index("ProfileSupplier_materialType_idx").on(
      table.materialType
    ),
  })
);

export const manufacturers = pgTable(
  "Manufacturer",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    name: varchar("name", { length: 256 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    quoteValidityDays: integer("quoteValidityDays").default(15).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    currencyIdx: index("Manufacturer_currency_idx").on(table.currency),
  })
);

export const glassSuppliers = pgTable(
  "GlassSupplier",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    tenantConfigId: varchar("tenantConfigId", { length: 256 }).default("1"),
    name: varchar("name", { length: 256 }).unique().notNull(),
    code: varchar("code", { length: 10 }).unique(),
    country: varchar("country", { length: 100 }),
    website: text("website"),
    contactEmail: varchar("contactEmail", { length: 256 }),
    contactPhone: varchar("contactPhone", { length: 20 }),
    isActive: boolean("isActive").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("GlassSupplier_isActive_idx").on(table.isActive),
    codeIdx: index("GlassSupplier_code_idx").on(table.code),
    tenantConfigIdIdx: index("GlassSupplier_tenantConfigId_idx").on(
      table.tenantConfigId
    ),
  })
);

// ==========================================
// MODELS & COLORS
// ==========================================

export const models = pgTable(
  "Model",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    profileSupplierId: varchar("profileSupplierId", { length: 256 }),
    name: varchar("name", { length: 256 }).notNull(),
    imageUrl: text("imageUrl").default(""),
    status: modelStatusEnum("status").default("draft").notNull(),
    minWidthMm: integer("minWidthMm").notNull(),
    maxWidthMm: integer("maxWidthMm").notNull(),
    minHeightMm: integer("minHeightMm").notNull(),
    maxHeightMm: integer("maxHeightMm").notNull(),
    basePrice: decimal("basePrice", { precision: 12, scale: 4 }).notNull(),
    costPerMmWidth: decimal("costPerMmWidth", {
      precision: 12,
      scale: 4,
    }).notNull(),
    costPerMmHeight: decimal("costPerMmHeight", {
      precision: 12,
      scale: 4,
    }).notNull(),
    accessoryPrice: decimal("accessoryPrice", {
      precision: 12,
      scale: 4,
    }),
    glassDiscountWidthMm: integer("glassDiscountWidthMm").default(0).notNull(),
    glassDiscountHeightMm: integer("glassDiscountHeightMm")
      .default(0)
      .notNull(),
    compatibleGlassTypeIds: text("compatibleGlassTypeIds")
      .array()
      .default(sql`ARRAY[]::text[]`),
    profitMarginPercentage: decimal("profitMarginPercentage", {
      precision: 5,
      scale: 2,
    }),
    lastCostReviewDate: timestamp("lastCostReviewDate"),
    costNotes: text("costNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    profileSupplierStatusIdx: index(
      "Model_profileSupplierId_status_idx"
    ).on(table.profileSupplierId, table.status),
    nameIdx: index("Model_name_idx").on(table.name),
    statusIdx: index("Model_status_idx").on(table.status),
    createdAtIdx: index("Model_createdAt_idx").on(table.createdAt),
    updatedAtIdx: index("Model_updatedAt_idx").on(table.updatedAt),
  })
);

export const colors = pgTable(
  "Color",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    name: varchar("name", { length: 50 }).notNull(),
    ralCode: varchar("ralCode", { length: 10 }),
    hexCode: varchar("hexCode", { length: 7 }).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    nameHexCodeKey: uniqueIndex("Color_name_hexCode_key").on(
      table.name,
      table.hexCode
    ),
    isActiveIdx: index("Color_isActive_idx").on(table.isActive),
    nameIdx: index("Color_name_idx").on(table.name),
  })
);

export const modelColors = pgTable(
  "ModelColor",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    modelId: varchar("modelId", { length: 256 }).notNull(),
    colorId: varchar("colorId", { length: 256 }).notNull(),
    surchargePercentage: decimal("surchargePercentage", {
      precision: 5,
      scale: 2,
    }).notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    modelColorKey: uniqueIndex("ModelColor_modelId_colorId_key").on(
      table.modelId,
      table.colorId
    ),
    modelIsDefaultIdx: index("ModelColor_modelId_isDefault_idx").on(
      table.modelId,
      table.isDefault
    ),
    colorIdIdx: index("ModelColor_colorId_idx").on(table.colorId),
  })
);

// ==========================================
// GLASS TYPES & SOLUTIONS
// ==========================================

export const glassTypes = pgTable(
  "GlassType",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    name: varchar("name", { length: 256 }).unique().notNull(),
    code: varchar("code", { length: 50 }).unique().notNull(),
    series: varchar("series", { length: 100 }),
    manufacturer: varchar("manufacturer", { length: 100 }),
    thicknessMm: integer("thicknessMm").notNull(),
    pricePerSqm: decimal("pricePerSqm", { precision: 12, scale: 4 }).notNull(),
    uValue: decimal("uValue", { precision: 5, scale: 2 }),
    description: text("description"),
    solarFactor: decimal("solarFactor", { precision: 4, scale: 2 }),
    lightTransmission: decimal("lightTransmission", {
      precision: 4,
      scale: 2,
    }),
    isActive: boolean("isActive").default(true).notNull(),
    lastReviewDate: timestamp("lastReviewDate"),
    isSeeded: boolean("isSeeded").default(false).notNull(),
    seedVersion: varchar("seedVersion", { length: 20 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("GlassType_name_idx").on(table.name),
    codeIdx: index("GlassType_code_idx").on(table.code),
    seriesIdx: index("GlassType_series_idx").on(table.series),
    manufacturerIdx: index("GlassType_manufacturer_idx").on(
      table.manufacturer
    ),
    isActiveIdx: index("GlassType_isActive_idx").on(table.isActive),
    isSeededIdx: index("GlassType_isSeeded_idx").on(table.isSeeded),
    thicknessMmIdx: index("GlassType_thicknessMm_idx").on(table.thicknessMm),
    pricePerSqmIdx: index("GlassType_pricePerSqm_idx").on(table.pricePerSqm),
    createdAtIdx: index("GlassType_createdAt_idx").on(table.createdAt),
    updatedAtIdx: index("GlassType_updatedAt_idx").on(table.updatedAt),
  })
);

export const glassSolutions = pgTable(
  "GlassSolution",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    key: varchar("key", { length: 100 }).unique().notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    nameEs: varchar("nameEs", { length: 256 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    isSeeded: boolean("isSeeded").default(false).notNull(),
    seedVersion: varchar("seedVersion", { length: 20 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    sortOrderIdx: index("GlassSolution_sortOrder_idx").on(table.sortOrder),
    isActiveIdx: index("GlassSolution_isActive_idx").on(table.isActive),
    isSeededIdx: index("GlassSolution_isSeeded_idx").on(table.isSeeded),
    slugIdx: index("GlassSolution_slug_idx").on(table.slug),
  })
);

export const glassTypeSolutions = pgTable(
  "GlassTypeSolution",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    glassTypeId: varchar("glassTypeId", { length: 256 }).notNull(),
    solutionId: varchar("solutionId", { length: 256 }).notNull(),
    performanceRating: performanceRatingEnum("performanceRating").notNull(),
    isPrimary: boolean("isPrimary").default(false).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    glassTypeSolutionKey: uniqueIndex(
      "GlassTypeSolution_glassTypeId_solutionId_key"
    ).on(table.glassTypeId, table.solutionId),
    glassTypeIdIdx: index("GlassTypeSolution_glassTypeId_idx").on(
      table.glassTypeId
    ),
    solutionIdIdx: index("GlassTypeSolution_solutionId_idx").on(
      table.solutionId
    ),
    isPrimaryIdx: index("GlassTypeSolution_isPrimary_idx").on(
      table.isPrimary
    ),
  })
);

export const glassCharacteristics = pgTable(
  "GlassCharacteristic",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    key: varchar("key", { length: 100 }).unique().notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    nameEs: varchar("nameEs", { length: 256 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    sortOrder: integer("sortOrder").default(0).notNull(),
    isSeeded: boolean("isSeeded").default(false).notNull(),
    seedVersion: varchar("seedVersion", { length: 20 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("GlassCharacteristic_category_idx").on(table.category),
    isActiveIdx: index("GlassCharacteristic_isActive_idx").on(table.isActive),
    isSeededIdx: index("GlassCharacteristic_isSeeded_idx").on(table.isSeeded),
  })
);

export const glassTypeCharacteristics = pgTable(
  "GlassTypeCharacteristic",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    glassTypeId: varchar("glassTypeId", { length: 256 }).notNull(),
    characteristicId: varchar("characteristicId", { length: 256 }).notNull(),
    value: varchar("value", { length: 256 }),
    certification: varchar("certification", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    glassTypeCharacteristicKey: uniqueIndex(
      "GlassTypeCharacteristic_glassTypeId_characteristicId_key"
    ).on(table.glassTypeId, table.characteristicId),
    glassTypeIdIdx: index("GlassTypeCharacteristic_glassTypeId_idx").on(
      table.glassTypeId
    ),
    characteristicIdIdx: index("GlassTypeCharacteristic_characteristicId_idx")
      .on(table.characteristicId),
  })
);

// ==========================================
// SERVICES
// ==========================================

export const services = pgTable(
  "Service",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    name: varchar("name", { length: 256 }).notNull(),
    type: serviceTypeEnum("type").notNull(),
    unit: serviceUnitEnum("unit").notNull(),
    rate: decimal("rate", { precision: 12, scale: 4 }).notNull(),
    minimumBillingUnit: decimal("minimumBillingUnit", {
      precision: 10,
      scale: 4,
    }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("Service_isActive_idx").on(table.isActive),
  })
);

// ==========================================
// QUOTES & QUOTE ITEMS
// ==========================================

export const quotes = pgTable(
  "Quote",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    userId: varchar("userId", { length: 256 }),
    status: quoteStatusEnum("status").default("draft").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    total: decimal("total", { precision: 12, scale: 4 })
      .default("0")
      .notNull(),
    validUntil: timestamp("validUntil"),
    contactPhone: varchar("contactPhone", { length: 20 }),
    contactAddress: text("contactAddress"),
    projectName: varchar("projectName", { length: 100 }),
    projectStreet: varchar("projectStreet", { length: 200 }),
    projectCity: varchar("projectCity", { length: 100 }),
    projectState: varchar("projectState", { length: 100 }),
    projectPostalCode: varchar("projectPostalCode", { length: 20 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    sentAt: timestamp("sentAt"),
  },
  (table) => ({
    userIdIdx: index("Quote_userId_idx").on(table.userId),
    userIdStatusIdx: index("Quote_userId_status_idx").on(
      table.userId,
      table.status
    ),
    userIdCreatedAtIdx: index("Quote_userId_createdAt_idx").on(
      table.userId,
      table.createdAt
    ),
    userIdValidUntilIdx: index("Quote_userId_validUntil_idx").on(
      table.userId,
      table.validUntil
    ),
    projectNameIdx: index("Quote_projectName_idx").on(table.projectName),
    statusIdx: index("Quote_status_idx").on(table.status),
    createdAtIdx: index("Quote_createdAt_idx").on(table.createdAt),
  })
);

export const quoteItems = pgTable(
  "QuoteItem",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    quoteId: varchar("quoteId", { length: 256 }).notNull(),
    modelId: varchar("modelId", { length: 256 }).notNull(),
    glassTypeId: varchar("glassTypeId", { length: 256 }).notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    roomLocation: varchar("roomLocation", { length: 100 }),
    widthMm: integer("widthMm").notNull(),
    heightMm: integer("heightMm").notNull(),
    accessoryApplied: boolean("accessoryApplied").default(false).notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 4 }).notNull(),
    colorId: varchar("colorId", { length: 256 }),
    colorSurchargePercentage: decimal("colorSurchargePercentage", {
      precision: 5,
      scale: 2,
    }),
    colorHexCode: varchar("colorHexCode", { length: 7 }),
    colorName: varchar("colorName", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    quoteIdIdx: index("QuoteItem_quoteId_idx").on(table.quoteId),
    colorIdIdx: index("QuoteItem_colorId_idx").on(table.colorId),
  })
);

export const quoteItemServices = pgTable(
  "QuoteItemService",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    quoteItemId: varchar("quoteItemId", { length: 256 }).notNull(),
    serviceId: varchar("serviceId", { length: 256 }).notNull(),
    unit: serviceUnitEnum("unit").notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 4 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    quoteItemServiceKey: uniqueIndex(
      "QuoteItemService_quoteItemId_serviceId_key"
    ).on(table.quoteItemId, table.serviceId),
  })
);

export const adjustments = pgTable(
  "Adjustment",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    scope: adjustmentScopeEnum("scope").notNull(),
    concept: varchar("concept", { length: 256 }).notNull(),
    unit: serviceUnitEnum("unit").notNull(),
    value: decimal("value", { precision: 12, scale: 4 }).notNull(),
    sign: adjustmentSignEnum("sign").notNull(),
    quoteId: varchar("quoteId", { length: 256 }),
    quoteItemId: varchar("quoteItemId", { length: 256 }),
    amount: decimal("amount", { precision: 12, scale: 4 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    quoteIdIdx: index("Adjustment_quoteId_idx").on(table.quoteId),
    quoteItemIdIdx: index("Adjustment_quoteItemId_idx").on(table.quoteItemId),
  })
);

// ==========================================
// MODEL COST & PRICING HISTORY
// ==========================================

export const modelCostBreakdowns = pgTable(
  "ModelCostBreakdown",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    modelId: varchar("modelId", { length: 256 }).notNull(),
    component: varchar("component", { length: 256 }).notNull(),
    costType: costTypeEnum("costType").notNull(),
    unitCost: decimal("unitCost", { precision: 12, scale: 4 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    modelIdIdx: index("ModelCostBreakdown_modelId_idx").on(table.modelId),
    modelIdCostTypeIdx: index("ModelCostBreakdown_modelId_costType_idx").on(
      table.modelId,
      table.costType
    ),
  })
);

export const modelPriceHistories = pgTable(
  "ModelPriceHistory",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    modelId: varchar("modelId", { length: 256 }).notNull(),
    basePrice: decimal("basePrice", { precision: 12, scale: 4 }).notNull(),
    costPerMmWidth: decimal("costPerMmWidth", {
      precision: 12,
      scale: 4,
    }).notNull(),
    costPerMmHeight: decimal("costPerMmHeight", {
      precision: 12,
      scale: 4,
    }).notNull(),
    reason: varchar("reason", { length: 256 }),
    effectiveFrom: timestamp("effectiveFrom").notNull(),
    createdBy: varchar("createdBy", { length: 256 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    modelIdEffectiveFromIdx: index(
      "ModelPriceHistory_modelId_effectiveFrom_idx"
    ).on(table.modelId, table.effectiveFrom),
    createdByIdx: index("ModelPriceHistory_createdBy_idx").on(table.createdBy),
  })
);

// ==========================================
// DELIVERY ADDRESS
// ==========================================

export const projectAddresses = pgTable(
  "ProjectAddress",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    quoteId: varchar("quoteId", { length: 256 }).unique(),
    label: varchar("label", { length: 100 }),
    country: varchar("country", { length: 100 }),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }),
    district: varchar("district", { length: 100 }),
    street: varchar("street", { length: 200 }),
    reference: varchar("reference", { length: 200 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    postalCode: varchar("postalCode", { length: 20 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    quoteIdIdx: index("ProjectAddress_quoteId_idx").on(table.quoteId),
    cityIdx: index("ProjectAddress_city_idx").on(table.city),
    latLngIdx: index("ProjectAddress_latitude_longitude_idx").on(
      table.latitude,
      table.longitude
    ),
  })
);

// ==========================================
// FOREIGN KEY RELATIONSHIPS (defined separately for clarity)
// ==========================================

// These would typically be handled by drizzle relations helpers
// but we list them here for reference of the schema structure
