---
goal: Fix Middleware Edge Runtime Compatibility and Infinite Redirect Loop
version: 1.0
date_created: 2025-10-15
last_updated: 2025-10-15
owner: Development Team
status: 'In progress'
tags: ['bug', 'architecture', 'middleware', 'authentication', 'edge-runtime']
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In_progress-yellow)

Este plan aborda múltiples problemas críticos en el middleware de autenticación que están causando:
1. **Bucles infinitos de redirección** entre `/signin` y `/my-quotes`
2. **Edge Runtime incompatibility** con Winston logger y Prisma Client
3. **Arquitectura incorrecta** - el middleware está ejecutándose en Edge Runtime pero usa Node.js APIs

Los errores actuales indican:
- `PrismaClientValidationError: In order to run Prisma Client on edge runtime, either use Prisma Accelerate or Driver Adapters`
- `A Node.js module is loaded ('node:path') which is not supported in the Edge Runtime`
- Bucle infinito: `/signin?callbackUrl=/my-quotes` → redirección → vuelta a `/signin`

## 1. Requirements & Constraints

### Problemas Identificados

- **PROB-001**: Middleware ejecutándose en **Edge Runtime** no puede usar Winston logger (Node.js APIs: `fs`, `path`, `process.cwd()`)
- **PROB-002**: NextAuth con Prisma Adapter no funciona en Edge Runtime sin Prisma Accelerate o Driver Adapters
- **PROB-003**: Bucle infinito de redirecciones cuando usuario autenticado intenta acceder a rutas protegidas
- **PROB-004**: Logger importado en middleware causa errores de Edge Runtime compilation
- **PROB-005**: Autenticación modal no tiene callback URL correcto, debería redirigir a `/catalog` no a `/signin`

### Requirements

- **REQ-001**: Middleware debe ejecutarse en **Node.js Runtime** (no Edge) para usar Prisma y Winston
- **REQ-002**: Autenticación debe manejarse con modal, redirecciones deben apuntar a `/catalog`
- **REQ-003**: Eliminar bucles infinitos en flujo de autenticación
- **REQ-004**: Remover import de logger del middleware (no es crítico para autorización)
- **REQ-005**: Simplificar lógica del middleware para reducir complejidad
- **REQ-006**: Mantener RBAC patterns (admin, seller, user roles)

### Constraints

- **CON-001**: NextAuth v5 requiere Node.js Runtime cuando usa Prisma Adapter
- **CON-002**: Edge Runtime NO soporta: `fs`, `path`, `process.cwd()`, `winston`, Prisma sin adapters
- **CON-003**: No podemos usar Prisma Accelerate (requiere suscripción)
- **CON-004**: Debemos mantener compatibilidad con la arquitectura actual (modal login)

### Guidelines

- **GUD-001**: Usar `console` para logging en middleware si es necesario (o remover logging)
- **GUD-002**: Configurar middleware con `runtime: 'nodejs'` en export config
- **GUD-003**: Simplificar redirecciones: usuarios no autenticados → `/catalog` (con modal)
- **GUD-004**: Eliminar `/signin` page y `/auth/callback` page (usar solo modal)
- **GUD-005**: Mantener Server-First Architecture

## 2. Implementation Steps

### Phase 1: Fix Edge Runtime Incompatibility

**GOAL-001**: Configurar middleware para ejecutarse en Node.js Runtime y eliminar dependencias incompatibles

| Task     | Description                                                                                 | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Agregar `export const runtime = 'nodejs'` a `src/middleware.ts` para forzar Node.js Runtime | ✅         | 2025-10-15 |
| TASK-002 | Remover import de `logger` del middleware (no es crítico para RBAC)                         | ✅         | 2025-10-15 |
| TASK-003 | Reemplazar llamadas a `logger.warn()` con `console.warn()` (Edge-compatible)                | ✅         | 2025-10-15 |
| TASK-004 | Verificar que `auth()` de NextAuth funcione correctamente en Node.js Runtime                | ✅         | 2025-10-15 |
| TASK-005 | Limpiar imports innecesarios del middleware                                                 | ✅         | 2025-10-15 |

### Phase 2: Eliminar Bucles Infinitos de Redirección

**GOAL-002**: Simplificar flujo de autenticación y eliminar redirecciones circulares

| Task     | Description                                                                                                | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-006 | Cambiar redirección de rutas protegidas: de `/signin?callbackUrl=X` a `/catalog?signin=true&callbackUrl=X` |           |      |
| TASK-007 | Eliminar lógica de redirección de usuarios autenticados en `/signin` page (será eliminada)                 |           |      |
| TASK-008 | Actualizar `SignInModal` para leer `callbackUrl` de query params y redirigir después de login              |           |      |
| TASK-009 | Eliminar `/auth/callback` page (innecesaria con modal)                                                     |           |      |
| TASK-010 | Simplificar lógica del middleware: solo verificar auth + RBAC, no manejar signin redirects                 |           |      |

### Phase 3: Refactorizar Arquitectura de Autenticación

**GOAL-003**: Implementar autenticación 100% basada en modal, eliminar páginas de signin innecesarias

| Task     | Description                                                                                       | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-011 | Eliminar `src/app/(auth)/signin/page.tsx` y su carpeta `_components`                              | ✅         | 2025-10-15 |
| TASK-012 | Eliminar `src/app/auth/callback/page.tsx` y carpeta completa                                      | ✅         | 2025-10-15 |
| TASK-013 | Actualizar `GuestMenu` component para auto-abrir modal cuando `?signin=true` en URL               | ✅         | 2025-10-15 |
| TASK-014 | Actualizar `NextAuthConfig` para eliminar `pages.signIn` custom (usar default `/api/auth/signin`) | ✅         | 2025-10-15 |
| TASK-015 | Actualizar middleware para NO redirigir a `/signin`, sino a `/catalog?signin=true&callbackUrl=X`  | ✅         | 2025-10-15 |

### Phase 4: Optimizar Middleware Performance

**GOAL-004**: Reducir complejidad y mejorar performance del middleware

| Task     | Description                                                                                     | Completed | Date       |
| -------- | ----------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-016 | Consolidar helper functions en un solo archivo `src/lib/middleware-utils.ts`                    | ✅         | 2025-10-15 |
| TASK-017 | Implementar early returns para rutas públicas (evitar auth check innecesario)                   | ✅         | 2025-10-15 |
| TASK-018 | Agregar lista de rutas públicas que NO requieren autenticación (`/catalog`, `/`, `/api/auth/*`) | ✅         | 2025-10-15 |
| TASK-019 | Optimizar `shouldSkipMiddleware()` para incluir todas las rutas excluidas                       | ✅         | 2025-10-15 |
| TASK-020 | Documentar flujo de middleware con diagramas en código                                          | ✅         | 2025-10-15 |

### Phase 5: Testing & Validation

**GOAL-005**: Verificar que todos los flujos de autenticación funcionen correctamente

| Task     | Description                                                                                                 | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-021 | Test: Usuario no autenticado accede `/my-quotes` → redirige a `/catalog?signin=true&callbackUrl=/my-quotes` |           |      |
| TASK-022 | Test: Modal se abre automáticamente, usuario hace login → redirige a `/my-quotes`                           |           |      |
| TASK-023 | Test: Usuario autenticado (role: user) accede `/dashboard` → redirige a `/my-quotes`                        |           |      |
| TASK-024 | Test: Usuario autenticado (role: admin) accede `/dashboard` → permite acceso                                |           |      |
| TASK-025 | Test: Usuario autenticado (role: seller) accede `/dashboard` → redirige a `/dashboard/quotes`               |           |      |
| TASK-026 | Test: NO hay bucles infinitos en ningún flujo                                                               |           |      |
| TASK-027 | Test: Edge Runtime errors eliminados completamente                                                          |           |      |
| TASK-028 | Actualizar tests E2E de RBAC para reflejar nueva arquitectura                                               |           |      |

## 3. Alternatives

- **ALT-001**: Usar Prisma Accelerate para mantener Edge Runtime
  - **Rechazado**: Requiere suscripción paga, overhead innecesario para esta app
  
- **ALT-002**: Implementar Driver Adapters para Prisma en Edge Runtime
  - **Rechazado**: Complejidad adicional, no justifica beneficios para este caso de uso
  
- **ALT-003**: Mantener `/signin` page separada (no modal)
  - **Rechazado**: Ya implementamos modal, mejor UX con modal, eliminar código duplicado

- **ALT-004**: Usar diferentes middleware para Edge y Node.js routes
  - **Rechazado**: Sobrecomplica arquitectura, Node.js Runtime funciona bien para todo

- **ALT-005**: Remover middleware completamente y hacer auth checks en pages
  - **Rechazado**: Pierde centralización de RBAC, menos seguro, peor DX

## 4. Dependencies

- **DEP-001**: NextAuth.js v5 (ya instalado) - debe ejecutarse en Node.js Runtime
- **DEP-002**: Prisma Client v6 (ya instalado) - requiere Node.js Runtime o Accelerate
- **DEP-003**: `SignInModal` component (ya existe) - necesita actualización para manejar callbackUrl
- **DEP-004**: Tests E2E de RBAC (ya existen) - necesitan actualización

## 5. Files

### Files to Modify

- **FILE-001**: `src/middleware.ts` - Agregar `runtime = 'nodejs'`, remover logger, simplificar lógica
- **FILE-002**: `src/server/auth/config.ts` - Eliminar custom `pages.signIn`
- **FILE-003**: `src/components/signin-modal.tsx` - Agregar auto-open logic y callbackUrl handling
- **FILE-004**: `e2e/rbac/*.spec.ts` - Actualizar tests para nueva arquitectura

### Files to Delete

- **FILE-005**: `src/app/(auth)/signin/page.tsx` - Eliminar página completa
- **FILE-006**: `src/app/(auth)/signin/_components/*` - Eliminar componentes
- **FILE-007**: `src/app/auth/callback/page.tsx` - Eliminar callback page
- **FILE-008**: `src/app/auth/callback/layout.tsx` - Eliminar layout
- **FILE-009**: `src/app/auth/callback/loading.tsx` - Eliminar loading

### Files to Create

- **FILE-010**: `src/lib/middleware-utils.ts` - Helper functions para middleware
- **FILE-011**: `src/hooks/use-auto-signin-modal.ts` - Hook para auto-abrir modal desde URL params

## 6. Testing

### Unit Tests

- **TEST-001**: `middleware-utils.test.ts` - Test helper functions (isProtectedRoute, isAdminOnlyRoute, etc.)
- **TEST-002**: `use-auto-signin-modal.test.ts` - Test hook de auto-open modal

### Integration Tests

- **TEST-003**: Middleware integration test - Verificar que auth() funciona en Node.js Runtime
- **TEST-004**: SignInModal integration test - Verificar callback URL handling

### E2E Tests

- **TEST-005**: `e2e/auth/signin-flow.spec.ts` - Test flujo completo de autenticación con modal
- **TEST-006**: `e2e/rbac/redirect-loops.spec.ts` - Test que NO hay bucles infinitos
- **TEST-007**: Actualizar todos los tests de `e2e/rbac/` para usar modal en vez de signin page

## 7. Risks & Assumptions

### Risks

- **RISK-001**: Cambiar de Edge a Node.js Runtime puede afectar performance del middleware
  - **Mitigación**: Implementar early returns para rutas públicas, optimizar auth checks
  
- **RISK-002**: Eliminar `/signin` page puede romper links externos o bookmarks
  - **Mitigación**: Mantener redirect de `/signin` a `/catalog?signin=true` por backward compatibility
  
- **RISK-003**: Auto-open modal puede causar UX issues si query param persiste
  - **Mitigación**: Remover `?signin=true` de URL después de abrir modal

- **RISK-004**: Tests E2E pueden romperse temporalmente durante refactor
  - **Mitigación**: Actualizar tests fase por fase, mantener CI/CD verde

### Assumptions

- **ASSUMPTION-001**: `SignInModal` component ya está implementado y funcional
- **ASSUMPTION-002**: NextAuth está configurado correctamente con Google OAuth
- **ASSUMPTION-003**: Prisma Adapter está funcionando en Node.js Runtime
- **ASSUMPTION-004**: No hay otros componentes que dependan de `/signin` page

## 8. Related Specifications / Further Reading

- [Next.js Middleware Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes#runtime-differences)
- [NextAuth.js with Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Edge Runtime Limitations](https://nextjs.org/docs/messages/node-module-in-edge-runtime)
- [Previous Fix: Auth Infinite Loop](./fix-auth-infinite-loop-1.md) - Related issue
- [RBAC Implementation](../docs/rbac-e2e-tests-summary.md) - Context

---

## Execution Priority

1. **Phase 1** (CRITICAL): Fix Edge Runtime errors - bloquea desarrollo
2. **Phase 2** (HIGH): Eliminar bucles infinitos - bloquea UX
3. **Phase 3** (MEDIUM): Refactorizar autenticación - mejora arquitectura
4. **Phase 4** (LOW): Optimizaciones - mejora performance
5. **Phase 5** (HIGH): Testing - valida solución

## Success Criteria

✅ Middleware ejecuta en Node.js Runtime sin errores
✅ NO hay Edge Runtime compilation warnings
✅ NO hay bucles infinitos en ningún flujo de autenticación
✅ Usuarios no autenticados redirigen a `/catalog` con modal
✅ Modal se abre automáticamente y redirige correctamente después de login
✅ Todos los tests E2E pasan
✅ Winston logger funciona correctamente en Server Components y Server Actions
✅ RBAC sigue funcionando correctamente (admin, seller, user roles)
