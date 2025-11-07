# Project Architecture Blueprint

**Fecha de generación:** 7 de noviembre de 2025

---

## 1. Detección de Stacks Tecnológicos y Patrones Arquitectónicos

- **Tecnologías principales:**
  - Next.js 16 (App Router, Server Components, SSR, Cache Components)
  - React 19 (Atomic Design, hooks, context)
  - tRPC 11 (API tipada, integración con React Query)
  - Prisma 6 (ORM, migraciones, PostgreSQL)
  - Zod 4 (validación tipada)
  - TanStack Query 5 (caching, invalidación, SSR)
  - Shadcn/ui + Radix UI (componentes UI)
  - TailwindCSS 4 (utilidades CSS)
  - Winston (logging server-side)
  - Biome (linting/formatting)
  - Lefthook (git hooks)
  - Better Auth (autenticación y RBAC)

- **Patrones arquitectónicos:**
  - Server-First Architecture
  - Atomic Design
  - SOLID
  - SSR Cache Invalidation
  - Modularidad por dominio y feature
  - Separación estricta Server/Client

---

## 2. Resumen Arquitectónico y Principios

- **Enfoque principal:** Server-First, SSR, separación estricta entre componentes de servidor y cliente.
- **Principios:** Mantenibilidad, extensibilidad, testabilidad, gobernanza estricta.
- **Adaptaciones:** Atomic Design para UI, modularidad por dominio, enforcement con Biome y Lefthook.
- **Límites:** Carpeta y naming conventions, roles, enforcement por tooling.

---

## 3. Visualización Arquitectónica

- **Diagrama C4 (alto nivel):**
  - Subsistemas: Frontend (Next.js, React), Backend (tRPC, Prisma, PostgreSQL), Utilidades (Zod, TanStack Query, Winston, Biome, Lefthook).
  - Flujo de datos: Formulario React → tRPC → Prisma → PostgreSQL.
  - Límites: Server/Client, API tipada, persistencia, UI modular.

---

## 4. Componentes Arquitectónicos Principales

- **App Router (Next.js):** Orquestación de rutas, SSR, Server Components.
- **tRPC Routers:** API tipada, validación, integración con React Query.
- **Prisma Models:** Persistencia, migraciones, relaciones entre entidades.
- **UI Atoms/Molecules/Organisms:** Atomic Design, modularidad, colocation.
- **Server-table:** Data tables optimizadas, SSR, URL como fuente de estado.
- **Hooks personalizados:** Lógica reusable, segregación de responsabilidades.
- **Servicios de negocio:** Encapsulan lógica de dominio, extensibles.
- **Utilidades globales:** Validación, logging, configuración.

---

## 5. Capas y Dependencias

- **Frontend:** Next.js App Router, React, Shadcn/ui, TailwindCSS.
- **Backend:** tRPC routers, Prisma, PostgreSQL, Winston.
- **Utilidades:** Zod, TanStack Query, Biome, Lefthook.
- **Reglas:**
  - Client Components no acceden a lógica de servidor.
  - Routers tRPC exponen APIs tipadas.
  - Prisma gestiona persistencia.
  - Winston solo en server-side.
  - Inyección de dependencias por props/context/hooks.

---

## 6. Arquitectura de Datos

- **Modelos de dominio:** Quote, CartItem, Model, GlassType, etc.
- **Relaciones:** Prisma ORM, migraciones, evolución de esquema.
- **Acceso a datos:** tRPC, Prisma, validación con Zod.
- **Transformaciones:** Validación y mapeo con Zod.
- **Caché:** Next.js Cache Components, TanStack Query.

---

## 7. Cross-Cutting Concerns

- **Autenticación/Autorización:** Better Auth, RBAC server-side, adminProcedure, getQuoteFilter.
- **Errores:** Error boundaries en UI, manejo de excepciones en tRPC y Prisma.
- **Logging:** Winston (solo server-side).
- **Validación:** Zod, React Hook Form.
- **Configuración:** env.js, .env, feature flags.
- **Enforcement:** Biome, Lefthook.

---

## 8. Patrones de Comunicación de Servicios

- **Límites:** Frontend/Backend (tRPC), API tipada.
- **Protocolos:** HTTP/JSON.
- **Síncrono/Asíncrono:** tRPC/SSR vs TanStack Query/Suspense.
- **Versionado:** Procedimientos tRPC.
- **Resiliencia:** Invalidación de caché, router.refresh, manejo de errores.

---

## 9. Patrones Específicos por Tecnología

- **Next.js:** App Router, Server Components, SSR, cache, Suspense.
- **React:** Atomic Design, hooks, context, separación client/server.
- **tRPC:** Procedimientos tipados, integración con React Query.
- **Prisma:** Modelos, migraciones, acceso a datos.
- **Zod:** Validación tipada.
- **TanStack Query:** Caching, invalidación, SSR.
- **Shadcn/ui:** Componentes UI.
- **TailwindCSS:** Utilidades CSS.
- **Winston:** Logging server-side.
- **Biome:** Linting/formatting.
- **Lefthook:** Git hooks.

---

## 10. Patrones de Implementación

- **Interfaces:** Segregación, abstracción, implementación por dominio.
- **Servicios:** Lifetime, composición, manejo de errores.
- **Repositorios:** Queries, transacciones, concurrencia.
- **Controladores/APIs:** Manejo de requests/responses, validación, versionado.
- **Modelos de dominio:** Entidades, value objects, eventos de dominio, reglas de negocio.

---

## 11. Arquitectura de Testing

- **Estrategias:** Unitarias (Vitest), integración (Vitest, Playwright), E2E (Playwright), contractuales.
- **Límites:** Por capa (UI, API, dominio).
- **Test doubles/mocks:** Uso en pruebas de integración y unitarias.
- **Datos de prueba:** Factories, seeders.
- **Herramientas:** Vitest, Playwright, Biome.
- **Cobertura:** Organización por feature y dominio.

---

## 12. Arquitectura de Despliegue

- **Topología:** Configuración en `next.config.ts`, `vercel.json`, scripts de base de datos.
- **Entornos:** Adaptaciones dev/prod.
- **Dependencias:** Resolución en tiempo de ejecución.
- **Configuración:** .env, env.js.
- **Containerización:** (Si aplica).
- **Cloud:** Vercel, PostgreSQL.
- **Migraciones/rollback:** Reportes y scripts.

---

## 13. Patrones de Extensión y Evolución

- **Agregar features:** Organización por dominio/feature, modularidad, colocation.
- **Modificar componentes:** Compatibilidad, gobernanza, enforcement.
- **Integrar sistemas externos:** Adaptadores, anti-corruption layers, service facades.
- **Migración:** Patrones y reportes.
- **Plugin points:** Modularidad y configuración.
- **Feature flags:** Extensión y configuración.

---

## 14. Ejemplos de Patrones Arquitectónicos

- **Separación de capas:**
  ```typescript
  // Server Component
  export default async function Page() {
    "use cache";
    // ...
  }
  // Client Component
  "use client";
  export function Button() { /* ... */ }
  ```
- **Comunicación entre componentes:**
  ```typescript
  // tRPC procedure
  export const getQuote = publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.quote.findMany();
  });
  // React Query usage
  const { data } = api.quote.getQuote.useQuery();
  ```
- **Puntos de extensión:**
  ```typescript
  // Modularización por dominio
  src/app/(dashboard)/admin/models/_components/models-table.tsx
  // Feature flag
  if (process.env.FEATURE_X_ENABLED) { /* ... */ }
  ```

---

## 15. Decision Records

- **Adopción de Next.js 16 y App Router:**
  - Contexto: Necesidad de SSR, Server Components, cache avanzada.
  - Alternativas: Next.js 13/15, Pages Router.
  - Razón: Mejor performance y gobernanza.
  - Consecuencias: Mayor control y extensibilidad.
- **Separación Server/Client:**
  - Contexto: Seguridad y performance.
  - Alternativas: Componentes mixtos.
  - Razón: Evitar fugas de lógica y mejorar SSR.
  - Consecuencias: Código más seguro y mantenible.
- **tRPC para APIs tipadas:**
  - Contexto: Necesidad de APIs seguras y tipadas.
  - Alternativas: REST, GraphQL.
  - Razón: Tipado end-to-end y mejor DX.
  - Consecuencias: Menos errores y mayor velocidad de desarrollo.
- **Prisma para persistencia:**
  - Contexto: Gestión de datos y migraciones.
  - Alternativas: TypeORM, Sequelize.
  - Razón: Tipado, migraciones robustas.
  - Consecuencias: Evolución de esquema controlada.
- **Atomic Design para UI:**
  - Contexto: Reusabilidad y escalabilidad.
  - Alternativas: Componentes ad-hoc.
  - Razón: Modularidad y consistencia.
  - Consecuencias: UI más mantenible.
- **SSR Cache Invalidation:**
  - Contexto: Consistencia de datos en SSR.
  - Alternativas: Solo invalidación de cache cliente.
  - Razón: Garantizar rehidratación y actualización de datos.
  - Consecuencias: UI siempre actualizada.
- **Biome y Lefthook para enforcement:**
  - Contexto: Gobernanza y calidad de código.
  - Alternativas: ESLint, Husky.
  - Razón: Integración y performance.
  - Consecuencias: Menos errores y mayor consistencia.

---

## 16. Gobernanza Arquitectónica

- **Enforcement:** Biome (linting/formatting), Lefthook (git hooks), convenciones de carpetas y nombres.
- **Revisiones:** Code reviews, documentación en `.github/instructions/`.
- **Checks automáticos:** Biome, Lefthook, scripts de validación.
- **Prácticas de documentación:** Actualización de blueprint y arquitectura.

---

## 17. Blueprint para Nuevo Desarrollo

- **Workflow:**
  - Iniciar por dominio/feature.
  - Crear componentes siguiendo Atomic Design y modularidad.
  - Integrar con tRPC y Prisma.
  - Validar con Zod y React Hook Form.
  - Testear con Vitest y Playwright.
  - Documentar y revisar.
- **Templates:**
  - Base para Server/Client Components, tRPC procedures, Prisma models.
  - Organización por carpetas y naming conventions.
  - Declaración de dependencias y documentación.
- **Pitfalls comunes:**
  - Violaciones de capas (mezclar lógica server/client).
  - Falta de validación o testeo.
  - No seguir convenciones de carpetas/nombres.
  - No actualizar blueprint/documentación.
- **Recomendaciones:**
  - Mantener blueprint actualizado.
  - Revisar decisiones arquitectónicas periódicamente.
  - Usar enforcement tooling y code reviews.

---

> Este blueprint fue generado el 7 de noviembre de 2025. Actualízalo tras cambios arquitectónicos relevantes para mantener la consistencia y calidad del proyecto.
