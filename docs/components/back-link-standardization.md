# BackLink Component - Estandarización de Navegación

**Fecha**: 2025-10-18  
**Tipo**: Component UI  
**Estado**: ✅ Implementado

## Descripción

Componente UI estandarizado para botones de navegación "Volver a...". Reemplaza implementaciones inconsistentes de botones de regreso en toda la aplicación.

## Problema

Antes de esta implementación, los botones de "Volver" tenían múltiples implementaciones:

```tsx
// Variante 1: Con Link + Button + ChevronLeft
<Link href="/catalog">
  <Button className="mb-4" size="sm" variant="ghost">
    <ChevronLeft className="mr-2 size-4" />
    Volver al Catálogo
  </Button>
</Link>

// Variante 2: Con Button asChild + Link + ArrowLeft
<Button asChild size="sm" variant="outline">
  <Link href="/quotes">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Volver a cotizaciones
  </Link>
</Button>

// Variante 3: Con variant="link"
<Button asChild size="sm" variant="link">
  <Link href="/catalog">Volver al catálogo</Link>
</Button>
```

Esto resultaba en:
- ❌ Inconsistencia visual
- ❌ Código duplicado
- ❌ Difícil mantenimiento
- ❌ UX inconsistente

## Solución

Componente `BackLink` que encapsula toda la lógica de navegación hacia atrás:

### Ubicación
```
src/components/ui/back-link.tsx
```

### API del Componente

```tsx
type BackLinkProps = {
  /** Target URL for navigation */
  href: string;
  /** Link text content */
  children: React.ReactNode;
  /** Icon variant to display */
  icon?: 'arrow' | 'chevron' | 'none';
  /** Button variant style */
  variant?: 'ghost' | 'outline' | 'link';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
};
```

### Ejemplos de Uso

#### 1. Navegación estándar (ghost con chevron)
```tsx
<BackLink href="/catalog" icon="chevron">
  Volver al Catálogo
</BackLink>
```

#### 2. Navegación con outline (arrow)
```tsx
<BackLink href="/quotes" variant="outline">
  Volver a cotizaciones
</BackLink>
```

#### 3. Link simple sin icono
```tsx
<BackLink href="/catalog" icon="none" variant="link">
  Volver al catálogo
</BackLink>
```

#### 4. Con clases personalizadas
```tsx
<BackLink className="mb-4" href="/catalog" icon="chevron">
  Volver al Catálogo
</BackLink>
```

## Iconos Disponibles

- **`arrow`** (default): `<ArrowLeft />` - Flecha estilo navegación
- **`chevron`**: `<ChevronLeft />` - Chevron estilo menú
- **`none`**: Sin icono

## Variantes de Estilo

- **`ghost`** (default): Fondo transparente, hover con fondo sutil
- **`outline`**: Borde visible, para mayor énfasis
- **`link`**: Estilo de enlace de texto

## Archivos Migrados

### ✅ Implementados

1. **Auth Layout** - `/src/app/(auth)/layout.tsx`
   - Link simple sin icono
   - Variant: `link`

2. **My Quotes Page** - `/src/app/(public)/my-quotes/page.tsx`
   - Botón con chevron
   - Variant: `ghost`

3. **Quote Detail (Public)** - `/src/app/(public)/my-quotes/[quoteId]/_components/quote-detail-view.tsx`
   - Botón con arrow
   - Variant: `outline`

4. **Quote Detail (Dashboard)** - `/src/app/(dashboard)/quotes/[quoteId]/_components/quote-detail-view.tsx`
   - Botón con arrow
   - Variant: `outline`

5. **Catalog Error** - `/src/app/(public)/catalog/[modelId]/error.tsx`
   - Botón sin icono (usa Home icon interno)
   - Variant: `outline`

### 📋 Pendientes de Migrar

- `/src/app/(auth)/error.tsx`
- `/src/app/(auth)/not-found.tsx`
- `/src/app/(dashboard)/not-found.tsx`
- `/src/app/(public)/not-found.tsx`
- `/src/components/back-button.tsx` (deprecar)

## Beneficios

✅ **Consistencia**: Todos los botones de "Volver" tienen el mismo comportamiento  
✅ **DRY**: Código centralizado en un solo componente  
✅ **Mantenibilidad**: Cambios se aplican globalmente  
✅ **UX**: Experiencia de usuario uniforme  
✅ **Accesibilidad**: Props consistentes y semántica correcta  
✅ **TypeScript**: Props fuertemente tipadas  
✅ **Flexibilidad**: Múltiples variantes para diferentes contextos

## Principios de Diseño Aplicados

1. **Don't Make Me Think**: Navegación predecible y consistente
2. **Atomic Design**: Componente atómico reutilizable
3. **Single Responsibility**: Solo maneja navegación hacia atrás
4. **Open/Closed**: Abierto para variantes, cerrado para modificaciones core

## Testing

### Unit Tests (Pendiente)
```tsx
describe('BackLink', () => {
  it('renders with arrow icon by default', () => {
    // Test
  });

  it('renders with chevron icon when specified', () => {
    // Test
  });

  it('renders without icon when icon="none"', () => {
    // Test
  });

  it('applies correct variant classes', () => {
    // Test
  });
});
```

### E2E Tests (Existentes)
Los tests E2E existentes ya validan la navegación:
- `e2e/catalog/catalog.spec.ts`
- `e2e/quotes/quote-detail-view.spec.ts`
- `e2e/my-quotes/*.spec.ts`

## Migración de Código Antiguo

### Antes
```tsx
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

<Link href="/catalog">
  <Button className="mb-4" size="sm" variant="ghost">
    <ChevronLeft className="mr-2 size-4" />
    Volver al Catálogo
  </Button>
</Link>
```

### Después
```tsx
import { BackLink } from '@/components/ui/back-link';

<BackLink className="mb-4" href="/catalog" icon="chevron">
  Volver al Catálogo
</BackLink>
```

**Reducción**: 6 líneas → 3 líneas (-50%)

## Notas de Implementación

- Usa `class-variance-authority` (CVA) para gestión de variantes
- Compatible con Next.js 15 App Router
- Server Component por defecto (no requiere `'use client'`)
- Integración nativa con `next/link` para navegación optimizada
- Iconos de `lucide-react`

## Referencias

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **UI Principles**: `.github/instructions/dont-make-me-think.instructions.md`
- **Atomic Design**: Docs de arquitectura del proyecto
