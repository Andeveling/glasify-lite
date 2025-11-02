# Feature Specification: Admin Quotes Dashboard with Status Differentiation

**Feature Branch**: `001-admin-quotes-dashboard`  
**Created**: 2025-11-02  
**Status**: Draft  
**Input**: User description: "Yo como admin de mi negocio de ventanas quiero poder ver todas las cotizaciones del sistema para gestionar mis clientes y tomar mejores desiciones, debo poder ver cotizaciones en todos los estados, y direfenciarlos"

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

## Clarifications

### Session 2025-11-02

- Q: Ubicación de la ruta para uniformidad con módulo admin → A: La ruta será `/admin/quotes` usando el route group `(dashboard)/admin/quotes`
- Q: Información de contacto del usuario en vista de detalle → A: Mostrar email y teléfono del usuario creador (si está disponible)
- Q: Alcance de búsqueda expandida → A: Buscar por nombre de proyecto Y nombre de usuario creador
- Q: Visualización de roles de usuario en la lista → A: Mostrar badge de rol solo para admin y seller (seller será implementado en versión futura)
- Q: Patrón de layout para uniformidad con otros módulos admin → A: Seguir patrón: Header → Filtros/Búsqueda → Lista/Tabla → Paginación (como /admin/models)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Quotes in Dashboard (Priority: P1)

Como administrador, necesito ver una lista completa de todas las cotizaciones del sistema (independientemente del usuario que las creó) para tener visibilidad total sobre el pipeline de ventas y el estado de los proyectos de clientes.

**Why this priority**: Esta es la funcionalidad core del feature. Sin una vista consolidada de todas las cotizaciones, el administrador no puede gestionar efectivamente el negocio ni identificar oportunidades o problemas.

**Independent Test**: Se puede probar accediendo a `/admin/quotes` como administrador y verificando que se muestran cotizaciones de múltiples usuarios, no solo las propias. El valor entregado es visibilidad completa del sistema.

**Acceptance Scenarios**:

1. **Given** soy administrador autenticado, **When** navego a `/admin/quotes`, **Then** veo todas las cotizaciones del sistema (no solo las mías)
2. **Given** hay cotizaciones de 3 usuarios diferentes, **When** cargo el dashboard, **Then** veo cotizaciones de los 3 usuarios en la lista
3. **Given** existen cotizaciones en estados draft, sent y canceled, **When** cargo el dashboard sin filtros, **Then** veo cotizaciones en todos los estados mezcladas
4. **Given** hay 50 cotizaciones en total, **When** uso paginación, **Then** puedo navegar por todas las páginas para ver el total

---

### User Story 2 - Differentiate Quotes by Status (Priority: P1)

Como administrador, necesito poder identificar rápidamente el estado de cada cotización (borrador, enviada, cancelada) mediante indicadores visuales claros para priorizar mi trabajo y entender el estado de cada proyecto sin tener que abrir cada cotización.

**Why this priority**: La diferenciación visual de estados es crítica para la toma de decisiones. Un administrador necesita identificar inmediatamente qué cotizaciones requieren acción (borradores), cuáles están en proceso (enviadas) y cuáles están cerradas (canceladas).

**Independent Test**: Se puede probar visualizando la lista de cotizaciones y verificando que cada estado tiene identificadores visuales únicos (badges, colores, iconos). El valor es permitir escaneo rápido de la lista sin leer texto.

**Acceptance Scenarios**:

1. **Given** veo una cotización en estado "draft", **When** observo su tarjeta/fila, **Then** veo un badge/indicador visual que dice "Borrador" con color distintivo
2. **Given** veo una cotización en estado "sent", **When** observo su tarjeta/fila, **Then** veo un badge/indicador visual que dice "Enviada" con color diferente al de borrador
3. **Given** veo una cotización en estado "canceled", **When** observo su tarjeta/fila, **Then** veo un badge/indicador visual que dice "Cancelada" con color diferente a los otros estados
4. **Given** tengo cotizaciones en los 3 estados en la misma vista, **When** escaneo visualmente la lista, **Then** puedo identificar el estado de cada una sin leer el texto completo

---

### User Story 3 - Filter Quotes by Status (Priority: P2)

Como administrador, necesito poder filtrar la lista de cotizaciones por estado específico (solo borradores, solo enviadas, solo canceladas) para enfocarme en un tipo particular de trabajo o análisis sin distracciones de otros estados.

**Why this priority**: Los filtros permiten workflows eficientes. Un administrador puede querer ver solo "borradores" para seguimiento de cotizaciones pendientes, o solo "enviadas" para monitoreo de conversión, sin mezclar estados que no son relevantes en ese momento.

**Independent Test**: Se puede probar usando los filtros de estado y verificando que solo se muestran cotizaciones del estado seleccionado. El valor es permitir análisis y acciones enfocadas por tipo de cotización.

**Acceptance Scenarios**:

1. **Given** hay cotizaciones en los 3 estados, **When** selecciono filtro "Solo Borradores", **Then** veo únicamente cotizaciones en estado draft
2. **Given** hay cotizaciones en los 3 estados, **When** selecciono filtro "Solo Enviadas", **Then** veo únicamente cotizaciones en estado sent
3. **Given** hay cotizaciones en los 3 estados, **When** selecciono filtro "Solo Canceladas", **Then** veo únicamente cotizaciones en estado canceled
4. **Given** tengo un filtro de estado activo, **When** selecciono "Todos los Estados", **Then** vuelvo a ver cotizaciones en todos los estados
5. **Given** aplico un filtro de estado, **When** la paginación cambia, **Then** el filtro se mantiene activo en todas las páginas

---

### User Story 4 - View Quote Owner Information with Role (Priority: P2)

Como administrador, necesito ver quién creó cada cotización (nombre del usuario/vendedor) junto con su rol (Admin/Seller) para poder hacer seguimiento personalizado, asignar responsabilidades y analizar el desempeño de cada vendedor.

**Why this priority**: Para la gestión de clientes y toma de decisiones, es esencial saber qué usuario generó cada cotización y su rol. Esto permite asignar seguimientos, evaluar vendedores y contactar al responsable correcto. La diferenciación visual de roles ayuda a priorizar revisiones.

**Independent Test**: Se puede probar visualizando la lista y verificando que cada cotización muestra información del usuario creador junto con un badge de rol. El valor es visibilidad de responsabilidad, trazabilidad y jerarquía.

**Acceptance Scenarios**:

1. **Given** una cotización fue creada por usuario "Juan Pérez" con rol Admin, **When** veo la lista como admin, **Then** veo el nombre "Juan Pérez" con badge "Admin"
2. **Given** una cotización fue creada por usuario Seller (para versión futura), **When** veo la lista, **Then** veo badge "Seller" diferenciado visualmente de "Admin"
3. **Given** múltiples cotizaciones de diferentes usuarios, **When** escaneo la lista, **Then** puedo identificar quién creó cada una y su rol sin abrirlas
4. **Given** un usuario tiene rol "user" (cliente regular), **When** veo sus cotizaciones, **Then** NO veo badge de rol (solo Admin y Seller muestran badge)

---

### User Story 5 - Sort Quotes by Key Metrics (Priority: P3)

Como administrador, necesito poder ordenar las cotizaciones por fecha de creación, monto total o fecha de vencimiento para priorizar acciones (ej: cotizaciones próximas a vencer) o analizar patrones (ej: cotizaciones más grandes primero).

**Why this priority**: El ordenamiento mejora la eficiencia al permitir al administrador priorizar revisiones. Por ejemplo, ordenar por "próximas a vencer" permite seguimiento proactivo, o por "mayor monto" permite enfoque en proyectos más valiosos.

**Independent Test**: Se puede probar usando controles de ordenamiento y verificando que la lista se reorganiza según el criterio seleccionado. El valor es permitir priorización basada en diferentes criterios de negocio.

**Acceptance Scenarios**:

1. **Given** hay cotizaciones creadas en diferentes fechas, **When** ordeno por "Más Recientes", **Then** veo las cotizaciones con la fecha más reciente primero
2. **Given** hay cotizaciones creadas en diferentes fechas, **When** ordeno por "Más Antiguas", **Then** veo las cotizaciones con la fecha más antigua primero
3. **Given** hay cotizaciones con diferentes montos, **When** ordeno por "Mayor Monto", **Then** veo las cotizaciones con el total más alto primero
4. **Given** hay cotizaciones con diferentes fechas de vencimiento, **When** ordeno por "Próximas a Vencer", **Then** veo las cotizaciones con validUntil más próximo primero

---

### User Story 7 - View User Contact Information in Quote Detail (Priority: P2)

Como administrador, necesito ver el email y teléfono del usuario que creó la cotización en la vista de detalle para poder contactarle directamente sobre proyectos específicos, resolver dudas o hacer seguimiento de ventas.

**Why this priority**: La información de contacto es esencial para la gestión de clientes. Un administrador necesita poder contactar rápidamente al vendedor o cliente que generó una cotización sin tener que buscar en otros sistemas.

**Independent Test**: Se puede probar abriendo una cotización específica y verificando que se muestra una sección con email (clickeable) y teléfono del usuario creador. El valor es facilitar comunicación directa.

**Acceptance Scenarios**:

1. **Given** abro una cotización creada por "Juan Pérez", **When** veo la vista de detalle, **Then** veo sección "Información del Creador" con email y teléfono (si disponible)
2. **Given** el usuario tiene email "juan@example.com", **When** veo su información, **Then** el email es clickeable (mailto:) para abrir cliente de correo
3. **Given** el usuario no tiene teléfono registrado, **When** veo su información, **Then** solo se muestra el email (sin campo vacío de teléfono)
4. **Given** veo información de contacto, **When** también veo el rol del usuario (Admin/Seller), **Then** puedo identificar si contacto a un administrador o vendedor

---

### User Story 8 - Search Quotes by Project Name or User (Priority: P3)

Como administrador, necesito poder buscar cotizaciones por nombre de proyecto o nombre de usuario creador para encontrar rápidamente cotizaciones específicas sin tener que navegar página por página.

**Why this priority**: La búsqueda es esencial para productividad cuando hay decenas o cientos de cotizaciones. Permite responder rápidamente preguntas como "¿qué cotizaciones tenemos para el proyecto Torre Central?" o "¿cuántas cotizaciones generó el vendedor Pedro?".

**Independent Test**: Se puede probar ingresando términos de búsqueda y verificando que solo se muestran cotizaciones relevantes. El valor es acceso rápido a información específica sin navegación manual.

**Acceptance Scenarios**:

1. **Given** hay una cotización con projectName "Torre Central", **When** busco "Torre Central", **Then** veo esa cotización en los resultados
2. **Given** hay cotizaciones creadas por "Pedro García", **When** busco "Pedro", **Then** veo todas las cotizaciones creadas por usuarios con "Pedro" en su nombre
3. **Given** hay múltiples cotizaciones, **When** busco por un término parcial (ej: "Torre"), **Then** veo todas las cotizaciones que contienen "Torre" en el nombre de proyecto O en el nombre del usuario
4. **Given** busco un término que no existe, **When** ejecuto la búsqueda, **Then** veo mensaje "No se encontraron cotizaciones" con opción para limpiar filtros
5. **Given** tengo búsqueda activa, **When** combino con filtro de estado, **Then** veo resultados que coinciden con ambos criterios

---

### Edge Cases

- **Paginación sin resultados**: ¿Qué pasa cuando un filtro de estado no tiene cotizaciones? → Mostrar estado vacío con mensaje específico (ej: "No hay cotizaciones en estado Borrador")
- **Usuario sin nombre**: ¿Cómo se muestra una cotización si el usuario creador fue eliminado o no tiene nombre? → Mostrar "Usuario desconocido" o el email como fallback
- **Cotizaciones expiradas**: ¿Cómo se diferencian cotizaciones expiradas de las vigentes? → Agregar indicador visual (ej: badge "Expirada" o tachado) además del estado
- **Muchos usuarios**: Si hay 50+ vendedores, ¿cómo filtrar por usuario específico? → Agregar filtro dropdown con búsqueda de usuarios o autocompletado
- **Cotización sin proyecto**: ¿Cómo se muestra una cotización sin projectName? → Usar placeholder "Sin nombre de proyecto" en lugar de dejarla en blanco
- **Rendimiento con miles de cotizaciones**: ¿La paginación mantiene buen rendimiento con 1000+ cotizaciones? → Implementar paginación server-side con límite razonable (10-20 por página)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEBE mostrar todas las cotizaciones del sistema (no filtradas por usuario) cuando el usuario autenticado tiene rol "admin"
- **FR-002**: Sistema DEBE mostrar la siguiente información por cada cotización en la lista: nombre de proyecto, estado, fecha de creación, monto total, fecha de vencimiento, usuario creador con badge de rol (Admin/Seller únicamente)
- **FR-003**: Sistema DEBE diferenciar visualmente los 3 estados de cotización mediante badges de colores:
  - Draft (Borrador): Badge con color distintivo (ej: amarillo/warning)
  - Sent (Enviada): Badge con color distintivo (ej: azul/info)
  - Canceled (Cancelada): Badge con color distintivo (ej: gris/neutral)
- **FR-004**: Sistema DEBE permitir filtrar cotizaciones por estado mediante controles UI (botones/tabs) con opciones: "Todas", "Borradores", "Enviadas", "Canceladas"
- **FR-005**: Sistema DEBE mostrar badge de rol del usuario creador solo para roles Admin y Seller (omitir badge para rol "user")
- **FR-006**: Sistema DEBE proporcionar controles de ordenamiento con opciones: fecha de creación (asc/desc), monto total (asc/desc), fecha de vencimiento (asc/desc)
- **FR-007**: Sistema DEBE proporcionar campo de búsqueda que filtre cotizaciones por nombre de proyecto O nombre de usuario creador (búsqueda parcial case-insensitive en ambos campos)
- **FR-008**: Sistema DEBE implementar paginación con límite configurable (default: 10-20 cotizaciones por página)
- **FR-009**: Sistema DEBE mantener filtros, búsqueda y ordenamiento activos al navegar entre páginas (persistencia en URL search params)
- **FR-010**: Sistema DEBE mostrar contador de resultados totales (ej: "Mostrando 1-10 de 45 cotizaciones")
- **FR-011**: Sistema DEBE mostrar indicador visual de cotizaciones expiradas (validUntil < fecha actual) además del estado
- **FR-012**: Sistema DEBE permitir hacer clic en una cotización para navegar a su vista de detalle
- **FR-013**: Sistema DEBE mostrar estado vacío apropiado cuando no hay cotizaciones o cuando filtros no producen resultados
- **FR-014**: Sistema DEBE ser accesible solo para usuarios con rol "admin" en ruta `/admin/quotes` (verificación en middleware y tRPC)
- **FR-015**: Sistema DEBE usar query tRPC existente `quote.list-all` para obtener datos (ya implementado con filtros y paginación)
- **FR-016**: Vista de detalle DEBE mostrar sección "Información del Creador" con email (clickeable con mailto:) y teléfono del usuario creador (si disponible)
- **FR-017**: Vista de detalle DEBE mostrar rol del usuario creador junto a su información de contacto
- **FR-018**: Sistema DEBE seguir patrón de layout: Header con título/descripción → Filtros y Búsqueda → Lista/Tabla de cotizaciones → Paginación (consistente con /admin/models)

### Key Entities

- **Quote**: Cotización del sistema con estados draft/sent/canceled, información de proyecto, montos, fechas y relación con usuario creador
  - Atributos clave: id, status, projectName, total, validUntil, createdAt, sentAt, userId
  - Relación: Pertenece a un User (creador)
  
- **User**: Usuario del sistema que crea cotizaciones
  - Atributos relevantes: id, name, email, role (admin/seller/user)
  
- **QuoteStatus**: Enumeración de estados posibles
  - Valores: draft (borrador), sent (enviada), canceled (cancelada)

### File Organization

Esta feature refactoriza la vista existente de `/dashboard/quotes` moviéndola a `/admin/quotes` dentro del route group `(dashboard)` para uniformidad con otros módulos administrativos:

```
src/app/(dashboard)/admin/quotes/
├── _components/
│   ├── quote-list-item.tsx          # Componente de fila/card individual (refactorizar desde /quotes)
│   ├── quote-filters.tsx            # Controles de filtrado por estado (migrar desde /quotes)
│   ├── quote-search.tsx             # Campo de búsqueda expandida (proyecto + usuario)
│   ├── quote-sort-controls.tsx      # Controles de ordenamiento (crear)
│   ├── quote-status-badge.tsx       # Badge de estado con colores (crear)
│   ├── quote-role-badge.tsx         # Badge de rol usuario (Admin/Seller) (crear)
│   ├── quote-expiration-badge.tsx   # Badge para cotizaciones expiradas (crear)
│   ├── empty-quotes-state.tsx       # Estado vacío (migrar desde /quotes)
│   └── quotes-pagination.tsx        # Paginación con info de totales (crear o migrar)
├── [quoteId]/
│   ├── _components/
│   │   ├── quote-detail-view.tsx    # Vista completa de cotización (migrar)
│   │   └── user-contact-info.tsx    # Sección de info de contacto del creador (crear)
│   └── page.tsx                     # Server Component detalle (migrar desde /quotes/[id])
├── page.tsx                         # Server Component principal (migrar desde /quotes)
└── layout.tsx                       # Layout compartido con /admin/* (usar existente)

src/server/api/routers/quote/
└── quote.ts                         # tRPC router con procedure list-all (sin cambios)
```

**Patrón de Layout Uniforme** (Header → Filtros/Búsqueda → Lista → Paginación):
1. **Header**: Título "Todas las Cotizaciones" + descripción + breadcrumbs
2. **Filtros y Búsqueda**: Tabs de estado + campo de búsqueda + controles de ordenamiento
3. **Lista/Tabla**: Cards o filas de cotizaciones con toda la información
4. **Paginación**: Controles de página + contador de resultados

**SOLID Requirements**:
- Single Responsibility: Cada badge/control es un componente separado
- No magic numbers: Colores de badges definidos en constantes o variables CSS
- No lógica de datos en componentes UI: Server Component (page.tsx) hace fetch, componentes reciben props
- Estado compartido vía URL search params: Filtros, búsqueda, paginación persisten en URL
- Migración limpia: Deprecar `/dashboard/quotes` y redirigir a `/admin/quotes`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores pueden identificar el estado de cualquier cotización en la lista en menos de 2 segundos mediante escaneo visual (sin leer texto completo)
- **SC-002**: Administradores pueden filtrar la lista a un estado específico con 1 clic y ver resultados inmediatamente
- **SC-003**: El dashboard carga y muestra la primera página de cotizaciones en menos de 2 segundos en condiciones normales de red
- **SC-004**: La paginación permite navegar entre páginas sin perder filtros o búsquedas activas (100% de persistencia de estado)
- **SC-005**: La búsqueda por nombre de proyecto retorna resultados relevantes que incluyen el término buscado (100% de precisión para coincidencias exactas)
- **SC-006**: Los colores de badges de estado tienen suficiente contraste para ser distinguibles por usuarios con deficiencia de color (WCAG AA compliance)
- **SC-007**: Administradores pueden completar una búsqueda de cotización específica en menos de 10 segundos (desde llegada al dashboard hasta encontrar la cotización)

## Assumptions

- Se asume que el tRPC procedure `quote.list-all` ya implementado soporta búsqueda por nombre de proyecto Y nombre de usuario creador
- Se asume que la ruta actual `/dashboard/quotes` será migrada completamente a `/admin/quotes` usando route group `(dashboard)/admin/quotes`
- Se asume que existe un redirect de `/dashboard/quotes` a `/admin/quotes` para backward compatibility durante la migración
- Se asume que los badges de estado actuales necesitan mejora visual para mayor diferenciación
- Se asume que el sistema de colores del proyecto (Tailwind/Shadcn) tiene variantes apropiadas para representar los 3 estados distintamente
- Se asume que la diferenciación de cotizaciones expiradas es un valor agregado no incluido en los estados base (draft/sent/canceled)
- Se asume que el modelo User ya tiene campos email (requerido) y teléfono (opcional)
- Se asume que el badge de rol "Seller" será implementado en versión futura (v2.0) cuando se habilite el rol seller
- Se asume que el patrón de layout de `/admin/models` es el estándar para todos los módulos administrativos
- Se asume que la vista de detalle actual en `/dashboard/quotes/[id]` será migrada a `/admin/quotes/[quoteId]`

## Dependencies

- **Technical**: 
  - tRPC procedure `quote.list-all` (ya implementado)
  - Sistema de autenticación Better Auth con roles (ya implementado)
  - Middleware de autorización para rutas admin (ya implementado)
  - Componentes UI de Shadcn (Badge, Card, Table, etc.)
  
- **Business**:
  - Definición clara de estados de cotización (QuoteStatus enum: draft, sent, canceled)
  - Acceso a todos los usuarios del sistema para mostrar información del creador
  
- **Architectural**:
  - Next.js 16 App Router con Server Components
  - URL state management para filtros (search params)
  - Server-side pagination pattern ya establecido en el proyecto
