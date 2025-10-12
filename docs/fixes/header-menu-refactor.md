# Refactorización del Header - Menús de Usuario

## Cambios Realizados

### Nuevos Componentes Creados

#### 1. `user-menu.tsx` - Menú para Usuarios Autenticados

**Ubicación**: `src/app/(public)/_components/_layout/user-menu.tsx`

**Características**:
- ✅ Muestra información del usuario (nombre y email)
- ✅ Navegación a "Mis Cotizaciones" con `Link`
- ✅ Toggle de tema (Light/Dark) integrado
- ✅ Opción de cerrar sesión con Server Action
- ✅ Client Component para interactividad del tema
- ✅ Accesibilidad completa (aria-labels, sr-only)

**Props**:
- `userName?: string | null` - Nombre del usuario
- `userEmail?: string | null` - Email del usuario

---

#### 2. `guest-menu.tsx` - Menú para Usuarios No Autenticados

**Ubicación**: `src/app/(public)/_components/_layout/guest-menu.tsx`

**Características**:
- ✅ Opción "Iniciar Sesión" con `Link` a `/signin`
- ✅ Toggle de tema (Light/Dark) integrado
- ✅ Client Component para interactividad del tema
- ✅ Diseño simple y directo

**Props**: Ninguna (usa `useTheme` internamente)

---

#### 3. `actions.ts` - Server Actions

**Ubicación**: `src/app/(public)/_components/_layout/actions.ts`

**Funciones**:
- `handleSignOut()`: Server Action para cerrar sesión y redirigir a `/catalog`

---

### Componente Refactorizado

#### `public-header.tsx` - Header Principal

**Cambios**:
- ❌ Removido `ModeToggle` standalone
- ❌ Removidos botones individuales para login/quotes
- ✅ Integrado `UserMenu` para usuarios autenticados
- ✅ Integrado `GuestMenu` para usuarios no autenticados
- ✅ Simplificado: Solo Carrito + Menú de Usuario
- ✅ Navegación principal más limpia ("Catálogo" en vez de "Todos los productos")

---

## Principios Aplicados: "Don't Make Me Think"

### 1. **Claridad sobre Ingenio**
- ✅ Iconos claros (User = menú de usuario)
- ✅ Labels descriptivos ("Mis Cotizaciones", "Cerrar Sesión", "Cambiar a Claro")
- ✅ Sin jerga técnica o términos ambiguos

### 2. **Jerarquía Visual**
- ✅ Información del usuario visible primero
- ✅ Acciones principales (Mis Cotizaciones) antes que secundarias (Tema)
- ✅ Cerrar Sesión al final con separador visual

### 3. **Reducción de Carga Cognitiva**
- ✅ Menú contextual según estado de autenticación
- ✅ Solo opciones relevantes mostradas
- ✅ Acciones agrupadas lógicamente

### 4. **Navegación Intuitiva**
- ✅ Uso de `Link` para navegación (priorizado sobre hooks)
- ✅ Breadcrumbs implícitos en navegación principal
- ✅ Estado de sesión visible (nombre de usuario o icono de login)

---

## Arquitectura Técnica

### Patrón Usado: Server Component + Client Components

```
public-header.tsx (Server Component)
├── auth() - Verifica sesión en servidor
├── CartIndicator (Client Component)
└── Conditional Rendering:
    ├── UserMenu (Client Component) - Si autenticado
    └── GuestMenu (Client Component) - Si no autenticado
```

### Separación de Responsabilidades (SOLID - SRP)

1. **public-header.tsx**: Orquestación y layout
2. **user-menu.tsx**: UI y lógica para usuarios autenticados
3. **guest-menu.tsx**: UI y lógica para invitados
4. **actions.ts**: Server Actions (signOut)

### Beneficios de la Arquitectura

- ✅ **Mantenibilidad**: Cada componente tiene una responsabilidad clara
- ✅ **Testabilidad**: Componentes aislados fáciles de testear
- ✅ **Reusabilidad**: Menús pueden usarse en otros layouts
- ✅ **Performance**: Server Component para auth, Client solo para interactividad

---

## Integración con Tecnologías

### NextAuth.js v5
- ✅ `auth()` en Server Component para obtener sesión
- ✅ `signOut()` vía Server Action con redirección

### next-themes
- ✅ `useTheme()` hook en Client Components
- ✅ Toggle dinámico de tema sin recarga de página

### shadcn/ui
- ✅ `DropdownMenu` para menús desplegables
- ✅ `Button` con variantes outline
- ✅ Componentes accesibles por defecto

---

## Uso

### En el Header

```tsx
import { auth } from '@/server/auth';
import { UserMenu } from './user-menu';
import { GuestMenu } from './guest-menu';

export default async function Header() {
  const session = await auth();

  return (
    <header>
      {/* ... */}
      {session?.user ? (
        <UserMenu 
          userName={session.user.name} 
          userEmail={session.user.email} 
        />
      ) : (
        <GuestMenu />
      )}
    </header>
  );
}
```

---

## Accesibilidad (a11y)

- ✅ `aria-label` en botones trigger
- ✅ `sr-only` para textos de screen readers
- ✅ Navegación por teclado completa
- ✅ Contraste de colores adecuado (shadcn/ui)
- ✅ Focus states visibles

---

## Testing Recomendado

### Unit Tests
```typescript
describe('UserMenu', () => {
  it('should display user name and email');
  it('should navigate to /my-quotes when clicked');
  it('should toggle theme when clicked');
  it('should call signOut action when logout clicked');
});

describe('GuestMenu', () => {
  it('should navigate to /signin when clicked');
  it('should toggle theme when clicked');
});
```

### E2E Tests
```typescript
test('authenticated user can access my-quotes from menu', async ({ page }) => {
  // Login
  await page.goto('/signin');
  await page.click('[aria-label="Continuar con Google"]');
  
  // Open user menu
  await page.click('[aria-label="Menú de usuario"]');
  
  // Click "Mis Cotizaciones"
  await page.click('text=Mis Cotizaciones');
  
  // Verify navigation
  await expect(page).toHaveURL('/my-quotes');
});
```

---

## Próximos Pasos (Opcional)

1. **Mobile Menu**: Agregar hamburger menu para móviles
2. **User Avatar**: Integrar avatar de usuario con imagen
3. **Notificaciones**: Badge con contador de cotizaciones pendientes
4. **Preferencias**: Expandir menú con más configuraciones

---

## Referencias

- [Don't Make Me Think - Steve Krug](https://www.sensible.com/dont-make-me-think/)
- [NextAuth.js v5 Docs](https://authjs.dev/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [shadcn/ui DropdownMenu](https://ui.shadcn.com/docs/components/dropdown-menu)
