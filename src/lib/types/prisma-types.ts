/**
 * Prisma Type Definitions
 *
 * Local type definitions to avoid direct imports from @prisma/client
 * This prevents compilation issues when Prisma client generation fails
 *
 * Keep these in sync with prisma/schema.prisma
 */

// User and Role Types
export type UserRole = "admin" | "seller" | "user";

// Material Types
export type MaterialType = "PVC" | "ALUMINUM" | "WOOD" | "MIXED";

// Model Types
export type ModelStatus = "draft" | "published";

// Service Types
export type ServiceType = "fixed" | "area" | "perimeter";
export type ServiceUnit = "unit" | "sqm" | "ml";

// Cost Types
export type CostType = "fixed" | "per_mm_height" | "per_mm_width" | "per_sqm";

// Quote Types
export type QuoteStatus = "draft" | "sent" | "canceled";

// Entity Types - Using any to avoid complex type mismatches
// These are placeholders to avoid importing from @prisma/client
export type Color = any;
export type ModelColor = any;
export type ProfileSupplier = any;
export type Service = any;
export type Quote = any;
