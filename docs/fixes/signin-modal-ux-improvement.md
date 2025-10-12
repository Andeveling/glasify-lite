# Sign In Modal - UX Improvement

## Descripción General

Migración de la página completa de Sign In (`/signin`) a un modal ligero que mejora significativamente la UX siguiendo los principios de "Don't Make Me Think".

### Antes 🔴
- Página completa dedicada al login
- Usuario pierde contexto de donde estaba
- Navegación interrumpida
- Sensación de "salir" de la aplicación

### Ahora ✅
- Modal overlay sobre contenido existente
- Usuario mantiene contexto visual
- Login no invasivo
- Regresa fácilmente cerrando el modal

---

## Componentes Creados

### 1. `<SignInModal />` - Modal Reutilizable

**Ubicación**: `src/components/signin-modal.tsx`

**Props**:
```typescript
type SignInModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
};
```

**Características**:
- ✅ Dialog de shadcn/ui (accesible, responsive)
- ✅ Login con Google OAuth (botón prominente)
- ✅ Input de email (preparado para magic links futuros)
- ✅ Botón "Continuar" con loading states
- ✅ Link a registro (preparado para futuras implementaciones)
- ✅ Diseño limpio inspirado en Precedent (imagen de referencia)

**Flujo de Autenticación**:
1. Usuario hace clic en "Continuar con Google"
2. Google OAuth flow
3. Redirección a `/auth/callback`
4. Callback determina role y redirige (admin → `/dashboard`, user → `/my-quotes`)

---

### 2. `useSignInModal()` - Custom Hook

**Ubicación**: `src/hooks/use-signin-modal.ts`

**API**:
```typescript
const { isOpen, open, close, toggle, setIsOpen } = useSignInModal();
```

**Uso**:
```typescript
'use client';

import { useSignInModal } from '@/hooks/use-signin-modal';
import { SignInModal } from '@/components/signin-modal';

export function MyComponent() {
  const { isOpen, open, close } = useSignInModal();

  return (
    <>
      <button onClick={open}>Iniciar Sesión</button>
      <SignInModal open={isOpen} onOpenChange={close} />
    </>
  );
}
```

---

### 3. **`<SignInPageClient />`** - Fallback Page

**Ubicación**: `src/app/(auth)/signin/_components/signin-page-client.tsx`

**Propósito**: 
- Mantener `/signin` como ruta válida (para SEO, bookmarks, email links)
- Abre el modal automáticamente
- Redirige a `/catalog` al cerrar

**Nota sobre Callback**: La ruta `/auth/callback` está **fuera** del grupo `(auth)` en `src/app/auth/callback/` para evitar que el layout de autenticación se renderice antes del redirect.

**Comportamiento**:
```
/signin → Modal abre automáticamente → Cerrar modal → Redirect /catalog
```

---

### 4. `GuestMenu` - Actualizado

**Archivo**: `src/app/(public)/_components/_layout/guest-menu.tsx`

**Cambios**:
- ❌ Removido `<Link href="/signin">`
- ✅ Agregado estado local para modal
- ✅ Click en "Iniciar Sesión" → Abre modal

**Antes**:
```tsx
<Link href="/signin">Iniciar Sesión</Link>
```

**Ahora**:
```tsx
const [showSignInModal, setShowSignInModal] = useState(false);

<DropdownMenuItem onClick={() => setShowSignInModal(true)}>
  Iniciar Sesión
</DropdownMenuItem>

<SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />
```

---

## Beneficios UX (Don't Make Me Think)

### 1. **Menor Carga Cognitiva**
- ✅ Usuario no pierde contexto de página actual
- ✅ Overlay oscuro mantiene referencia visual
- ✅ Modal centrado, fácil de ignorar si cambia de opinión

### 2. **Flujo Natural**
- ✅ Ver producto → Quiere cotizar → Login modal → Vuelve a producto
- ✅ No hay navegación extra innecesaria

### 3. **Opciones Claras**
- ✅ "Continuar con Google" - prominente, acción principal
- ✅ Input de email - secundario pero visible
- ✅ "Regístrate" - terciario, no intrusivo

### 4. **Feedback Inmediato**
- ✅ Loading spinners en botones
- ✅ Estados disabled mientras procesa
- ✅ Cierre fácil (X, ESC, click fuera)

---

## Implementación Técnica

### Arquitectura

```
GuestMenu (Client Component)
├── useState(showSignInModal)
├── DropdownMenu (shadcn/ui)
│   └── "Iniciar Sesión" onClick → setShowSignInModal(true)
└── SignInModal (Client Component)
    ├── Dialog (shadcn/ui - accessible)
    ├── Google OAuth Button
    ├── Email Input
    └── Continue Button
```

### Estados del Modal

| Estado     | Trigger                             | Acción                     |
| ---------- | ----------------------------------- | -------------------------- |
| **Abrir**  | Click "Iniciar Sesión" en GuestMenu | `setShowSignInModal(true)` |
| **Abrir**  | Navegar a `/signin` directamente    | `useState(true)` en mount  |
| **Cerrar** | Click X / ESC / Click fuera         | `onOpenChange(false)`      |
| **Cerrar** | Login exitoso                       | Google OAuth redirect      |

---

## Uso en Otros Componentes

### Desde Cualquier Componente Cliente

```tsx
'use client';

import { useState } from 'react';
import { SignInModal } from '@/components/signin-modal';

export function MyFeature() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Necesitas login
      </button>

      <SignInModal 
        open={showModal} 
        onOpenChange={setShowModal}
        defaultEmail="user@example.com" // opcional
      />
    </>
  );
}
```

### Desde Cart Summary (Ejemplo Real)

```tsx
// src/app/(public)/cart/_components/cart-summary.tsx

'use client';

import { useState } from 'react';
import { SignInModal } from '@/components/signin-modal';

export function CartSummary() {
  const [showSignIn, setShowSignIn] = useState(false);

  const handleCheckout = async () => {
    if (!session) {
      setShowSignIn(true); // Abre modal en lugar de redirect
      return;
    }
    
    // Continuar con checkout...
  };

  return (
    <>
      <button onClick={handleCheckout}>Finalizar Compra</button>
      <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
    </>
  );
}
```

---

## Mantenimiento de Ruta `/signin`

### Por Qué Mantenerla

1. **SEO**: Google puede haber indexado `/signin`
2. **Bookmarks**: Usuarios pueden tener bookmarked
3. **Email Links**: Links de emails antiguos siguen funcionando
4. **Deep Links**: Aplicaciones externas pueden apuntar aquí

### Comportamiento Actual

**Usuario No Autenticado**:
```
GET /signin → SignInPage → SignInPageClient → Modal abre automáticamente
```

**Usuario Ya Autenticado**:
```
GET /signin → auth() → redirect('/auth/callback') → Dashboard o My Quotes
```

**Modal Cerrado en `/signin`**:
```
Modal close → router.push('/catalog')
```

---

## Accesibilidad (a11y)

### Dialog Component (shadcn/ui)

- ✅ **Keyboard Navigation**: ESC para cerrar, Tab navigation
- ✅ **Focus Trap**: Focus queda dentro del modal
- ✅ **ARIA Labels**: `role="dialog"`, `aria-labelledby`, `aria-describedby`
- ✅ **Screen Reader**: Título y descripción anunciados

### Botones y Inputs

- ✅ **Labels explícitos**: `<Label htmlFor="email">`
- ✅ **States visibles**: disabled, loading spinners
- ✅ **SR-only text**: "Continuar con Google" para iconos
- ✅ **Autocomplete**: `autoComplete="email"`

---

## Testing

### E2E Tests Sugeridos

```typescript
// e2e/auth/signin-modal.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Sign In Modal', () => {
  test('opens modal from guest menu', async ({ page }) => {
    await page.goto('/catalog');
    
    // Click user menu
    await page.click('[aria-label="Menú de opciones"]');
    
    // Click "Iniciar Sesión"
    await page.click('text=Iniciar Sesión');
    
    // Verify modal opened
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Iniciar Sesión en Glasify')).toBeVisible();
  });

  test('closes modal on ESC key', async ({ page }) => {
    await page.goto('/signin');
    
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page).toHaveURL('/catalog');
  });

  test('shows loading state on Google sign in', async ({ page }) => {
    await page.goto('/signin');
    
    const googleButton = page.getByRole('button', { name: /google/i });
    await googleButton.click();
    
    // Should show spinner
    await expect(googleButton.locator('[data-icon="spinner"]')).toBeVisible();
  });
});
```

### Unit Tests

```typescript
// tests/unit/use-signin-modal.test.ts

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSignInModal } from '@/hooks/use-signin-modal';

describe('useSignInModal', () => {
  it('should initialize closed', () => {
    const { result } = renderHook(() => useSignInModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('should open modal', () => {
    const { result } = renderHook(() => useSignInModal());
    
    act(() => {
      result.current.open();
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useSignInModal());
    
    act(() => {
      result.current.open();
      result.current.close();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle modal', () => {
    const { result } = renderHook(() => useSignInModal());
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
```

---

## Próximos Pasos (Opcional)

### 1. Magic Link Authentication

Agregar soporte para email magic links:

```typescript
// En SignInModal
const handleEmailContinue = async () => {
  if (!email) return;
  
  setIsEmailLoading(true);
  
  // Send magic link
  await signIn('email', { email, redirect: false });
  
  // Show success message
  toast.success('Revisa tu email para el link de acceso');
};
```

### 2. Social Providers Adicionales

Agregar GitHub, Apple, etc.:

```typescript
// Agregar iconos a Icons component
export const Icons = {
  google: () => { /* ... */ },
  github: () => { /* ... */ },
  apple: () => { /* ... */ },
};

// En SignInModal
<div className="grid grid-cols-3 gap-3">
  <Button onClick={handleGoogleSignIn}>
    <Icons.google />
  </Button>
  <Button onClick={handleGitHubSignIn}>
    <Icons.github />
  </Button>
  <Button onClick={handleAppleSignIn}>
    <Icons.apple />
  </Button>
</div>
```

### 3. Remember Last Email

Guardar último email usado:

```typescript
const [email, setEmail] = useState(
  () => localStorage.getItem('lastEmail') || defaultEmail
);

const handleEmailChange = (value: string) => {
  setEmail(value);
  localStorage.setItem('lastEmail', value);
};
```

### 4. Error Handling

Mostrar errores inline:

```typescript
const [error, setError] = useState<string | null>(null);

const handleGoogleSignIn = async () => {
  try {
    setError(null);
    await signIn('google', { callbackUrl: '/auth/callback' });
  } catch (err) {
    setError('No pudimos iniciar sesión con Google. Intenta nuevamente.');
  }
};

// En JSX
{error && (
  <Alert variant="destructive">
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

---

## Comparación Visual

### Antes (Full Page)
```
┌────────────────────────────────────────┐
│                                        │
│           GLASIFY                      │
│      Panel de Administración           │
│                                        │
│   ┌──────────────────────────────┐    │
│   │  Bienvenido de nuevo         │    │
│   │                              │    │
│   │  Email: _______________      │    │
│   │  Password: ___________       │    │
│   │                              │    │
│   │  [Iniciar Sesión]            │    │
│   │  [Google]                    │    │
│   └──────────────────────────────┘    │
│                                        │
│      ¿Necesitas ayuda?                 │
│                                        │
└────────────────────────────────────────┘
```

### Ahora (Modal)
```
┌────────────────────────────────────────┐
│  [Catálogo de Productos]              │
│                                        │
│  ┌─────────────────────────┐          │
│  │ ╔═══════════════════╗   │          │
│  │ ║       (G)         ║   │          │
│  │ ║                   ║   │          │
│  │ ║ Iniciar Sesión    ║   │          │
│  │ ║ en Glasify        ║   │  Overlay│
│  │ ║                   ║   │  Oscuro │
│  │ ║ [Google]          ║   │          │
│  │ ║ ─────  o  ───── ║   │          │
│  │ ║ Email: ________  ║   │          │
│  │ ║ [Continuar →]    ║   │          │
│  │ ╚═══════════════════╝   │          │
│  └─────────────────────────┘          │
│                                        │
└────────────────────────────────────────┘
```

---

## Referencias

- [Don't Make Me Think - Steve Krug](https://www.sensible.com/dont-make-me-think/)
- [Modal vs Full Page Login - UX Research](https://uxdesign.cc/modal-vs-full-page-login-patterns-bc83cc5e9e3e)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- [NextAuth.js signIn](https://next-auth.js.org/getting-started/client#signin)

---

## Changelog

- ✅ Creado `<SignInModal />` component reutilizable
- ✅ Creado `useSignInModal()` custom hook
- ✅ Actualizado `GuestMenu` para usar modal
- ✅ Creado `<SignInPageClient />` fallback para `/signin`
- ✅ Mantenida ruta `/signin` como fallback (SEO/bookmarks)
- ✅ Implementado Google OAuth en modal
- ✅ Preparado para magic links futuros (email input)
- ✅ Aplicados principios "Don't Make Me Think"
- ✅ Accesibilidad completa (a11y)
- ✅ Loading states y feedback visual
