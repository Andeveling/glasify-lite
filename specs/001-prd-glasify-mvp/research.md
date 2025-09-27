# Research — Glasify MVP

Fecha: 2025-09-27  
Branch: 001-prd-glasify-mvp  
Spec: /home/andres/Proyectos/glasify-litle/specs/001-prd-glasify-mvp/spec.md

## Decisiones

- Decision: Stack T3 (Next.js 15.2.3 App Router, React 19, tRPC 11, Prisma 6.5, NextAuth 5 beta, Shadcn 3 / Tailwind 4)
  - Rationale: Alineado a repositorio actual; máxima type safety; SSR/APIs integradas.
  - Alternatives: REST + Express; GraphQL; rechazadas por complejidad añadida.

- Decision: Validación con Zod en límites de sistema (tRPC inputs/outputs)
  - Rationale: Tipos compartidos end-to-end y esquemas ejecutables.
  - Alternatives: class-validator, yup; menos integración con TS y tRPC.

- Decision: Lógica de precios como funciones puras en `src/server/price/*`
  - Rationale: Principio constitucional I; fácil testeo unitario y performance.
  - Alternatives: Embebida en routers/React; rechazado por acoplamiento y testabilidad.

- Decision: Política de redondeo half-up a 2 decimales por componente (FR-020)
  - Rationale: Clarificación acordada; reduce errores acumulados.
  - Alternatives: Redondeo al final; banca; rechazadas por requerimientos.

- Decision: Ajustes por ítem y a nivel cotización (positivos/negativos)
  - Rationale: Clarificaciones FR-023/024.
  - Alternatives: Solo ítem; solo positivos; rechazadas.

- Decision: SMTP/mock email para envío de cotización (FR-022)
  - Rationale: Simplicidad MVP.
  - Alternatives: WhatsApp API, SMS; futuras fases.

## Tareas de mejores prácticas

- Next 15 + React 19: usar App Router, acciones de servidor donde aplique, componentes client/"use server" declarativos.
- tRPC 11: routers en `src/server/api/routers/*`, validar inputs/outputs con Zod; usar superjson.
- Prisma 6.5: DECIMAL(12,2) para monedas; mm como enteros; migraciones reversibles.
- Performance: medir `priceItem` (<200ms) con bench simple; evitar await en loops; memoizar constantes.
- A11y/i18n: WCAG 2.1 AA; texto es-LA; formateo numérico local.

## Riesgos y mitigaciones

- NextAuth v5 beta: posibles cambios; fijar versión exacta y pruebas de login.
- Cálculos m²/ml extremos: validar límites y underflow/overflow de cantidades derivadas.
- Multi-tenant: asegurar scoping por manufacturerId en queries.

