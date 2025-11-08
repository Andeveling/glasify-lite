// Enums migrados de Prisma a Drizzle
// Usando pgEnum para sincronizar con la base de datos y drizzle-zod
import { pgEnum } from "drizzle-orm/pg-core";

// Define enum values as constants to avoid duplication in Zod schemas
export const MODEL_STATUS_VALUES = ["draft", "published"] as const;
export const SERVICE_TYPE_VALUES = ["area", "perimeter", "fixed"] as const;
export const SERVICE_UNIT_VALUES = ["unit", "sqm", "ml"] as const;
export const QUOTE_STATUS_VALUES = ["draft", "sent", "canceled"] as const;
export const ADJUSTMENT_SCOPE_VALUES = ["item", "quote"] as const;
export const ADJUSTMENT_SIGN_VALUES = ["positive", "negative"] as const;
export const GLASS_PURPOSE_VALUES = [
  "general",
  "insulation",
  "security",
  "decorative",
] as const;
export const PERFORMANCE_RATING_VALUES = [
  "basic",
  "standard",
  "good",
  "very_good",
  "excellent",
] as const;
export const COST_TYPE_VALUES = [
  "fixed",
  "per_mm_width",
  "per_mm_height",
  "per_sqm",
] as const;
export const MATERIAL_TYPE_VALUES = [
  "PVC",
  "ALUMINUM",
  "WOOD",
  "MIXED",
] as const;
export const USER_ROLE_VALUES = ["admin", "seller", "user"] as const;

// Create pgEnum instances using the constant values
export const modelStatusEnum = pgEnum("ModelStatus", MODEL_STATUS_VALUES);
export const serviceTypeEnum = pgEnum("ServiceType", SERVICE_TYPE_VALUES);
export const serviceUnitEnum = pgEnum("ServiceUnit", SERVICE_UNIT_VALUES);
export const quoteStatusEnum = pgEnum("QuoteStatus", QUOTE_STATUS_VALUES);
export const adjustmentScopeEnum = pgEnum(
  "AdjustmentScope",
  ADJUSTMENT_SCOPE_VALUES
);
export const adjustmentSignEnum = pgEnum(
  "AdjustmentSign",
  ADJUSTMENT_SIGN_VALUES
);
// @deprecated: Usar GlassSolution + GlassTypeSolution Many-to-Many
export const glassPurposeEnum = pgEnum("GlassPurpose", GLASS_PURPOSE_VALUES);
export const performanceRatingEnum = pgEnum(
  "PerformanceRating",
  PERFORMANCE_RATING_VALUES
);
export const costTypeEnum = pgEnum("CostType", COST_TYPE_VALUES);
export const materialTypeEnum = pgEnum("MaterialType", MATERIAL_TYPE_VALUES);
export const userRoleEnum = pgEnum("UserRole", USER_ROLE_VALUES);
