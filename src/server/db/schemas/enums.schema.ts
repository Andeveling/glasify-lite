// Enums migrados de Prisma a Drizzle
// Usando pgEnum para sincronizar con la base de datos y drizzle-zod
import { pgEnum } from 'drizzle-orm/pg-core';

export const modelStatusEnum = pgEnum('ModelStatus', ['draft', 'published']);

export const serviceTypeEnum = pgEnum('ServiceType', ['area', 'perimeter', 'fixed']);

export const serviceUnitEnum = pgEnum('ServiceUnit', ['unit', 'sqm', 'ml']);

export const quoteStatusEnum = pgEnum('QuoteStatus', ['draft', 'sent', 'canceled']);

export const adjustmentScopeEnum = pgEnum('AdjustmentScope', ['item', 'quote']);

export const adjustmentSignEnum = pgEnum('AdjustmentSign', ['positive', 'negative']);

// @deprecated: Usar GlassSolution + GlassTypeSolution Many-to-Many
export const glassPurposeEnum = pgEnum('GlassPurpose', [
	'general',
	'insulation',
	'security',
	'decorative',
]);

export const performanceRatingEnum = pgEnum('PerformanceRating', [
	'basic',
	'standard',
	'good',
	'very_good',
	'excellent',
]);

export const costTypeEnum = pgEnum('CostType', [
	'fixed',
	'per_mm_width',
	'per_mm_height',
	'per_sqm',
]);

export const materialTypeEnum = pgEnum('MaterialType', ['PVC', 'ALUMINUM', 'WOOD', 'MIXED']);

export const userRoleEnum = pgEnum('UserRole', ['admin', 'seller', 'user']);
