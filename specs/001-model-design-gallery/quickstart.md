# Quickstart: Implementar Galería de Diseños 2D

**Feature**: 001-model-design-gallery  
**Date**: 2025-01-25

---

## Prerequisites

Antes de comenzar, asegúrate de tener:

- ✅ Node.js 18+ instalado
- ✅ Proyecto Glasify Lite clonado y configurado
- ✅ Base de datos PostgreSQL corriendo
- ✅ Branch `001-model-design-gallery` checked out

```bash
git checkout 001-model-design-gallery
pnpm install
```

---

## Step 1: Install Dependencies

Agregar Konva y react-konva al proyecto:

```bash
pnpm add konva react-konva
pnpm add -D @types/react-konva
```

Opcional (para lazy loading optimizado):

```bash
# Ya está instalado en el proyecto, verificar
pnpm list react-intersection-observer
```

---

## Step 2: Database Schema & Migration

### 2.1 Update Prisma Schema

Editar `prisma/schema.prisma`:

```prisma
// Add ModelType enum BEFORE Model model
enum ModelType {
  fixed_window
  sliding_window_horizontal
  sliding_window_vertical
  casement_window
  awning_window
  single_door
  double_door
  sliding_door
  other
}

// Add ModelDesign model
model ModelDesign {
  id           String     @id @default(cuid())
  name         String     @unique
  nameEs       String
  description  String?
  type         ModelType
  config       Json
  thumbnailUrl String?
  isActive     Boolean    @default(true)
  displayOrder Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  models       Model[]
  
  @@index([type, isActive])
  @@index([displayOrder])
}

// Modify Model model - add these fields
model Model {
  // ... existing fields
  
  type      ModelType?
  designId  String?
  design    ModelDesign? @relation(fields: [designId], references: [id], onDelete: SetNull)
  
  // ... existing relations
  
  @@index([designId])
  @@index([type])
}
```

### 2.2 Generate Migration

```bash
pnpm prisma migrate dev --name add_model_designs
```

Esto creará y ejecutará la migración automáticamente.

### 2.3 Verify Migration

```bash
pnpm prisma studio
```

Verifica que las tablas `ModelDesign` y campos `type`/`designId` en `Model` existan.

---

## Step 3: Create Core Libraries

### 3.1 Design Types

Crear `src/lib/design/types.ts`:

```typescript
import type { ModelType } from '@prisma/client';

export type StoredDesignConfig = {
  version: '1.0';
  metadata: {
    id: string;
    name: string;
    nameEs: string;
    description?: string;
    type: ModelType;
  };
  dimensions: {
    baseWidth: number;
    baseHeight: number;
  };
  constraints: {
    frameThicknessMin: number;
    frameThicknessMax: number;
    glassMargin: number;
  };
  shapes: ShapeDefinition[];
};

export type ShapeDefinition = {
  id: string;
  type: 'rect' | 'circle' | 'line';
  role: 'frame' | 'glass' | 'handle' | 'hinge' | 'decorative';
  layer: number;
  position: {
    x: number | { percent: number };
    y: number | { percent: number };
  };
  size: {
    width: number | { percent: number } | 'fill';
    height: number | { percent: number } | 'fill';
  };
  style: {
    fill?: string | 'material';
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    cornerRadius?: number;
  };
};

export type AdaptedDesign = {
  width: number;
  height: number;
  shapes: Array<{
    type: ShapeDefinition['type'];
    x: number;
    y: number;
    width: number;
    height: number;
    style: {
      fill: string;
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
      cornerRadius?: number;
    };
  }>;
};
```

### 3.2 Material Colors

Crear `src/lib/design/material-colors.ts`:

```typescript
import type { MaterialType } from '@prisma/client';

export const MATERIAL_COLORS: Record<MaterialType, string> = {
  PVC: '#FFFFFF',
  ALUMINUM: '#808080',
  WOOD: '#8B4513',
  MIXED: '#D3D3D3',
} as const;

export function getMaterialColor(material: MaterialType): string {
  return MATERIAL_COLORS[material];
}
```

### 3.3 Validation Schemas

Crear `src/lib/design/validation.ts` con Zod schemas (ver `data-model.md` para esquema completo).

---

## Step 4: Create Seeder

Crear `prisma/seeders/seed-designs.ts`:

```typescript
import { db } from '@/server/db';
import { ModelType } from '@prisma/client';
import type { StoredDesignConfig } from '@/lib/design/types';

const DESIGNS: Array<{
  name: string;
  nameEs: string;
  description: string;
  type: ModelType;
  config: StoredDesignConfig;
  displayOrder: number;
}> = [
  {
    name: 'fixed-window-simple',
    nameEs: 'Ventana Fija Simple',
    description: 'Ventana fija rectangular básica',
    type: 'fixed_window',
    displayOrder: 1,
    config: {
      version: '1.0',
      metadata: {
        id: 'fixed-window-simple',
        name: 'fixed-window-simple',
        nameEs: 'Ventana Fija Simple',
        type: 'fixed_window',
      },
      dimensions: { baseWidth: 1000, baseHeight: 1200 },
      constraints: {
        frameThicknessMin: 40,
        frameThicknessMax: 80,
        glassMargin: 10,
      },
      shapes: [
        {
          id: 'frame',
          type: 'rect',
          role: 'frame',
          layer: 0,
          position: { x: 0, y: 0 },
          size: { width: { percent: 1 }, height: { percent: 1 } },
          style: { fill: 'material', stroke: '#333', strokeWidth: 2 },
        },
        {
          id: 'glass',
          type: 'rect',
          role: 'glass',
          layer: 1,
          position: { x: 50, y: 50 },
          size: { width: 'fill', height: 'fill' },
          style: { fill: '#E0F7FA', opacity: 0.7 },
        },
      ],
    },
  },
  // Add more designs here...
];

export async function seedDesigns() {
  console.log('🎨 Seeding model designs...');

  for (const design of DESIGNS) {
    await db.modelDesign.upsert({
      where: { name: design.name },
      update: {
        nameEs: design.nameEs,
        description: design.description,
        type: design.type,
        config: design.config as any,
        displayOrder: design.displayOrder,
      },
      create: design as any,
    });
  }

  console.log(`✅ Seeded ${DESIGNS.length} designs`);
}
```

Agregar al `seed-cli.ts`:

```typescript
import { seedDesigns } from './seeders/seed-designs';

// En la función main:
await seedDesigns();
```

Ejecutar seeder:

```bash
pnpm prisma db seed
```

---

## Step 5: Create tRPC Router

Crear `src/server/api/routers/admin/model-design.ts`:

```typescript
import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';
import { ModelType } from '@prisma/client';

export const modelDesignRouter = createTRPCRouter({
  list: adminProcedure
    .input(z.object({
      type: z.nativeEnum(ModelType).optional(),
      isActive: z.union([z.boolean(), z.literal('all')]).optional(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { type, isActive, page, limit } = input;
      
      const where = {
        ...(type && { type }),
        ...(isActive !== 'all' && isActive !== undefined && { isActive }),
      };
      
      const [items, total] = await Promise.all([
        ctx.db.modelDesign.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: { select: { models: true } },
          },
        }),
        ctx.db.modelDesign.count({ where }),
      ]);
      
      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
  
  // Add more procedures: get-by-id, toggle-active, etc.
});
```

Registrar en `src/server/api/root.ts`:

```typescript
import { modelDesignRouter } from './routers/admin/model-design';

export const appRouter = createTRPCRouter({
  // ... existing routers
  admin: createTRPCRouter({
    // ... existing admin routers
    'model-design': modelDesignRouter,
  }),
});
```

---

## Step 6: Create Client Components

### 6.1 Design Renderer

Crear `src/app/_components/design/design-renderer.tsx`:

```typescript
'use client';

import { memo } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import type { StoredDesignConfig } from '@/lib/design/types';
import type { MaterialType } from '@prisma/client';
import { getMaterialColor } from '@/lib/design/material-colors';

type DesignRendererProps = {
  design: StoredDesignConfig;
  width: number;  // px
  height: number; // px
  material?: MaterialType;
};

export const DesignRenderer = memo(function DesignRenderer({
  design,
  width,
  height,
  material = 'PVC',
}: DesignRendererProps) {
  // TODO: Implement adaptation logic (see research.md Task 4)
  const materialColor = getMaterialColor(material);
  
  return (
    <Stage width={width} height={height} listening={false}>
      <Layer>
        {design.shapes.map((shape) => {
          if (shape.type === 'rect') {
            return (
              <Rect
                key={shape.id}
                x={0}
                y={0}
                width={width}
                height={height}
                fill={shape.style.fill === 'material' ? materialColor : shape.style.fill}
                stroke={shape.style.stroke}
                strokeWidth={shape.style.strokeWidth}
                opacity={shape.style.opacity}
                cornerRadius={shape.style.cornerRadius}
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
});
```

### 6.2 Design Fallback

Crear `src/app/_components/design/design-fallback.tsx`:

```typescript
export function DesignFallback() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
      <p className="text-muted-foreground text-sm">Sin diseño</p>
    </div>
  );
}
```

---

## Step 7: Integrate in Model Card

Modificar `src/app/(public)/catalog/_components/molecules/model-card.tsx`:

```typescript
'use client';

import { DesignRenderer } from '@app/_components/design/design-renderer';
import { DesignFallback } from '@app/_components/design/design-fallback';
import type { StoredDesignConfig } from '@/lib/design/types';
import type { MaterialType } from '@prisma/client';

type ModelCardProps = {
  // ... existing props
  design?: StoredDesignConfig | null;
  material?: MaterialType | null;
};

export function ModelCard({ 
  id, 
  name, 
  basePrice,
  design,
  material,
}: ModelCardProps) {
  return (
    <Card>
      <Link href={`/catalog/${id}`}>
        {design && material ? (
          <DesignRenderer 
            design={design} 
            width={300} 
            height={225}
            material={material}
          />
        ) : (
          <DesignFallback />
        )}
        
        <CardContent>
          <h3>{name}</h3>
        </CardContent>
        
        <CardFooter>
          <ProductPrice price={basePrice} />
        </CardFooter>
      </Link>
    </Card>
  );
}
```

---

## Step 8: Test Setup

Crear tests básicos:

```bash
# Unit test
touch tests/unit/design-renderer.test.ts

# Integration test
touch tests/integration/model-design-router.test.ts

# E2E test
touch e2e/admin/model-design-assignment.spec.ts
```

Ver `tasks.md` (generado por `/speckit.tasks`) para TDD workflow completo.

---

## Step 9: Run Development Server

```bash
pnpm dev
```

Navegar a:
- http://localhost:3000/catalog → Ver diseños en catálogo
- http://localhost:3000/admin/models/new → Asignar diseño a modelo

---

## Next Steps

1. ✅ Setup básico completo
2. → Implementar lógica de adaptación parametrizada (Task 4 en research.md)
3. → Crear selector de diseños para formulario de modelo
4. → Agregar más diseños predefinidos al seeder
5. → Optimizar performance con lazy loading (Intersection Observer)
6. → Escribir tests completos (ver tasks.md)

---

## Troubleshooting

### Konva no renderiza en SSR

**Problema**: Error "window is not defined"

**Solución**: Asegurar que `DesignRenderer` tenga `'use client'` directive

### Diseños no aparecen en catálogo

**Checklist**:
- ✅ Seeder ejecutado correctamente
- ✅ Modelo tiene `designId` asignado
- ✅ Diseño tiene `isActive: true`
- ✅ tRPC incluye `design` en respuesta

### Performance lento con muchos diseños

**Solución**: Implementar lazy loading con Intersection Observer (ver research.md Task 3)

---

## Resources

- [Konva Documentation](https://konvajs.org/docs/)
- [react-konva API](https://konvajs.org/docs/react/)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Prisma JSON Fields](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json-fields)
