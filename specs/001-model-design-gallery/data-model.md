# Data Model: Galería de Diseños 2D para Modelos

**Feature**: 001-model-design-gallery  
**Date**: 2025-01-25  
**Status**: Complete

---

## Overview

Este documento define el modelo de datos para la funcionalidad de diseños 2D de modelos, incluyendo:
- Nueva entidad `ModelDesign` (diseños predefinidos)
- Extensión de entidad `Model` (tipo + relación a diseño)
- Enum `ModelType` (categorización de modelos)
- Estructura JSON para configuración de diseños

---

## Database Schema Changes

### New Model: `ModelDesign`

Representa un diseño 2D predefinido que puede ser asociado a múltiples modelos.

```prisma
/// Model Design
/// Representa diseños 2D predefinidos para visualización de modelos
/// Almacena configuración JSON con formas Konva para rendering adaptativo

model ModelDesign {
  id          String   @id @default(cuid())
  
  /// Nombre único del diseño (ej: "fixed-window-simple", "sliding-door-double")
  name        String   @unique
  
  /// Descripción breve en español para UI
  nameEs      String
  description String?
  
  /// Tipo de modelo compatible (ventana fija, corredera, puerta, etc.)
  type        ModelType
  
  /// Configuración JSON del diseño (ver StoredDesignConfig type)
  /// Estructura versionada con metadata, constraints y shapes
  config      Json
  
  /// Thumbnail preview del diseño (opcional, para galería)
  /// URL relativa a /public/designs/thumbnails/
  thumbnailUrl String?
  
  /// Estado: activo (disponible en galería) o inactivo
  isActive    Boolean @default(true)
  
  /// Orden de aparición en galería (menor número = más arriba)
  displayOrder Int    @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  /// Modelos que usan este diseño
  models      Model[]
  
  @@index([type, isActive])
  @@index([displayOrder])
}
```

### New Enum: `ModelType`

Categoriza modelos según su tipo funcional para validación de compatibilidad con diseños.

```prisma
enum ModelType {
  /// Ventana fija (no abre)
  fixed_window
  
  /// Ventana corredera horizontal (1 o más hojas deslizantes)
  sliding_window_horizontal
  
  /// Ventana corredera vertical (guillotina)
  sliding_window_vertical
  
  /// Ventana batiente (abre hacia afuera/adentro)
  casement_window
  
  /// Ventana proyectante (abre inclinado)
  awning_window
  
  /// Puerta estándar (1 hoja)
  single_door
  
  /// Puerta doble (2 hojas)
  double_door
  
  /// Puerta corredera (deslizante)
  sliding_door
  
  /// Otro (para casos no cubiertos)
  other
}
```

### Modified Model: `Model`

Extiende el modelo existente con tipo y relación opcional a diseño.

```prisma
model Model {
  id                     String               @id @default(cuid())
  profileSupplierId      String?
  profileSupplier        ProfileSupplier?     @relation(fields: [profileSupplierId], references: [id], onDelete: SetNull)
  
  name                   String
  status                 ModelStatus          @default(draft)
  
  /// NUEVO: Tipo de modelo (ventana, puerta, etc.)
  /// Requerido para asignar diseño compatible
  type                   ModelType?
  
  /// NUEVO: Diseño visual 2D asociado (opcional)
  designId               String?
  design                 ModelDesign?         @relation(fields: [designId], references: [id], onDelete: SetNull)
  
  // ... campos existentes (dimensiones, precios, etc.)
  minWidthMm             Int
  maxWidthMm             Int
  minHeightMm            Int
  maxHeightMm            Int
  basePrice              Decimal              @db.Decimal(12, 2)
  costPerMmWidth         Decimal              @db.Decimal(12, 4)
  costPerMmHeight        Decimal              @db.Decimal(12, 4)
  accessoryPrice         Decimal?             @db.Decimal(12, 2)
  glassDiscountWidthMm   Int                  @default(0)
  glassDiscountHeightMm  Int                  @default(0)
  compatibleGlassTypeIds String[]
  profitMarginPercentage Decimal?             @db.Decimal(5, 2)
  lastCostReviewDate     DateTime?
  costNotes              String?
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
  
  // ... relaciones existentes
  costBreakdown          ModelCostBreakdown[]
  priceHistory           ModelPriceHistory[]
  quoteItems             QuoteItem[]
  
  @@index([status])
  @@index([profileSupplierId])
  @@index([designId])     // NUEVO
  @@index([type])         // NUEVO
}
```

---

## TypeScript Types

### Design Configuration Structure

```typescript
// src/lib/design/types.ts

/**
 * Stored design configuration in database (JSON field)
 * Version 1.0 - Initial implementation
 */
export type StoredDesignConfig = {
  /** Schema version for future migrations */
  version: '1.0';
  
  metadata: {
    id: string;
    name: string;
    nameEs: string;
    description?: string;
    type: ModelType;
    author?: string;
    createdAt?: string;
  };
  
  /** Base dimensions for scaling reference (in mm) */
  dimensions: {
    baseWidth: number;
    baseHeight: number;
  };
  
  /** Adaptation constraints for parametric rendering */
  constraints: {
    /** Minimum frame thickness in mm (won't scale below this) */
    frameThicknessMin: number;
    /** Maximum frame thickness in mm (won't scale above this) */
    frameThicknessMax: number;
    /** Margin between frame and glass in mm */
    glassMargin: number;
  };
  
  /** Array of shapes to render (order matters for layering) */
  shapes: ShapeDefinition[];
};

/**
 * Individual shape definition
 */
export type ShapeDefinition = {
  /** Unique ID for debugging */
  id: string;
  
  /** Konva shape type */
  type: 'rect' | 'circle' | 'line' | 'path';
  
  /** Semantic role (affects adaptation logic) */
  role: 'frame' | 'glass' | 'handle' | 'hinge' | 'decorative';
  
  /** Z-index for rendering order (0 = back, higher = front) */
  layer: number;
  
  /** Position (supports absolute mm or relative %) */
  position: {
    x: number | { percent: number };
    y: number | { percent: number };
  };
  
  /** Size (supports absolute mm, relative %, or 'fill') */
  size: {
    width: number | { percent: number } | 'fill';
    height: number | { percent: number } | 'fill';
  };
  
  /** Visual styling */
  style: {
    /** Fill color (hex) or 'material' for dynamic color */
    fill?: string | 'material';
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    /** Corner radius for rectangles (in mm) */
    cornerRadius?: number;
  };
};

/**
 * Runtime adapted design after applying dimensions and material
 */
export type AdaptedDesign = {
  width: number;  // px
  height: number; // px
  shapes: Array<{
    type: ShapeDefinition['type'];
    role: ShapeDefinition['role'];
    layer: number;
    x: number;      // px
    y: number;      // px
    width: number;  // px
    height: number; // px
    style: {
      fill: string; // Resolved color (no 'material')
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
      cornerRadius?: number;
    };
  }>;
};
```

### Material Color Mapping

```typescript
// src/lib/design/material-colors.ts

import type { MaterialType } from '@prisma/client';

/**
 * Maps ProfileSupplier material types to base colors for design rendering
 * Colors are neutral/approximations for visual differentiation
 */
export const MATERIAL_COLORS: Record<MaterialType, string> = {
  PVC: '#FFFFFF',       // White
  ALUMINUM: '#808080',  // Gray
  WOOD: '#8B4513',      // Brown (SaddleBrown)
  MIXED: '#D3D3D3',     // Light Gray (neutral)
} as const;

export function getMaterialColor(material: MaterialType): string {
  return MATERIAL_COLORS[material];
}

export function isValidMaterialColor(color: unknown): color is string {
  return typeof color === 'string' && color in Object.values(MATERIAL_COLORS);
}
```

---

## Validation Rules

### Zod Schemas

```typescript
// src/lib/design/validation.ts

import { z } from 'zod';
import { ModelType } from '@prisma/client';

/**
 * Validates position value (absolute or percentage)
 */
const positionValueSchema = z.union([
  z.number().nonnegative(),
  z.object({ percent: z.number().min(0).max(1) }),
]);

/**
 * Validates size value (absolute, percentage, or 'fill')
 */
const sizeValueSchema = z.union([
  z.number().nonnegative(),
  z.object({ percent: z.number().min(0).max(1) }),
  z.literal('fill'),
]);

/**
 * Validates individual shape definition
 */
const shapeDefinitionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['rect', 'circle', 'line', 'path']),
  role: z.enum(['frame', 'glass', 'handle', 'hinge', 'decorative']),
  layer: z.number().int().nonnegative(),
  
  position: z.object({
    x: positionValueSchema,
    y: positionValueSchema,
  }),
  
  size: z.object({
    width: sizeValueSchema,
    height: sizeValueSchema,
  }),
  
  style: z.object({
    fill: z.union([z.string(), z.literal('material')]).optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().nonnegative().optional(),
    opacity: z.number().min(0).max(1).optional(),
    cornerRadius: z.number().nonnegative().optional(),
  }),
});

/**
 * Validates complete stored design configuration
 */
export const storedDesignConfigSchema = z.object({
  version: z.literal('1.0'),
  
  metadata: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    nameEs: z.string().min(1),
    description: z.string().optional(),
    type: z.nativeEnum(ModelType),
    author: z.string().optional(),
    createdAt: z.string().optional(),
  }),
  
  dimensions: z.object({
    baseWidth: z.number().positive(),
    baseHeight: z.number().positive(),
  }),
  
  constraints: z.object({
    frameThicknessMin: z.number().positive(),
    frameThicknessMax: z.number().positive(),
    glassMargin: z.number().nonnegative(),
  }).refine(
    (data) => data.frameThicknessMin <= data.frameThicknessMax,
    { message: 'frameThicknessMin must be <= frameThicknessMax' }
  ),
  
  shapes: z.array(shapeDefinitionSchema).min(1).max(100),
});

/**
 * Type-safe validation function
 */
export function validateDesignConfig(
  config: unknown
): StoredDesignConfig {
  return storedDesignConfigSchema.parse(config);
}

/**
 * Safe validation with error handling
 */
export function isValidDesignConfig(
  config: unknown
): config is StoredDesignConfig {
  const result = storedDesignConfigSchema.safeParse(config);
  return result.success;
}
```

---

## Business Rules

### Model Type Validation

1. **Required for Design Assignment**
   - Un modelo DEBE tener `type` definido antes de asignar un diseño
   - Si `type` es NULL, selector de diseños muestra mensaje "Selecciona tipo de modelo primero"

2. **Type Compatibility**
   - Solo diseños con `type` compatible pueden ser asignados
   - Ejemplo: modelo con `type = 'fixed_window'` solo puede usar diseños con `type = 'fixed_window'`

3. **Type Change Impact**
   - Si se cambia el `type` de un modelo que ya tiene diseño asignado:
     - Si el diseño actual es compatible con nuevo tipo → mantener asignación
     - Si NO es compatible → resetear `designId` a NULL (con warning al usuario)

### Design Deletion Protection

1. **Soft Delete**
   - Diseños en uso (referenciados por modelos) NO pueden ser eliminados hard
   - Solo pueden marcarse como `isActive = false`
   - Modelos mantienen rendering de diseños inactivos (no se rompe UI)

2. **Orphaned Models**
   - Si un diseño se marca inactivo, modelos asociados mantienen `designId`
   - En selector de galería, diseños inactivos NO aparecen
   - Modelos existentes siguen mostrando diseño (frozen)

### Design Config Validation

1. **JSON Schema Validation**
   - Todo `config` JSON debe pasar `storedDesignConfigSchema` antes de guardar
   - Si falla validación → rechazar creación/actualización con error descriptivo

2. **Size Limits**
   - JSON config debe ser <50KB serializado
   - Máximo 100 shapes por diseño
   - Evitar performance issues en rendering

---

## Migration Strategy

### Migration SQL

```sql
-- Add ModelType enum
CREATE TYPE "ModelType" AS ENUM (
  'fixed_window',
  'sliding_window_horizontal',
  'sliding_window_vertical',
  'casement_window',
  'awning_window',
  'single_door',
  'double_door',
  'sliding_door',
  'other'
);

-- Create ModelDesign table
CREATE TABLE "ModelDesign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "description" TEXT,
    "type" "ModelType" NOT NULL,
    "config" JSONB NOT NULL,
    "thumbnailUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelDesign_pkey" PRIMARY KEY ("id")
);

-- Add new fields to Model table
ALTER TABLE "Model" ADD COLUMN "type" "ModelType";
ALTER TABLE "Model" ADD COLUMN "designId" TEXT;

-- Add foreign key constraint
ALTER TABLE "Model" ADD CONSTRAINT "Model_designId_fkey" 
  FOREIGN KEY ("designId") REFERENCES "ModelDesign"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX "ModelDesign_name_key" ON "ModelDesign"("name");
CREATE INDEX "ModelDesign_type_isActive_idx" ON "ModelDesign"("type", "isActive");
CREATE INDEX "ModelDesign_displayOrder_idx" ON "ModelDesign"("displayOrder");
CREATE INDEX "Model_designId_idx" ON "Model"("designId");
CREATE INDEX "Model_type_idx" ON "Model"("type");
```

### Data Migration Notes

1. **Existing Models**
   - Modelos existentes tendrán `type = NULL` y `designId = NULL`
   - No breaking change (campos opcionales)
   - Administradores pueden asignar tipos y diseños gradualmente

2. **Rollback Plan**
   - Si se necesita rollback:
     ```sql
     ALTER TABLE "Model" DROP COLUMN "designId";
     ALTER TABLE "Model" DROP COLUMN "type";
     DROP TABLE "ModelDesign";
     DROP TYPE "ModelType";
     ```

---

## Example Data

### Sample Design: Fixed Window Simple

```json
{
  "version": "1.0",
  "metadata": {
    "id": "fixed-window-simple",
    "name": "fixed-window-simple",
    "nameEs": "Ventana Fija Simple",
    "description": "Ventana fija rectangular con marco y cristal",
    "type": "fixed_window"
  },
  "dimensions": {
    "baseWidth": 1000,
    "baseHeight": 1200
  },
  "constraints": {
    "frameThicknessMin": 40,
    "frameThicknessMax": 80,
    "glassMargin": 10
  },
  "shapes": [
    {
      "id": "outer-frame",
      "type": "rect",
      "role": "frame",
      "layer": 0,
      "position": { "x": 0, "y": 0 },
      "size": { "width": { "percent": 1 }, "height": { "percent": 1 } },
      "style": {
        "fill": "material",
        "stroke": "#333",
        "strokeWidth": 2,
        "cornerRadius": 4
      }
    },
    {
      "id": "glass-panel",
      "type": "rect",
      "role": "glass",
      "layer": 1,
      "position": { "x": 50, "y": 50 },
      "size": { "width": "fill", "height": "fill" },
      "style": {
        "fill": "#E0F7FA",
        "stroke": "#00838F",
        "strokeWidth": 1,
        "opacity": 0.7,
        "cornerRadius": 2
      }
    }
  ]
}
```

---

## Next Steps

1. ✅ Data model defined
2. → Create API contracts (tRPC procedures)
3. → Generate quickstart guide
4. → Update agent context
