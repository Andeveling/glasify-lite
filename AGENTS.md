# AGENTS.md - Glasify Lite Project Rules

> Documento maestro de reglas y verdades del proyecto para agentes IA.

## Verdad del Proyecto

### Stack Tecnologico (Versiones Exactas - Enero 2026)

| Categoria | Tecnologia | Version | Notas Criticas |
|-----------|------------|---------|----------------|
| Framework | Next.js | 16.0.7 | App Router, Turbopack, React Compiler |
| UI | React | 19.2.0 | Server Components, use(), Actions |
| Estilos | Tailwind CSS | 4.1.14 | **CSS-first, SIN tailwind.config.js** |
| Componentes | Shadcn/Radix | 3.5.0 | Estilo new-york, RSC habilitado |
| API | tRPC | 11.6.0 | Con superjson transformer |
| ORM | Prisma | 6.18.0 | Adapter Neon para serverless |
| DB | PostgreSQL | Neon | Serverless, pooling incluido |
| Auth | better-auth | 1.4.10 | Google OAuth, RBAC basico |
| State | Zustand | 5.x | Store global |
| Queries | TanStack Query | 5.x | Via tRPC |
| Testing | Vitest | 4.x | Unit + Integration |
| E2E | Playwright | 1.56 | Tests end-to-end |
| Linter | Biome | 2.3 | Reemplaza ESLint + Prettier |

### Estructura de Carpetas

```
glasify-lite/
├── src/
│   ├── app/                 # App Router (rutas)
│   │   ├── (auth)/          # Rutas autenticacion
│   │   ├── (dashboard)/     # Panel admin
│   │   ├── (public)/        # Rutas publicas
│   │   └── _components/     # Componentes de app
│   ├── components/
│   │   └── ui/              # Componentes Shadcn
│   ├── server/
│   │   ├── api/             # tRPC routers
│   │   ├── auth/            # better-auth config
│   │   └── services/        # Servicios dominio
│   ├── lib/                 # Utilidades
│   ├── hooks/               # React hooks
│   ├── domain/              # Logica de negocio
│   ├── styles/              # CSS (Tailwind v4)
│   └── trpc/                # Cliente tRPC
├── prisma/
│   ├── schema.prisma
│   └── seeders/
├── tests/                   # Vitest tests
├── e2e/                     # Playwright tests
└── .opencode/               # Configuracion agentes
```

### Aliases TypeScript

| Alias | Path |
|-------|------|
| `@/*` | `./src/*` |
| `@server/*` | `./src/server/*` |
| `@ui/*` | `./src/components/ui/*` |
| `@styles/*` | `./src/styles/*` |
| `@trpc/*` | `./src/trpc/*` |
| `@domain/pricing/*` | `./src/domain/pricing/*` |

---

## Reglas Criticas

### 1. Tailwind CSS v4 - Arquitectura CSS-First

**PROHIBIDO:**
- Crear o buscar `tailwind.config.js`
- Usar sintaxis de configuracion JS
- Asumir que existen plugins JS

**OBLIGATORIO:**
- Toda configuracion en `src/styles/globals.css`
- Usar `@theme inline { }` para extender
- Variables CSS con sintaxis OKLCH

### 2. SSR Cache Invalidation Pattern

Cuando una pagina usa `force-dynamic` y pasa datos SSR como props:

```typescript
const mutation = api.feature.action.useMutation({
  onSettled: () => {
    void utils.feature.query.invalidate();  // Paso 1: Limpiar cache
    router.refresh();                        // Paso 2: Re-fetch SSR
  },
});
```

**Ambos pasos son obligatorios.** Sin `router.refresh()`, la UI no se actualiza.

### 3. Convenciones de Codigo

- **Clases condicionales**: Usar `cn()` de `@/lib/utils`
- **Componentes UI**: Ubicar en `src/components/ui/`
- **Variantes**: Usar CVA (class-variance-authority)
- **Schemas**: Colocar junto al router tRPC o en `src/server/schemas/`
- **Tipos**: Preferir inferencia de Zod sobre tipos manuales

### 4. Procedimientos tRPC

| Procedimiento | Uso |
|---------------|-----|
| `publicProcedure` | Endpoints sin auth |
| `protectedProcedure` | Requiere sesion |
| `adminProcedure` | Requiere rol admin |

---

## Lazy Loading de Skills

Los agentes deben cargar skills bajo demanda:

| Skill | Cargar cuando... |
|-------|------------------|
| `tailwind-v4` | Se modifiquen estilos o se agreguen colores/animaciones |
| `trpc` | Se creen o modifiquen endpoints API |
| `prisma` | Se modifique schema o se creen queries |

**Ubicacion:** `.opencode/skills/[nombre]/SKILL.md`

---

## Comandos Frecuentes

```bash
# Desarrollo
pnpm dev              # Next.js con Turbopack

# Base de datos
pnpm db:push          # Push schema (dev)
pnpm db:generate      # Crear migracion
pnpm db:studio        # GUI Prisma

# Linting
pnpm lint             # Verificar con Biome
pnpm lint:fix         # Auto-fix

# Testing
pnpm test             # Vitest
pnpm test:e2e         # Playwright

# Build
pnpm build            # Build produccion
pnpm typecheck        # Verificar tipos
```

---

## Dominio del Negocio

**Glasify** es un SaaS multi-tenant para vidrieria que maneja:
- Catalogo de modelos de vidrio
- Cotizaciones automatizadas
- Configuracion por tenant (moneda, locale, branding)
- Calculo de precios con caracteristicas de vidrio
- Gestion de proveedores y transporte
