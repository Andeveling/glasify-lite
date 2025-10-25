# Research: Galería de Diseños 2D para Modelos

**Feature**: 001-model-design-gallery  
**Date**: 2025-01-25  
**Status**: Complete

---

## Research Task 1: Konva + Next.js 15 Compatibility

### Question
¿Es react-konva compatible con Next.js 15 App Router y React Server Components?

### Findings

**Compatibility Status**: ✅ Compatible con limitaciones conocidas

- **Konva.js** (v9.x) es una librería de canvas 2D que ejecuta en el navegador
- **react-konva** (v18.x) proporciona bindings React para Konva
- **Limitación**: Konva requiere DOM/window, **NO compatible con Server Components**
- **Solución**: Usar `'use client'` directive en componentes que usen react-konva

### Decision

**Elegido**: react-konva en Client Components con dynamic imports opcionales

**Rationale**:
- Konva es el estándar de facto para canvas 2D declarativo en React
- La limitación SSR es manejable con boundaries Client/Server bien definidas
- Performance excelente para rendering 2D (usa canvas nativo)
- API declarativa (`<Stage>`, `<Layer>`, `<Rect>`) es intuitiva

**Alternatives Considered**:
1. **SVG con React** - Rechazado: menos performante para múltiples instancias, más verboso
2. **Canvas nativo con useEffect** - Rechazado: código imperativo difícil de mantener, no declarativo
3. **Fabric.js** - Rechazado: más orientado a edición interactiva, overkill para rendering estático

### Implementation Pattern

```typescript
// src/app/_components/design/design-renderer.tsx
'use client';

import { Stage, Layer, Rect, Circle } from 'react-konva';
import type { DesignConfig } from '@/lib/design/types';

export function DesignRenderer({ 
  design, 
  width, 
  height 
}: DesignRendererProps) {
  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Render shapes from design config */}
      </Layer>
    </Stage>
  );
}
```

### References
- [react-konva official docs](https://konvajs.org/docs/react/)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Konva performance tips](https://konvajs.org/docs/performance/All_Performance_Tips.html)

---

## Research Task 2: SSR Strategy for Canvas Components

### Question
¿Cuál es el mejor patrón para manejar componentes canvas en Next.js SSR?

### Findings

**Options Evaluated**:

1. **Client Component Boundaries** (Recommended ✅)
   - Marcar componente con `'use client'`
   - Server Component padre pasa data como props
   - SSR renderiza placeholder, hydration renderiza canvas

2. **Dynamic Import with ssr: false**
   - Usar `next/dynamic` con `{ ssr: false }`
   - Retrasa rendering hasta client-side
   - Útil si queremos evitar hydration mismatch

3. **Canvas-to-Image Server-Side** (Over-engineering ❌)
   - Pre-renderizar canvas a imagen en servidor (headless browser)
   - Muy complejo, requiere Puppeteer/Playwright
   - No vale la pena para diseños simples

### Decision

**Elegido**: Opción 1 - Client Component Boundaries con SSR placeholder

**Rationale**:
- Más simple y directo (solo agregar `'use client'`)
- Server Component puede pre-fetch design data
- Client Component recibe data serializada y renderiza
- Skeleton placeholder durante hydration mejora UX
- No requiere dependencias adicionales

**Pattern**:

```typescript
// Server Component (catalog page)
export default async function CatalogPage() {
  const models = await api.catalog.list(); // Server-side data fetch
  
  return (
    <div className="grid">
      {models.map(model => (
        <ModelCard 
          key={model.id}
          model={model}
          design={model.design} // Serialized design config
        />
      ))}
    </div>
  );
}

// Client Component (model card with design)
'use client';
export function ModelCard({ model, design }: Props) {
  return (
    <Card>
      {design ? (
        <DesignRenderer design={design} {...dimensions} />
      ) : (
        <DesignFallback />
      )}
    </Card>
  );
}
```

### Alternatives Considered
- **Dynamic import** - Rechazado: agrega complejidad innecesaria, retrasa rendering
- **Server-side rendering to image** - Rechazado: over-engineering extremo

### References
- [Next.js Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)

---

## Research Task 3: Konva Performance Optimization

### Question
¿Cómo optimizar múltiples instancias de Konva en una página (grid de catálogo)?

### Findings

**Performance Challenges**:
- 20-50 canvas instances en grid de catálogo
- Cada DesignRenderer crea Stage + Layer + Shapes
- Canvas consume memoria GPU
- Re-rendering innecesario puede causar lag

**Best Practices Identified**:

1. **Lazy Rendering** (Critical ⭐)
   - Solo renderizar canvas visibles en viewport
   - Usar Intersection Observer API
   - Reemplazar con placeholder hasta que sea visible

2. **Memoization** (Important ⭐)
   - `React.memo()` en DesignRenderer
   - Evitar re-renders cuando props no cambian
   - Usar `useMemo()` para cálculos de adaptación

3. **Proper Cleanup** (Critical ⭐)
   - Destruir Stage cuando componente unmount
   - Konva no auto-cleanup, puede causar memory leaks
   - Usar `useEffect` cleanup function

4. **Optimize Shape Count** (Nice-to-have)
   - Minimizar número de shapes por diseño (<50 shapes)
   - Combinar shapes similares cuando sea posible
   - Evitar gradientes complejos (usar fills sólidos)

5. **Disable Events for Static Designs** (Nice-to-have)
   - `listening={false}` en Stage si no hay interacción
   - Reduce overhead de event handling

### Decision

**Strategy**: Lazy rendering + Memoization + Proper cleanup

**Implementation**:

```typescript
'use client';

import { memo, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { useInView } from 'react-intersection-observer';

export const DesignRenderer = memo(function DesignRenderer({ 
  design, 
  width, 
  height 
}: DesignRendererProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stageRef.current?.destroy();
    };
  }, []);
  
  // Only render when visible
  if (!inView) {
    return <div ref={ref} className="skeleton" />;
  }
  
  return (
    <div ref={ref}>
      <Stage 
        ref={stageRef}
        width={width} 
        height={height}
        listening={false} // Static design, no events needed
      >
        <Layer>
          {/* Shapes rendered only when visible */}
        </Layer>
      </Stage>
    </div>
  );
});
```

**Dependencies**:
- `react-intersection-observer` - Para lazy rendering (ya usado en proyecto)

**Alternatives Considered**:
- **Virtualización completa** - Rechazado: over-engineering, lazy rendering es suficiente
- **Canvas pooling** - Rechazado: complejidad extrema, beneficio marginal

### References
- [Konva Performance Tips](https://konvajs.org/docs/performance/All_Performance_Tips.html)
- [React Memo](https://react.dev/reference/react/memo)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

## Research Task 4: Parametric Design System

### Question
¿Cómo diseñar un sistema de diseños que se adapte dinámicamente a dimensiones del modelo?

### Findings

**Approaches Evaluated**:

1. **Proportional Scaling** (Simple ⭐)
   - Escalar todo el diseño proporcionalmente al aspect ratio
   - Mantener proporciones originales
   - Simple pero puede verse "estirado" en proporciones extremas

2. **Constraint-Based Layout** (Balanced ⭐⭐⭐)
   - Definir constraints: marcos tienen espesor mínimo/máximo
   - Vidrios llenan espacio disponible respetando constraints
   - Más natural visualmente, más complejo de implementar

3. **Template-Based with Variables** (Over-engineered)
   - Sistema completo de templates con expresiones matemáticas
   - Variables interpoladas en runtime
   - Demasiado complejo para necesidad actual

### Decision

**Elegido**: Constraint-Based Layout con reglas simples

**Rationale**:
- Balance entre realismo visual y complejidad de implementación
- Permite mantener espesores lógicos de marcos (no escalan linealmente)
- Vidrios se adaptan al espacio disponible
- Suficientemente flexible para diseños comunes (ventanas, puertas)

**Design Config Structure**:

```typescript
type DesignConfig = {
  id: string;
  name: string;
  type: ModelType;
  baseWidth: number;  // mm
  baseHeight: number; // mm
  
  // Constraint rules
  constraints: {
    frameThicknessMin: number; // mm
    frameThicknessMax: number; // mm
    glassMargin: number;       // mm from frame edge
  };
  
  // Shapes con parámetros adaptativos
  shapes: ShapeDefinition[];
};

type ShapeDefinition = {
  type: 'rect' | 'circle' | 'line';
  role: 'frame' | 'glass' | 'handle' | 'hinge';
  
  // Positioning: percentage-based (0-1) or absolute (mm)
  x: number | { type: 'percent'; value: number };
  y: number | { type: 'percent'; value: number };
  width: number | { type: 'percent'; value: number } | { type: 'fill' };
  height: number | { type: 'percent'; value: number } | { type: 'fill' };
  
  // Appearance
  fill?: string | { type: 'material' }; // 'material' → usa color del ProfileSupplier
  stroke?: string;
  strokeWidth?: number;
};
```

**Adaptation Algorithm**:

```typescript
function adaptDesign(
  design: DesignConfig,
  targetWidth: number,  // mm
  targetHeight: number, // mm
  material: MaterialType
): AdaptedDesign {
  const scaleX = targetWidth / design.baseWidth;
  const scaleY = targetHeight / design.baseHeight;
  
  return {
    shapes: design.shapes.map(shape => ({
      ...shape,
      x: adaptDimension(shape.x, targetWidth, scaleX),
      y: adaptDimension(shape.y, targetHeight, scaleY),
      width: adaptDimension(shape.width, targetWidth, scaleX, design.constraints),
      height: adaptDimension(shape.height, targetHeight, scaleY, design.constraints),
      fill: shape.fill === 'material' ? getMaterialColor(material) : shape.fill,
    })),
  };
}

function adaptDimension(
  dim: ShapeDefinition['width'],
  targetSize: number,
  scale: number,
  constraints?: DesignConfig['constraints']
): number {
  if (typeof dim === 'number') {
    // Absolute value with constraints
    const scaled = dim * scale;
    if (constraints) {
      return clamp(scaled, constraints.frameThicknessMin, constraints.frameThicknessMax);
    }
    return scaled;
  }
  
  if (dim.type === 'percent') {
    return targetSize * dim.value;
  }
  
  if (dim.type === 'fill') {
    // Fill available space (used for glass panels)
    return targetSize - (constraints?.glassMargin ?? 0) * 2;
  }
  
  return 0;
}
```

**Alternatives Considered**:
- **Proportional scaling only** - Rechazado: marcos muy delgados/gruesos en proporciones extremas
- **Template engine completo** - Rechazado: over-engineering, no necesario para MVP

### References
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) - Inspiración para constraint system
- [Konva Shapes](https://konvajs.org/docs/shapes/Rect.html) - API reference

---

## Research Task 5: Design JSON Structure Best Practices

### Question
¿Cuál es la mejor estructura JSON para almacenar diseños adaptables en la base de datos?

### Findings

**Requirements**:
- Serializable a JSON (Prisma Json field)
- Versionable (futuras mejoras no rompen diseños existentes)
- Legible para debugging
- Eficiente (<50KB por diseño)
- Soporta parametrización (ver Task 4)

**Structure Options**:

1. **Flat Array of Shapes** (Too Simple)
   - Solo lista de shapes con propiedades
   - No soporta bien parametrización ni constraints

2. **Hierarchical with Metadata** (Recommended ⭐)
   - Metadata del diseño (tipo, constraints, versión)
   - Array de shapes con roles y reglas de adaptación
   - Versionado explícito para migración futura

3. **SVG-Like Path Notation** (Over-engineered)
   - Usar notación tipo SVG path
   - Muy compacto pero difícil de mantener/debuggear

### Decision

**Elegido**: Hierarchical with Metadata (Option 2)

**Final Structure**:

```typescript
type StoredDesignConfig = {
  version: '1.0'; // For future migrations
  
  metadata: {
    id: string;
    name: string;
    description: string;
    type: ModelType;
    author?: string;
    createdAt?: string;
  };
  
  dimensions: {
    baseWidth: number;  // mm
    baseHeight: number; // mm
  };
  
  constraints: {
    frameThicknessMin: number; // mm
    frameThicknessMax: number; // mm
    glassMargin: number;       // mm
  };
  
  shapes: Array<{
    id: string; // For debugging
    type: 'rect' | 'circle' | 'line' | 'path';
    role: 'frame' | 'glass' | 'handle' | 'hinge' | 'decorative';
    layer: number; // Z-index (frames=0, glass=1, handles=2)
    
    // Positioning (support both absolute mm and relative %)
    position: {
      x: number | { percent: number };
      y: number | { percent: number };
    };
    
    size: {
      width: number | { percent: number } | 'fill';
      height: number | { percent: number } | 'fill';
    };
    
    // Appearance
    style: {
      fill?: string | 'material'; // 'material' → MaterialColorMapping
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
      cornerRadius?: number; // For rects
    };
  }>;
};
```

**Example - Simple Fixed Window**:

```json
{
  "version": "1.0",
  "metadata": {
    "id": "fixed-window-simple",
    "name": "Ventana Fija Simple",
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
        "stroke": "#000",
        "strokeWidth": 2
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
        "opacity": 0.7
      }
    }
  ]
}
```

**Validation Strategy**:
- Zod schema para validar estructura en runtime
- TypeScript types para type safety en compile time
- Versioning permite migración futura sin romper diseños existentes

**Alternatives Considered**:
- **Flat structure** - Rechazado: no escalable para diseños complejos
- **SVG paths** - Rechazado: difícil de mantener, no intuitivo

### References
- [JSON Schema](https://json-schema.org/) - Validation patterns
- [Zod](https://zod.dev/) - Runtime validation

---

## Summary of Decisions

| Topic                 | Decision                     | Key Rationale                                                          |
| --------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| **Canvas Library**    | Konva + react-konva          | Estándar React, API declarativa, excelente performance                 |
| **SSR Strategy**      | Client Component boundaries  | Simple, no requiere dynamic imports, Server Component pre-fetch data   |
| **Performance**       | Lazy rendering + Memoization | Intersection Observer para visibilidad, React.memo previene re-renders |
| **Parametric System** | Constraint-based layout      | Balance realismo/complejidad, mantiene espesores lógicos               |
| **JSON Structure**    | Hierarchical with metadata   | Versionable, debuggeable, soporta adaptación compleja                  |

**No Unresolved NEEDS CLARIFICATION** - All technical unknowns have been researched and decided.

---

## Next Steps

1. ✅ Research complete
2. → Proceed to **Phase 1**: Design data model and API contracts
3. → Generate `data-model.md`, `contracts/`, `quickstart.md`
4. → Update agent context with new technologies (Konva, react-konva)
