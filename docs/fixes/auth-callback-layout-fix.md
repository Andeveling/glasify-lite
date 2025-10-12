# Fix: Auth Callback Layout Issue

## Problema Identificado

Cuando un usuario completaba el login con Google, la página `/auth/callback` mostraba el layout completo de autenticación (fondo púrpura, branding, "Volver al catálogo") antes de redirigir al usuario a su destino final.

### Captura del Problema

```
┌────────────────────────────────────────────────────┐
│  GLASIFY (fondo púrpura)                          │
│                                                    │
│  "Cotización inteligente de productos             │
│   de vidrio para fabricantes..."                  │
│                                                    │
│  [Volver al catálogo]                             │
│                                                    │
└────────────────────────────────────────────────────┘
```

**UX Impact**: El usuario veía un flash de contenido innecesario antes de ser redirigido.

---

## Causa Raíz

La página de callback estaba ubicada en:
```
src/app/(auth)/auth/callback/page.tsx
```

Al estar dentro del grupo de rutas `(auth)`, heredaba el layout:
```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <div className="...grid lg:grid-cols-2...">
      {/* Left side - Branding con fondo púrpura */}
      <div className="bg-primary">
        <p>"Cotización inteligente..."</p>
      </div>
      
      {/* Right side - Auth Forms */}
      <div>{children}</div>
    </div>
  );
}
```

Este layout se renderizaba **antes** de que el `redirect()` en el Server Component tomara efecto.

---

## Solución Implementada

### 1. Mover Callback Fuera del Grupo `(auth)`

**Nueva ubicación**:
```
src/app/auth/callback/page.tsx  ← Sin paréntesis (no es route group)
```

**Beneficio**: No hereda el layout de `(auth)`, evita renderizado innecesario.

### 2. Crear Layout Minimalista

**Archivo**: `src/app/auth/callback/layout.tsx`

```typescript
export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  );
}
```

**Características**:
- ✅ Layout simple, sin branding
- ✅ Solo un contenedor centrado
- ✅ Fondo neutral (bg-background)
- ✅ No muestra contenido innecesario

### 3. Mejorar Página de Callback (Opcional)

Agregar un loader por si acaso (aunque redirect es instantáneo):

```typescript
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage() {
  const session = await auth();
  
  // Redirects...
}

// Fallback (rara vez se muestra)
export function Loading() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Redirigiendo...</p>
    </div>
  );
}
```

---

## Resultado

### Antes 🔴
```
Login → /auth/callback (muestra layout púrpura completo) → Flash → Redirect
```

### Ahora ✅
```
Login → /auth/callback (layout minimalista) → Redirect instantáneo
```

**UX Mejorado**:
- ❌ Sin flash de contenido innecesario
- ✅ Redirección más fluida
- ✅ Mejor percepción de velocidad

---

## Estructura de Archivos

```
src/app/
├── (auth)/                    ← Route group
│   ├── layout.tsx            ← Layout con branding (solo para signin)
│   └── signin/
│       ├── page.tsx
│       └── _components/
│           └── signin-page-client.tsx
│
└── auth/                      ← NO es route group
    └── callback/             ← Sin layout de (auth)
        ├── layout.tsx        ← Layout minimalista
        └── page.tsx          ← Server Component que redirige
```

**Key Difference**:
- `(auth)/` → Route group, aplica layout compartido
- `auth/` → Ruta normal, NO hereda layout de `(auth)`

---

## Testing

### Manual

1. Login con Google
2. Verificar que NO se vea el fondo púrpura
3. Verificar redirección inmediata a dashboard o my-quotes

### E2E (Playwright)

```typescript
test('callback redirects without showing auth layout', async ({ page }) => {
  // Mock OAuth login
  await page.goto('/signin');
  await page.click('text=Continuar con Google');
  
  // Should redirect without showing purple background
  await page.waitForURL(/\/(dashboard|my-quotes)/);
  
  // Should NOT have seen auth layout
  const purpleBackground = page.locator('.bg-primary');
  expect(await purpleBackground.isVisible()).toBe(false);
});
```

---

## Lecciones Aprendidas

### Next.js Route Groups

**`(folder)/`** → Route group, hereda layouts
- Útil para: Compartir layouts entre rutas relacionadas
- Ejemplo: `(auth)/signin`, `(auth)/signup`

**`folder/`** → Ruta normal
- Útil para: Rutas que NO deben heredar el layout del grupo
- Ejemplo: `auth/callback` (solo redirige, no necesita UI)

### Server Component Redirects

`redirect()` en Server Components es **inmediato** pero el layout se renderiza antes del redirect si el componente está dentro del árbol de layouts.

**Solución**: Minimizar layout o usar una ruta sin layout para redirects puros.

---

## Archivos Modificados

- ✅ Movido: `src/app/(auth)/auth/callback/page.tsx` → `src/app/auth/callback/page.tsx`
- ✅ Creado: `src/app/auth/callback/layout.tsx` (layout minimalista)
- ✅ Actualizado: Documentación en `docs/fixes/`

---

## Comandos Ejecutados

```bash
# Crear nuevo directorio
mkdir -p src/app/auth/callback

# Mover página de callback
mv src/app/\(auth\)/auth/callback/page.tsx src/app/auth/callback/page.tsx

# Eliminar directorio vacío
rm -rf src/app/\(auth\)/auth
```

---

## Referencias

- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Server Component Redirects](https://nextjs.org/docs/app/api-reference/functions/redirect)
