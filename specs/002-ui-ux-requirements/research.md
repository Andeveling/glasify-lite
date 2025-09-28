# Research — UI/UX Glasify MVP

Fecha: 2025-09-28 | Fuente: /specs/002-ui-ux-requirements/spec.md

## Decisiones

- Decisión: App Router (Next.js 15) con route groups por dominio
  - Racional: segmenta dominios (catalog, quote, admin) y permite `_` carpetas privadas; soporta layouts por grupo y streaming.
  - Alternativas: Pages Router (deprecated para nuevos proyectos) — descartado.

- Decisión: shadcn/ui v3 sobre Tailwind v4 con tokens desde `globals.css`
  - Racional: componentes accesibles y composables; Tailwind v4 soporta CSS variables nativas. Cumple a11y del repositorio.
  - Alternativas: MUI/Chakra — más pesados, no alinean con el stack ya existente.

- Decisión: tRPC + Zod para contratos end‑to‑end
  - Racional: tipado de extremo a extremo y validación en límites. Ya está presente en el repo.
  - Alternativas: REST/OpenAPI — posible para interoperabilidad futura, pero más boilerplate hoy.

- Decisión: Prisma + PostgreSQL
  - Racional: definido en el proyecto; esquema ya existente. Mantener MM y DECIMAL(12,2).

- Decisión: NextAuth v5 (Google)
  - Racional: requisito de envío de cotización; integración ya configurada.

- Decisión: Observabilidad con Winston centralizado
  - Racional: regla constitucional VI; ya existe `src/lib/logger.ts`.

## Desconocidos resueltos (Clarifications)
- Escala: hasta 100 modelos/ fabricante; 20 ítems por cotización.
- Estados UI: empty, loading, error con mensajes y recuperación.
- Roles: Cliente (cotizar/historial), Admin (gestionar catálogo/cotizaciones/usuarios).
- Soporte: navegadores modernos listados en la especificación.
- Validación de "intuitivo": pruebas de usabilidad con tiempos objetivos.

## Mejores prácticas aplicadas
- No hardcodear colores; usar variables CSS de `globals.css` vía clases Tailwind que referencien `var(--color-*)`.
- Formularios con Zod + mensajes en español. 
- React Query (TanStack v5) para estados async y cache.
- Suspense/Loading UI de App Router para estados `loading` y `error` templates.
