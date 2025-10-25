# Feature Specification: Role-Based Access Control System

**Feature Branch**: `009-role-based-access`  
**Created**: 14 de octubre de 2025  
**Status**: Draft  
**Input**: User description: "ya tenemos una app madura, el flujo del cliente esta en su MVP por cosas por mejorar pero ya se puede completar el flujo, necesito empezar a manejar el flujo segun los roles, teniendo en cuenta el uso del middleware.ts con roles, administrador, vendedor/comercial, cliente, para empezar a desarrollar el flujo del admin"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Dashboard Access and Management (Priority: P1)

Un administrador inicia sesión con su cuenta de Google y es automáticamente redirigido al panel de administración donde puede gestionar modelos de cristal, configuración del sistema y ver todas las cotizaciones de todos los usuarios.

**Why this priority**: Este es el flujo principal que permite a los administradores acceder a las funcionalidades críticas de gestión del sistema. Sin este flujo, no hay forma de administrar el catálogo ni la configuración del negocio.

**Independent Test**: Se puede probar completamente iniciando sesión con una cuenta admin (email configurado en `ADMIN_EMAIL`) y verificando que se redirige a `/dashboard` y tiene acceso a todas las rutas de administración (`/dashboard/models`, `/dashboard/quotes`, `/dashboard/settings`).

**Acceptance Scenarios**:

1. **Given** el usuario tiene un email configurado como `ADMIN_EMAIL` en variables de entorno, **When** inicia sesión con Google OAuth, **Then** es redirigido a `/dashboard` y puede ver el panel de administración completo
2. **Given** el administrador está autenticado, **When** intenta acceder a `/dashboard/models`, `/dashboard/quotes` o `/dashboard/settings`, **Then** puede acceder a estas rutas sin restricciones
3. **Given** el administrador está autenticado, **When** intenta acceder a rutas de cliente como `/my-quotes`, **Then** puede acceder normalmente (los admins tienen acceso completo)
4. **Given** el administrador cierra sesión, **When** intenta acceder a `/dashboard`, **Then** es redirigido a `/signin` con un parámetro `callbackUrl` apuntando a `/dashboard`

---

### User Story 2 - Seller/Commercial Role Access Control (Priority: P2)

Un vendedor inicia sesión y es redirigido a una vista que le permite gestionar sus propias cotizaciones, buscar en el catálogo para crear nuevas cotizaciones, y ver estadísticas de sus ventas, pero sin acceso a configuración del sistema ni modelos.

**Why this priority**: Los vendedores son usuarios clave del sistema que generan ingresos. Necesitan acceso limitado para crear y gestionar cotizaciones sin poder modificar la configuración del sistema.

**Independent Test**: Se puede probar iniciando sesión con una cuenta que tenga rol "seller" en la base de datos y verificando que puede acceder a `/quotes` (sus cotizaciones), `/catalog` (búsqueda), pero recibe error 403 al intentar acceder a `/dashboard/models` o `/dashboard/settings`.

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

1. **Given** el usuario tiene rol "seller" en la base de datos, **When** inicia sesión con Google OAuth, **Then** es redirigido a `/quotes` (su dashboard de vendedor)
2. **Given** el vendedor está autenticado, **When** intenta acceder a `/dashboard/models` o `/dashboard/settings`, **Then** recibe un error 403 (Forbidden) o es redirigido a su dashboard
3. **Given** el vendedor está autenticado, **When** accede a `/catalog` y crea una cotización, **Then** la cotización se asocia automáticamente a su usuario
4. **Given** el vendedor está en `/quotes`, **When** visualiza la lista de cotizaciones, **Then** solo ve las cotizaciones creadas por él mismo

---

### User Story 3 - Client Role Limited Access (Priority: P1)

Un cliente final inicia sesión y es redirigido a "Mis Cotizaciones" donde puede ver únicamente sus propias cotizaciones, navegar por el catálogo público, y crear nuevas solicitudes de cotización sin acceso a ninguna funcionalidad administrativa.

**Why this priority**: Este es el flujo ya existente en el MVP que debe mantenerse funcionando. Es crítico porque representa la experiencia del usuario final que genera las solicitudes de negocio.

**Independent Test**: Se puede probar iniciando sesión con una cuenta que no sea admin ni seller, verificando que se redirige a `/my-quotes` y que todas las rutas administrativas están bloqueadas.

**Acceptance Scenarios**:

1. **Given** el usuario tiene rol "user" (cliente final), **When** inicia sesión con Google OAuth, **Then** es redirigido a `/my-quotes`
2. **Given** el cliente está autenticado, **When** intenta acceder a `/dashboard` o cualquier ruta administrativa, **Then** es redirigido a `/my-quotes` con un mensaje informativo
3. **Given** el cliente está en `/my-quotes`, **When** visualiza la lista de cotizaciones, **Then** solo ve sus propias cotizaciones
4. **Given** el cliente está autenticado, **When** accede a `/catalog` y navega por modelos de cristal, **Then** puede ver toda la información pública del catálogo

---

### User Story 4 - Role-Based Navigation and UI Elements (Priority: P2)

Los usuarios ven diferentes elementos de navegación y opciones de menú según su rol: los administradores ven enlaces al dashboard y configuración, los vendedores ven acceso a sus cotizaciones y catálogo, y los clientes solo ven sus cotizaciones y el catálogo público.

**Why this priority**: Mejora la experiencia de usuario al mostrar solo las opciones relevantes para cada rol, evitando confusión y intentos de acceso a recursos no permitidos.

**Independent Test**: Se puede probar iniciando sesión con cuentas de diferentes roles y verificando que el menú de navegación muestra solo las opciones apropiadas para cada rol.

**Acceptance Scenarios**:

1. **Given** el usuario es admin, **When** visualiza el header/sidebar de navegación, **Then** ve enlaces a "Dashboard", "Modelos", "Cotizaciones", "Configuración" y "Mis Cotizaciones"
2. **Given** el usuario es seller, **When** visualiza el header/sidebar de navegación, **Then** ve enlaces a "Mis Cotizaciones", "Catálogo" y sus estadísticas de ventas
3. **Given** el usuario es cliente, **When** visualiza el header/sidebar de navegación, **Then** ve enlaces a "Catálogo" y "Mis Cotizaciones" únicamente
4. **Given** el usuario cambia de rol (actualización en BD), **When** cierra y vuelve a iniciar sesión, **Then** ve los elementos de navegación correspondientes al nuevo rol

---

### User Story 5 - Database-Based Role Management (Priority: P3)

Los administradores pueden asignar y modificar roles de usuarios directamente desde el panel de administración, permitiendo promoción de clientes a vendedores o viceversa sin necesidad de cambiar variables de entorno.

**Why this priority**: Permite gestión dinámica de roles sin deployments. Es menor prioridad porque inicialmente se puede trabajar con roles definidos en variables de entorno o directamente en la base de datos.

**Independent Test**: Se puede probar accediendo a una sección de administración de usuarios (nueva), cambiando el rol de un usuario, y verificando que el cambio se refleja inmediatamente en la siguiente sesión del usuario.

**Acceptance Scenarios**:

1. **Given** el admin está en `/dashboard/users`, **When** selecciona un usuario y cambia su rol de "user" a "seller", **Then** el cambio se guarda en la base de datos
2. **Given** un usuario tiene su rol modificado por un admin, **When** inicia sesión nuevamente, **Then** es redirigido a la ruta apropiada para su nuevo rol
3. **Given** el admin está creando un nuevo usuario manualmente, **When** selecciona el rol durante la creación, **Then** el usuario recibe el rol asignado desde su primera sesión

---

### Edge Cases

- **Cambio de rol durante sesión activa**: ¿Qué sucede si un administrador cambia el rol de un usuario mientras este tiene una sesión activa? → El usuario mantiene su rol actual hasta que cierre sesión y vuelva a iniciar sesión
- **Usuario sin rol definido**: ¿Qué sucede si un usuario no tiene campo `role` en la base de datos (valor `null`)? → Se asigna automáticamente el rol "user" (cliente) como valor por defecto
- **Múltiples admins**: ¿Cómo se maneja si se necesita más de un administrador? → El sistema debe soportar tanto verificación por `ADMIN_EMAIL` (variable de entorno) como por campo `role = 'admin'` en la base de datos, con prioridad al campo de BD
- **Acceso directo a URLs protegidas**: ¿Qué sucede si un cliente escribe manualmente `/dashboard` en la URL? → El middleware intercepta la solicitud antes de renderizar y redirige a `/my-quotes` con un toast informativo
- **Sessión expirada en ruta protegida**: ¿Qué sucede si la sesión expira mientras el usuario está en `/dashboard`? → El middleware detecta la falta de sesión y redirige a `/signin` con `callbackUrl` apuntando a la ruta original
- **Degradación de rol (admin → user)**: ¿Qué sucede si se remueve el rol admin de un usuario que actualmente está en `/dashboard`? → En la próxima navegación o refresh, el middleware detecta el cambio y redirige apropiadamente según el nuevo rol

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization

- **FR-001**: Sistema DEBE migrar el modelo `User` de Prisma para incluir un campo `role` con valores posibles: `'admin' | 'seller' | 'user'` (default: `'user'`)
- **FR-002**: Sistema DEBE mantener compatibilidad con la variable de entorno `ADMIN_EMAIL` para designar un administrador sin modificar la base de datos
- **FR-003**: Sistema DEBE verificar el rol del usuario en dos lugares: campo `role` en BD (prioridad) y luego `ADMIN_EMAIL` (fallback)
- **FR-004**: Middleware DEBE verificar roles antes de permitir acceso a rutas protegidas basándose en la sesión de NextAuth

#### Role-Based Routing

- **FR-005**: Sistema DEBE redirigir usuarios autenticados según su rol después del login:
  - `admin` → `/dashboard`
  - `seller` → `/quotes`
  - `user` → `/my-quotes`
- **FR-006**: Middleware DEBE bloquear acceso a rutas `/dashboard/*` para usuarios con rol `user` o `seller`
- **FR-007**: Middleware DEBE permitir acceso a `/dashboard/*` solo para usuarios con rol `admin`
- **FR-008**: Sistema DEBE permitir a todos los roles autenticados acceder a `/catalog` y `/my-quotes`
- **FR-009**: Rutas de vendedor (`/quotes`) DEBEN ser accesibles solo por roles `admin` y `seller`

#### Data Isolation

- **FR-010**: tRPC procedures DEBEN filtrar cotizaciones según el rol del usuario:
  - `user`: Solo sus propias cotizaciones
  - `seller`: Solo cotizaciones creadas por él mismo
  - `admin`: Todas las cotizaciones del sistema
- **FR-011**: Sistema DEBE asociar automáticamente cotizaciones creadas al `userId` del usuario autenticado
- **FR-012**: Procedures de administración (admin router) DEBEN verificar que `session.user.role === 'admin'` antes de ejecutar

#### UI Conditional Rendering

- **FR-013**: Componentes de navegación DEBEN renderizar diferentes enlaces según el rol del usuario
- **FR-014**: Sistema DEBE proporcionar un helper component `<AdminOnly>` que solo renderice children si el usuario es admin
- **FR-015**: Sistema DEBE proporcionar un helper component `<SellerOnly>` que renderice children para admin y seller
- **FR-016**: Sistema DEBE ocultar botones de "Editar Modelo" o "Eliminar" en el catálogo para usuarios `user`

#### Admin Dashboard Features (Initial)

- **FR-017**: Dashboard DEBE mostrar métricas generales: total de cotizaciones, total de modelos, total de usuarios
- **FR-018**: Dashboard DEBE incluir navegación a: Modelos, Cotizaciones (todas), Configuración del Sistema
- **FR-019**: Ruta `/dashboard/models` DEBE listar todos los modelos con opciones de crear, editar, eliminar
- **FR-020**: Ruta `/dashboard/quotes` DEBE listar todas las cotizaciones de todos los usuarios con filtros por estado y usuario
- **FR-021**: Ruta `/dashboard/settings` DEBE permitir editar `TenantConfig` (configuración del negocio)

### Key Entities

- **User** (modificado):
  - `role`: Enum `'admin' | 'seller' | 'user'` (nuevo campo)
  - `quotes`: Relación a cotizaciones creadas por el usuario
  - `priceChanges`: Historial de cambios de precio realizados
  
- **Quote** (ya existente):
  - `userId`: Relación al usuario que creó la cotización
  - Filtrado por rol en procedures

- **TenantConfig** (ya existente):
  - Configuración del negocio editable solo por admin
  - Singleton con `id = "1"`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores pueden acceder al dashboard completo en menos de 2 segundos después del login exitoso
- **SC-002**: Sistema previene el 100% de intentos de acceso no autorizado a rutas administrativas por usuarios no-admin (0 falsos positivos)
- **SC-003**: Usuarios con rol "seller" pueden crear y visualizar sus propias cotizaciones sin ver cotizaciones de otros vendedores (100% de aislamiento de datos)
- **SC-004**: Cambios en el rol de un usuario se reflejan en su próxima sesión sin necesidad de limpiar caché o redeployar
- **SC-005**: El tiempo de carga de `/dashboard` para admins no excede 1.5 segundos (incluyendo fetch de métricas)
- **SC-006**: El 95% de usuarios acceden directamente a su dashboard correspondiente sin necesidad de navegar manualmente
- **SC-007**: Sistema maneja correctamente sesiones expiradas en rutas protegidas, redirigiendo a login y preservando la URL de destino en el 100% de los casos

---

## Assumptions

- NextAuth.js v5 ya está configurado con Google OAuth y funciona correctamente
- El middleware actual (`src/middleware.ts`) ya verifica la presencia de sesión mediante cookies
- El esquema de Prisma actual incluye el modelo `User` con relación a `Quote`
- La variable de entorno `ADMIN_EMAIL` ya está configurada en producción
- Los componentes de Shadcn/ui están disponibles para construir el admin dashboard
- El sistema actualmente opera con un solo tenant (configuración singleton en `TenantConfig`)
- Los tRPC routers ya tienen un `adminProcedure` helper que verifica el rol admin
- El proyecto usa TypeScript en modo estricto y todas las rutas son tipadas

---

## Constraints

- **No se debe romper el flujo existente de clientes** (user role) que ya funciona en MVP
- Migración de base de datos debe ser reversible (incluir rollback script)
- Middleware debe mantener alto rendimiento (verificaciones de rol en <10ms)
- No se deben agregar dependencias externas adicionales (usar solo Next.js, NextAuth, Prisma)
- El sistema debe seguir siendo single-tenant (sin multi-tenancy)
- Todas las rutas deben seguir la convención de Next.js 15 App Router
- Código debe seguir los principios SOLID y Atomic Design del proyecto
- Logs estructurados con Winston solo en server-side (nunca en Client Components)

---

## Technical Notes for Planning Phase

### Database Migration Strategy

La migración debe:
1. Agregar campo `role` al modelo `User` con default `'user'`
2. Actualizar usuario con email matching `ADMIN_EMAIL` a rol `'admin'` (si existe)
3. Crear índice en campo `role` para queries eficientes

### Middleware Enhancement

El middleware debe expandirse para:
1. Leer el rol desde la sesión de NextAuth (ya incluye `session.user.role`)
2. Implementar lógica de autorización por ruta según rol
3. Mantener lógica existente de redirección a `/auth/callback`

### tRPC Procedures Update

Procedures existentes deben actualizar:
1. `quote.list` → Filtrar por `userId` si rol es `user` o `seller`
2. Admin router → Verificar `role === 'admin'` en todos los procedures
3. Nuevo procedure `quote.list-all` solo para admins

### UI Components Needed

Componentes a crear:
1. `<AdminOnly>` - Server Component que valida rol admin
2. `<SellerOnly>` - Server Component que valida rol seller o admin
3. `<DashboardSidebar>` - Navegación del admin dashboard (ya parcialmente existe)
4. Adaptación de `<HeaderMenu>` para mostrar diferentes enlaces por rol

---

## Out of Scope (Not Included)

- Interface gráfica para gestión de usuarios (crear/editar/eliminar usuarios manualmente)
- Permisos granulares por feature (ejemplo: admin que solo puede editar modelos pero no configuración)
- Logs de auditoría de acciones administrativas
- Notificaciones push cuando un admin modifica el rol de un usuario
- Panel de vendedor con estadísticas avanzadas (solo dashboard básico con sus cotizaciones)
- Multi-tenancy (el sistema sigue siendo single-tenant)
- Roles adicionales más allá de admin, seller, user
- Importación masiva de usuarios con roles predefinidos

---

## Dependencies

- Feature funciona sobre base de NextAuth.js v5 ya configurado
- Requiere que el middleware actual (`src/middleware.ts`) esté operativo
- Depende de tRPC v11 con procedures protegidos funcionando
- Necesita Prisma Client con PostgreSQL operativo
- Asume que el router de admin (`src/server/api/routers/admin.ts`) ya existe

---

## Security Considerations

- Verificación de rol DEBE ocurrir en el servidor (middleware y tRPC procedures), nunca confiar en validaciones del cliente
- Los helper components `<AdminOnly>` y `<SellerOnly>` son para UX, NO para seguridad (la seguridad está en server-side)
- Sesiones de NextAuth deben tener expiración apropiada (configurado en `authConfig`)
- El campo `role` en la base de datos debe ser inmutable desde el cliente (solo modificable por procedures de admin)
- Las rutas de API (`/api/auth/*`) deben mantener protección CSRF de Next.js
- El middleware debe ejecutarse en Edge Runtime para máximo rendimiento

---

## Related Documentation

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Next.js 15 Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [tRPC Authorization](https://trpc.io/docs/server/authorization)
- [Prisma Enum Types](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
- Documento interno: `docs/fixes/role-based-auth-redirect.md`
- PRD del proyecto: `docs/prd.md` (Sección de Autenticación y Admin Router)

