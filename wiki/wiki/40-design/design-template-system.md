# DesignTemplate System

**Summary**: Sistema de templates de diseño para generar SVGs dinámicos de ventanas — reemplaza SVGs estáticos con renderizado React basado en patrones.

**Sources**: `(source: raw/superpowers/specs/2026-04-12-design-template-system.md)`

**Last updated**: 2026-04-13

---

## Problema

Modelos usan `imageUrl` con SVGs estáticos generados en Inkscape. Cada modelo necesita un SVG manual, no hay consistencia visual entre patrones similares, y no se refleja dinámicamente el color del perfil ni del vidrio.

## Solución

`DesignTemplate` como entidad que define un patrón de paneles (`XX`, `XO`, `XXO`) y un renderer React que genera SVGs dinámicos.

## Arquitectura

```
DesignTemplate (DB)
  ├── pattern: string ("XX", "XO", "XXO")
  ├── frameConfig: JSON { thickness, profileStyle }
  ├── showArrows: boolean
  ├── showHandles: boolean
  └── models[] → Model

Model
  ├── designTemplateId → DesignTemplate
  ├── ModelColor[] → Color (hexCode)
  └── GlassType.colorHex (vidrio)
```

## Pattern Syntax

| Char | Significado |
|------|-------------|
| `X` | Panel móvil |
| `O` | Panel fijo |

Ejemplos: `X` (1 fijo), `XX` (2 móviles), `XO` (1 móvil + 1 fijo), `XXO` (3 paños)

## Schema (ya en prisma/schema.prisma)

```prisma
model DesignTemplate {
  id          String  @id @default(cuid())
  name        String  @unique  // "Corredera 2 hojas"
  pattern     String            // "XX", "XO", "XXO"
  frameConfig String            // JSON { thickness, profileStyle }
  showArrows  Boolean @default(true)
  showHandles Boolean @default(true)
  models      Model[]
}
```

## Domain Types

```ts
// src/domain/design/types.ts
export type PanelType = 'movable' | 'fixed';

export interface PanelDescriptor {
  index: number;
  type: PanelType;
  ratio: number;  // Proporción del ancho (ej: 0.5 para XX)
}

export interface DesignRenderProps {
  template: DesignTemplateConfig;
  frameColor?: string;   // Default: #e6e6e6
  glassColor?: string;    // Default: #87CEEB
  dimensions?: { widthMm: number; heightMm: number };
  size?: { width: number; height: number };
  showDimensions?: boolean;
}
```

## Componente: DesignRenderer

```tsx
// src/components/design/design-renderer.tsx
interface DesignRendererProps extends DesignRenderProps {
  className?: string;
}

export function DesignRenderer(props: DesignRendererProps): JSX.Element;
```

Genera SVG con:
- Marco exterior
- Divisiones entre paneles
- Vidrios (rects con fill + opacity)
- Handles (elipses en paneles X)
- Flechas de dirección (paths en paneles X)

## Migration Phases

1. **Infrastructure**: Schema + Domain types + DesignRenderer
2. **Admin CRUD**: `/admin/design-templates`
3. **Data Migration**: Seeder base + script de mapeo (no automático)
4. **Adoption**: Nuevos modelos usan template

## Edge Cases

| Caso | Manejo |
|------|--------|
| Sin DesignTemplate | Usa imageUrl como fallback |
| Sin colorHex | Default `#87CEEB` |
| Sin ModelColor | Marco usa `#e6e6e6` |
| Pattern inválido | Validación: solo X y O |

## Related pages

- [[prd]]
- [[entities]]
