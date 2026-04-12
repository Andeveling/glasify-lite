# Design Spec: DesignTemplate System

**Date**: 2026-04-12  
**Status**: Draft — awaiting review  
**Feature**: Code-generated window design templates replacing static SVGs

---

## Problem

Modelos en Glasify Lite usan `imageUrl` con SVGs estáticos generados en Inkscape. Cada modelo necesita un SVG manual, no hay consistencia visual entre modelos con patrones similares (ej: todos los "XX" se ven iguales pero requieren archivos separados), y no hay forma de reflejar dinámicamente el color del perfil ni del vidrio seleccionado por el cliente.

## Solution

Introducir `DesignTemplate` como entidad que define un patrón de paneles (`XX`, `XO`, `XXO`, etc.) y un renderer React que genera SVGs dinámicos interpretando el patrón con los datos del modelo, color y vidrio.

---

## Architecture

```
DesignTemplate (DB)
  ├── pattern: string ("XX", "XO", "XXO")
  ├── frameConfig: JSON (frame thickness, style)
  ├── showArrows: boolean
  ├── showHandles: boolean
  └── models[] → Model (1:N)

Model
  ├── designTemplateId → DesignTemplate
  ├── ModelColor[] → Color (hexCode para el marco)
  └── GlassType (nuevo campo colorHex para el vidrio)

DesignRenderer (React component)
  └── Interpreta DesignTemplate + Color + GlassType → SVG dinámico
```

---

## Schema Changes

### New: `DesignTemplate`

```prisma
model DesignTemplate {
  id              String   @id @default(cuid())
  /// Nombre legible: "Corredera 2 hojas", "Fija + Corredera"
  name            String   @unique
  /// Patrón de paneles: X=móvil, O=fijo (ej: "XX", "XO", "OX", "XXO")
  pattern         String
  /// Configuración visual del frame: { thickness: number, profileStyle: string }
  frameConfig     String
  /// Mostrar flechas de apertura en paneles X
  showArrows      Boolean  @default(true)
  /// Mostrar handles en paneles X
  showHandles     Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  models          Model[]

  @@index([name])
}
```

### Modify: `Model`

```prisma
// Agregar campo:
designTemplateId String?
designTemplate   DesignTemplate? @relation(fields: [designTemplateId], references: [id])

// imageUrl se mantiene como fallback durante la transición
```

### Modify: `GlassType`

```prisma
// Agregar campo:
/// Hex color for visualization (#RRGGBB). Default: "#87CEEB" (azul claro)
colorHex String @default("#87CEEB")
```

### `frameConfig` JSON structure

Se guarda como string en Prisma (`JSON.stringify`), se parsea en el dominio:

```ts
interface FrameConfig {
  thickness: number;       // Grosor del marco en px del SVG (default: 4)
  profileStyle: 'simple' | 'double' | 'premium'; // Estilo visual del perfil
  profileColor?: string;   // Hex opcional, override del color del modelo
}
```

---

## Domain Types

### `src/domain/design/types.ts`

```ts
export type PanelType = 'movable' | 'fixed';

export interface PanelDescriptor {
  index: number;
  type: PanelType;
  ratio: number; // Proporción del ancho total (ej: 0.5 para XX)
}

export interface FrameConfig {
  thickness: number;
  profileStyle: 'simple' | 'double' | 'premium';
  profileColor?: string;
}

export interface DesignTemplateConfig {
  id: string;
  name: string;
  pattern: string; // "XX", "XO", "XXO"
  frameConfig: FrameConfig;
  showArrows: boolean;
  showHandles: boolean;
}

export interface DesignRenderProps {
  template: DesignTemplateConfig;
  /** Color del marco (del ModelColor seleccionado). Default: #e6e6e6 */
  frameColor?: string;
  /** Color del vidrio (del GlassType.colorHex). Default: #87CEEB */
  glassColor?: string;
  /** Dimensiones reales del modelo en mm (para aspect ratio). Opcional */
  dimensions?: { widthMm: number; heightMm: number };
  /** Tamaño del SVG en px */
  size?: { width: number; height: number };
  /** Si mostrar dimensiones en el SVG */
  showDimensions?: boolean;
}
```

### `src/domain/design/parse-pattern.ts`

```ts
/**
 * Parsea un patrón como "XXO" en PanelDescriptor[]
 * Distribuye el ancho equitativamente entre paneles.
 */
export function parsePattern(pattern: string): PanelDescriptor[];
```

---

## Component: DesignRenderer

### `src/components/design/design-renderer.tsx`

```tsx
interface DesignRendererProps extends DesignRenderProps {
  className?: string;
}

/**
 * Genera un SVG dinámico basado en un DesignTemplate.
 *
 * El SVG incluye:
 * - Marco exterior (rect con stroke)
 * - Divisiones entre paneles (líneas verticales)
 * - Vidrios (rects con fill del glassColor, opacidad 60%)
 * - Handles (elipses en paneles movables)
 * - Flechas de dirección (paths con marker en paneles movables)
 * - Dimensiones opcionales (líneas con texto)
 */
export function DesignRenderer(props: DesignRendererProps): JSX.Element;
```

### Estructura del SVG generado

```svg
<svg viewBox="0 0 {width} {height}">
  <!-- Marco exterior -->
  <rect x="2" y="2" width="{w-4}" height="{h-4}" fill="none" stroke="{frameColor}" stroke-width="{thickness}" />

  <!-- Vidrios por panel -->
  <rect x="{panelX}" y="{innerY}" width="{panelW}" height="{innerH}" fill="{glassColor}" opacity="0.6" />

  <!-- Handles (paneles X) -->
  <ellipse cx="{handleX}" cy="{h/2}" rx="4" ry="12" fill="{frameColor}" />

  <!-- Flechas (paneles X) -->
  <path d="M {arrowStart} L {arrowEnd}" stroke="{frameColor}" marker-end="url(#arrow)" />

  <!-- Dimensiones (opcional) -->
  <line x1="{dimX}" ... />
  <text>{widthMm}</text>
</svg>
```

---

## Admin UI

### Page: `/admin/design-templates`

- Listar templates existentes
- Crear nuevo template con:
  - Campo `name`
  - Selector de `pattern` (input text con validación: solo X y O)
  - Checkboxes: `showArrows`, `showHandles`
  - Preview en vivo con `DesignRenderer`
- Editar/Eliminar templates

### Integration in Model Form

En el form de modelo (`/admin/models/[id]/edit`):
- Dropdown para seleccionar `DesignTemplate`
- Preview en vivo del `DesignRenderer` con:
  - El color default del modelo
  - El color del vidrio del glassType compatible
  - Las dimensiones min/max del modelo

---

## Migration Strategy

### Phase 1: Infrastructure
1. Schema migration (DesignTemplate, Model.designTemplateId, GlassType.colorHex)
2. Domain types (parse-pattern, types)
3. DesignRenderer component

### Phase 2: Admin CRUD
4. Admin page `/admin/design-templates`
5. Integration in model form (dropdown + preview)

### Phase 3: Data Migration

6. Seeder que crea templates base: `XX`, `XO`, `OX`, `XXO`, `X`, `O`
7. Script de mapeo que sugiere templates para modelos existentes basado en heurísticas:
   - Modelos con nombre que contiene "corredera" + "2" → `XX`
   - Modelos con "fija" + "corredera" → `XO`
   - El script **no aplica cambios automáticamente** — genera un reporte CSV para revisión manual
   - El admin asigna manualmente desde el model form
8. `imageUrl` se mantiene como fallback — no se elimina

### Phase 4: Adoption
9. Los nuevos modelos usan DesignTemplate
10. Los existentes migran gradualmente

---

## Edge Cases

| Caso | Manejo |
|------|--------|
| Modelo sin DesignTemplate | Usa imageUrl como fallback (comportamiento actual) |
| GlassType sin colorHex | Default a `#87CEEB` (azul claro) |
| Modelo sin ModelColor | Marco usa `#e6e6e6` (gris claro) |
| Pattern inválido (ej: "ABC") | Validación en el form — solo acepta X y O |
| Pattern vacío | No permitido — mínimo 1 panel |
| Modelo con dimensiones 0 | SVG usa aspect ratio 4:3 por defecto |

---

## Files to Create/Modify

### New files
```
prisma/migrations/<timestamp>_add_design_templates/
src/domain/design/types.ts
src/domain/design/parse-pattern.ts
src/domain/design/index.ts
src/components/design/design-renderer.tsx
src/components/design/index.ts
src/app/(dashboard)/admin/design-templates/page.tsx
src/app/(dashboard)/admin/design-templates/_components/template-form.tsx
src/app/(dashboard)/admin/design-templates/_components/template-list.tsx
```

### Modified files
```
prisma/schema.prisma           # Add DesignTemplate, Model.designTemplateId, GlassType.colorHex
src/server/api/routers/...     # CRUD routers for DesignTemplate
src/app/(dashboard)/admin/models/_components/model-form.tsx  # Add template selector
```

---

## tRPC Routers

### `src/server/api/routers/design-template.router.ts`

```ts
// Queries
designTemplate.list          → DesignTemplate[]
designTemplate.getById       → DesignTemplate
designTemplate.getByPattern  → DesignTemplate[]

// Mutations
designTemplate.create        → DesignTemplate
designTemplate.update        → DesignTemplate
designTemplate.delete        → void
```

---

## Validation

### Pattern validation
- Solo caracteres `X` y `O`
- Mínimo 1 carácter, máximo 10
- Al menos una `X` (un diseño con todo fijo no tiene sentido como template de ventana operativa)

```ts
const PATTERN_REGEX = /^[XO]+$/;
const hasAtLeastOneMovable = (pattern: string) => pattern.includes('X');
```

---

## Testing

- Unit: `parsePattern("XX")` → `[{index:0,type:'movable',ratio:0.5}, {index:1,type:'movable',ratio:0.5}]`
- Unit: `parsePattern("XO")` → `[{index:0,type:'movable',ratio:0.5}, {index:1,type:'fixed',ratio:0.5}]`
- Component: `DesignRenderer` renders correct number of panels
- E2E: Admin can create template → see preview → save → assign to model

---

## Notes

- `imageUrl` se mantiene en `Model` como fallback durante la transición. No se elimina en esta iteración.
- `compatibleGlassTypeIds` sigue siendo JSON string (deuda arquitectónica conocida).
- Los seeders existentes no se modifican — se agrega un seeder nuevo para DesignTemplates.
