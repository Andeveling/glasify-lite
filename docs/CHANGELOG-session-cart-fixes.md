# Fix: SessionProvider & Cart Badge Issues

**Fecha**: 10 de octubre de 2025  
**Issues**: 
- #001: Missing SessionProvider causing runtime error
- #002: Cart badge not updating after add to cart

## Problema #001: SessionProvider Missing

### Error Original
```
[next-auth]: `useSession` must be wrapped in a <SessionProvider />
at CartSummary (src/app/(public)/cart/_components/cart-summary.tsx:64:47)
```

### Causa Raíz
- `CartSummary` usa `useSession()` de `next-auth/react`
- No hay `SessionProvider` configurado en el árbol de componentes
- NextAuth v5 requiere SessionProvider explícito para client components

### Solución Implementada

#### 1. Crear SessionProvider Component
**Archivo**: `src/providers/session-provider.tsx`

```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

type SessionProviderProps = {
  children: React.ReactNode;
  session?: Session | null;
};

export function SessionProvider({ children, session }: SessionProviderProps) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
```

#### 2. Agregar al Root Layout
**Archivo**: `src/app/layout.tsx`

```tsx
import { SessionProvider } from '@/providers/session-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <TRPCReactProvider>
              {children}
            </TRPCReactProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Resultado
✅ `useSession()` ahora funciona en toda la app  
✅ `/cart` route ya no genera error  
✅ Autenticación con Google funciona correctamente

---

## Problema #002: Cart Badge Not Updating

### Síntomas
- Usuario agrega item al carrito
- Toast de éxito aparece
- Badge del carrito NO se actualiza
- Item SÍ está en sessionStorage

### Diagnóstico

#### Flujo Actual
```
ModelForm (Client)
    ↓
handleFormSubmit()
    ↓
addItem(cartItemInput)
    ↓
useCart hook
    ↓
saveItems(updatedItems)
    ↓
sessionStorage.setItem()
    ↓
setItems(updatedItems) ← Estado local actualizado
    
CartIndicator (Client)
    ↓
useCart hook
    ↓
useCartStorage()
    ↓
useEffect hydration (solo en mount)
    ↓
NO se actualiza cuando sessionStorage cambia ❌
```

### Causa Raíz
1. **Estado No Compartido**: Cada instancia de `useCart()` tiene su propio estado local
2. **Hidratación Una Sola Vez**: `useCartStorage` solo lee de sessionStorage en mount
3. **No hay Event Listener**: No escucha cambios en sessionStorage

### Solución A: Evento Personalizado (Recomendado)

#### Paso 1: Emitir evento al guardar
**Archivo**: `src/app/(public)/cart/_hooks/use-cart-storage.ts`

```typescript
export function saveCartToStorage(items: CartItem[]): boolean {
  // ... código existente de guardado ...
  
  if (success) {
    // Emitir evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { items } 
    }));
  }
  
  return success;
}
```

#### Paso 2: Escuchar evento en hook
**Archivo**: `src/app/(public)/cart/_hooks/use-cart-storage.ts`

```typescript
export function useCartStorage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const loadedItems = loadCartFromStorage();
    setItems(loadedItems);
    setIsHydrated(true);

    // Listen for cart updates
    const handleCartUpdate = (e: CustomEvent) => {
      setItems(e.detail.items);
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  // ... resto del código
}
```

### Solución B: Context API (Alternativa)

Crear un `CartProvider` que envuelva toda la app:

```typescript
// src/providers/cart-provider.tsx
'use client';

import { createContext, useContext } from 'react';

const CartContext = createContext<UseCartReturn | null>(null);

export function CartProvider({ children }) {
  const cart = useCart(); // Hook original
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
}
```

Y agregar al layout:
```tsx
<SessionProvider>
  <CartProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </CartProvider>
</SessionProvider>
```

### Solución Implementada: Evento Personalizado

**Ventajas**:
- ✅ Mantiene arquitectura existente
- ✅ No requiere Context Provider adicional
- ✅ Funciona cross-component automáticamente
- ✅ Mínimos cambios de código

**Implementación**: Ver commits siguientes

---

## Testing

### Manual Testing Checklist
- [ ] Visitar `/catalog/[modelId]`
- [ ] Configurar modelo y agregar al carrito
- [ ] Verificar toast de éxito aparece
- [ ] Verificar badge del carrito se actualiza de 0 → 1
- [ ] Agregar otro item
- [ ] Verificar badge se actualiza a 2
- [ ] Navegar a `/cart`
- [ ] Verificar items aparecen correctamente
- [ ] Verificar NO hay error de SessionProvider

### E2E Tests
```bash
pnpm test:e2e e2e/cart/add-to-cart.spec.ts
```

Debería pasar:
- ✅ "should show cart badge with 0 items initially"
- ✅ "should complete full flow: catalog → configure → add to cart → verify badge"
- ✅ "should add multiple items and update badge correctly"

---

## Archivos Modificados

```
src/
├── providers/
│   └── session-provider.tsx          ← NUEVO: SessionProvider wrapper
├── app/
│   ├── layout.tsx                    ← MODIFICADO: Agregado SessionProvider
│   └── (public)/
│       └── cart/
│           └── _hooks/
│               └── use-cart-storage.ts  ← MODIFICADO: Event emitter/listener
```

---

## Referencias

- [NextAuth v5 SessionProvider](https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware)
- [Custom Events API](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [React useEffect cleanup](https://react.dev/reference/react/useEffect#removing-unnecessary-dependencies)
