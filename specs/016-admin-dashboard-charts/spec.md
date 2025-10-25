# Feature Specification: Dashboard Informativo con Métricas y Charts

**Feature Branch**: `016-admin-dashboard-charts`  
**Created**: 2025-10-23  
**Status**: Draft  
**Input**: User description: "Los admins y sellers necesitan tener un dashboard informativo usando charts de shadcn, necesitamos dar informacion de valor e informacion de uso de la plataforma para la toma de desiciones"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualización de Rendimiento de Cotizaciones (Priority: P1)

Como admin o seller, necesito ver métricas clave sobre el rendimiento de cotizaciones (total generadas, tasas de conversión, tendencias temporales) en un dashboard centralizado, para identificar rápidamente oportunidades de mejora y tomar decisiones informadas sobre el negocio.

**Why this priority**: Esta es la funcionalidad core que proporciona el mayor valor inmediato. Permite a los usuarios entender el estado actual del negocio y la efectividad de las cotizaciones sin necesidad de análisis manual de datos.

**Independent Test**: Puede ser probado completamente accediendo al dashboard y verificando que muestra: total de cotizaciones por estado (draft/sent/canceled), tasa de conversión, y gráfico de tendencia de los últimos 30 días. Entrega valor inmediato mostrando el estado del negocio.

**Acceptance Scenarios**:

1. **Given** soy un admin autenticado, **When** accedo al dashboard, **Then** veo un resumen con: total de cotizaciones, cotizaciones enviadas, cotizaciones canceladas, y tasa de conversión (enviadas/total)
2. **Given** soy un seller autenticado, **When** accedo al dashboard, **Then** veo las mismas métricas pero filtradas solo a mis cotizaciones propias
3. **Given** estoy viendo el dashboard, **When** las métricas se cargan, **Then** veo un gráfico de líneas mostrando la evolución de cotizaciones creadas en los últimos 30 días
4. **Given** estoy viendo el dashboard, **When** no hay datos disponibles, **Then** veo mensajes informativos indicando que aún no hay información para mostrar

---

### User Story 2 - Análisis de Catálogo y Productos Populares (Priority: P2)

Como admin, necesito ver qué modelos y tipos de cristal son los más cotizados, para optimizar el inventario, identificar productos más rentables y ajustar precios estratégicamente.

**Why this priority**: Proporciona insights valiosos sobre preferencias de clientes y productos rentables, pero es secundario a entender el rendimiento general de cotizaciones. Ayuda en decisiones de inventario y pricing.

**Independent Test**: Puede ser probado verificando que el dashboard muestra: top 5 modelos más cotizados, top 5 tipos de cristal más usados, y distribución de cotizaciones por fabricante de perfiles. Funciona independientemente de otras métricas.

**Acceptance Scenarios**:

1. **Given** soy un admin, **When** accedo a la sección de análisis de catálogo, **Then** veo un gráfico de barras con los 5 modelos más cotizados y su cantidad de apariciones
2. **Given** soy un admin, **When** veo el análisis de catálogo, **Then** veo un gráfico circular mostrando la distribución de tipos de cristal utilizados en cotizaciones
3. **Given** soy un admin, **When** veo el análisis de catálogo, **Then** veo métricas sobre qué fabricantes de perfiles (ProfileSupplier) son más populares
4. **Given** soy un seller, **When** intento acceder al análisis de catálogo detallado, **Then** veo solo información de mis propias cotizaciones

---

### User Story 3 - Métricas de Valor Monetario (Priority: P3)

Como admin, necesito ver métricas monetarias (valor total de cotizaciones, valor promedio, distribución por rangos de precio) para entender el volumen financiero del negocio y detectar oportunidades de optimización de precios.

**Why this priority**: Aunque importante para decisiones financieras, es menos crítico que entender volumen y popularidad de productos. Complementa los insights de P1 y P2 con información financiera.

**Independent Test**: Puede ser probado verificando que muestra: valor total de cotizaciones en el período, ticket promedio, y distribución de cotizaciones por rangos de precio. Es independiente y funciona con datos de Quote.total.

**Acceptance Scenarios**:

1. **Given** soy un admin, **When** accedo a métricas de valor, **Then** veo el valor total de todas las cotizaciones en el período seleccionado
2. **Given** soy un admin, **When** veo métricas de valor, **Then** veo el valor promedio por cotización
3. **Given** soy un admin, **When** veo métricas de valor, **Then** veo un gráfico de barras mostrando distribución de cotizaciones por rangos de precio (ej: 0-1M, 1M-5M, 5M-10M, 10M+)
4. **Given** soy un seller, **When** veo métricas de valor, **Then** veo solo los valores correspondientes a mis cotizaciones propias

---

### User Story 4 - Filtros Temporales y Comparativas (Priority: P4)

Como admin o seller, necesito poder filtrar todas las métricas del dashboard por períodos de tiempo (últimos 7 días, 30 días, 90 días, año actual) y comparar con períodos anteriores, para identificar tendencias y cambios en el comportamiento del negocio.

**Why this priority**: Mejora la utilidad de todas las métricas anteriores pero requiere que estén implementadas primero. Es una funcionalidad de análisis avanzado que complementa las visualizaciones básicas.

**Independent Test**: Puede ser probado seleccionando diferentes períodos de tiempo y verificando que todas las métricas se actualizan correctamente. Funciona como una capa sobre las otras historias.

**Acceptance Scenarios**:

1. **Given** estoy viendo el dashboard, **When** selecciono un período de tiempo (7, 30, 90 días, año actual), **Then** todas las métricas y gráficos se actualizan para reflejar solo ese período
2. **Given** he seleccionado un período, **When** el sistema calcula las métricas, **Then** veo indicadores de cambio porcentual comparado con el período anterior equivalente (ej: +15% vs período anterior)
3. **Given** selecciono "año actual", **When** veo los gráficos, **Then** las visualizaciones muestran datos agrupados por mes
4. **Given** no hay datos en el período anterior para comparación, **When** veo los indicadores, **Then** se muestra "N/A" o "Sin datos previos" en lugar de porcentajes

---

### Edge Cases

- ¿Qué pasa cuando un usuario nuevo (admin o seller) accede al dashboard sin cotizaciones generadas? → Mostrar estado vacío con mensaje motivacional y CTA para crear primera cotización
- ¿Cómo se manejan los gráficos cuando hay muy pocos datos (ej: solo 2-3 cotizaciones)? → Mostrar los datos disponibles con nota indicando que más datos mejorarán la precisión
- ¿Qué sucede si un modelo o tipo de cristal es eliminado pero tiene datos históricos? → Mantener las estadísticas históricas pero marcar como "Producto descontinuado"
- ¿Cómo se comportan las métricas de sellers que no tienen cotizaciones propias? → Mostrar dashboard vacío con guía sobre cómo empezar a crear cotizaciones
- ¿Qué pasa con cotizaciones en diferentes monedas (por TenantConfig.currency)? → Todas las métricas monetarias deben respetar la moneda configurada y mostrarla claramente
- ¿Cómo se manejan los filtros temporales cuando cruzan años? → Permitir selección correcta y mostrar datos agrupados apropiadamente

## Requirements *(mandatory)*

### Functional Requirements

#### Acceso y Permisos

- **FR-001**: System MUST permitir acceso al dashboard solo a usuarios autenticados con roles admin o seller
- **FR-002**: System MUST mostrar a sellers únicamente datos de sus propias cotizaciones (Quote.userId = current user)
- **FR-003**: System MUST mostrar a admins datos de todas las cotizaciones del sistema sin restricciones
- **FR-004**: System MUST denegar acceso al dashboard a usuarios con rol user

#### Métricas de Cotizaciones (P1)

- **FR-005**: System MUST calcular y mostrar el total de cotizaciones creadas en el período seleccionado
- **FR-006**: System MUST calcular y mostrar la cantidad de cotizaciones por estado: draft, sent, canceled
- **FR-007**: System MUST calcular tasa de conversión como: (cotizaciones sent / total cotizaciones) × 100
- **FR-008**: System MUST generar gráfico de líneas mostrando evolución de cotizaciones creadas por día en los últimos 30 días
- **FR-009**: System MUST usar Quote.createdAt para agrupamiento temporal
- **FR-010**: System MUST mostrar indicadores visuales de cambio (positivo/negativo) comparado con período anterior

#### Análisis de Catálogo (P2)

- **FR-011**: System MUST calcular los 5 modelos más cotizados basándose en QuoteItem.modelId y sus frecuencias
- **FR-012**: System MUST mostrar nombre del modelo (Model.name) y fabricante de perfil (ProfileSupplier.name) para cada modelo top
- **FR-013**: System MUST calcular los 5 tipos de cristal más usados basándose en QuoteItem.glassTypeId
- **FR-014**: System MUST mostrar nombre del tipo de cristal (GlassType.name) y código (GlassType.code) para cada tipo top
- **FR-015**: System MUST generar gráfico circular mostrando distribución porcentual de fabricantes de perfiles en cotizaciones
- **FR-016**: System MUST incluir solo modelos y cristales de cotizaciones en el período seleccionado

#### Métricas Monetarias (P3)

- **FR-017**: System MUST calcular valor total sumando Quote.total de todas las cotizaciones en el período
- **FR-018**: System MUST calcular valor promedio como: valor total / cantidad de cotizaciones
- **FR-019**: System MUST agrupar cotizaciones en rangos de precio configurables (ej: 0-1M, 1M-5M, 5M-10M, 10M+)
- **FR-020**: System MUST usar TenantConfig.currency para formatear todos los valores monetarios
- **FR-021**: System MUST usar TenantConfig.locale para formatear números según convenciones locales
- **FR-022**: System MUST mostrar símbolo de moneda en todas las visualizaciones monetarias

#### Filtros Temporales (P4)

- **FR-023**: System MUST permitir selección de período: últimos 7 días, 30 días, 90 días, año actual
- **FR-024**: System MUST actualizar todas las métricas y gráficos cuando se cambia el período seleccionado
- **FR-025**: System MUST calcular período anterior equivalente para comparaciones (ej: si selecciono últimos 30 días, comparar con 30 días anteriores a esos)
- **FR-026**: System MUST mostrar indicadores de cambio porcentual entre período actual y anterior
- **FR-027**: System MUST usar TenantConfig.timezone para cálculos de fechas y agrupamientos temporales
- **FR-028**: System MUST manejar correctamente períodos que cruzan meses o años

#### Visualización y UX

- **FR-029**: System MUST usar componentes de charts de shadcn/ui para todas las visualizaciones
- **FR-030**: System MUST mostrar estados de carga (loading) mientras se calculan métricas
- **FR-031**: System MUST mostrar mensajes informativos cuando no hay datos disponibles (empty states)
- **FR-032**: System MUST ser responsive y funcionar en dispositivos móviles y desktop
- **FR-033**: System MUST usar texto en español (es-LA) para todas las etiquetas y descripciones
- **FR-034**: System MUST mostrar tooltips informativos en gráficos al hacer hover
- **FR-035**: System MUST actualizar métricas automáticamente cuando hay cambios en datos subyacentes

### Key Entities

- **Quote**: Entidad principal para métricas. Atributos clave: id, userId, status (draft/sent/canceled), total (valor monetario), createdAt, sentAt. Relaciones: items (QuoteItem[]), user (User)
- **QuoteItem**: Items individuales de cotizaciones. Atributos clave: id, quoteId, modelId, glassTypeId, quantity, subtotal. Relaciones: model (Model), glassType (GlassType), quote (Quote)
- **Model**: Modelos de ventanas/puertas cotizados. Atributos clave: id, name, profileSupplierId, status. Relaciones: profileSupplier (ProfileSupplier), quoteItems (QuoteItem[])
- **GlassType**: Tipos de cristal utilizados. Atributos clave: id, name, code, manufacturer, pricePerSqm. Relaciones: quoteItems (QuoteItem[])
- **ProfileSupplier**: Fabricantes de perfiles. Atributos clave: id, name, materialType. Relaciones: models (Model[])
- **User**: Usuarios del sistema. Atributos clave: id, name, email, role (admin/seller/user). Relaciones: quotes (Quote[])
- **TenantConfig**: Configuración del tenant (singleton). Atributos clave: currency, locale, timezone. Usado para formateo de números y fechas

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins y sellers pueden ver el estado actual de cotizaciones (totales por estado) en menos de 3 segundos desde que cargan el dashboard
- **SC-002**: Usuarios pueden identificar los 3 productos más populares (modelos y cristales) en menos de 5 segundos de navegación en el dashboard
- **SC-003**: Sistema muestra métricas de valor monetario con la moneda y formato correcto del tenant configurado en 100% de los casos
- **SC-004**: Dashboard carga y muestra todas las métricas principales (P1) en menos de 2 segundos con hasta 1000 cotizaciones
- **SC-005**: Sellers ven únicamente sus propias cotizaciones en 100% de los casos (aislamiento de datos verificable)
- **SC-006**: Admins pueden comparar rendimiento entre dos períodos de tiempo y ver cambio porcentual en menos de 10 segundos
- **SC-007**: Dashboard es completamente funcional y legible en dispositivos móviles (viewport mínimo 375px)
- **SC-008**: Todos los gráficos y visualizaciones incluyen tooltips informativos que se activan al hover
- **SC-009**: Estados vacíos (sin datos) muestran mensajes claros y accionables en lugar de errores o pantallas en blanco
- **SC-010**: Dashboard soporta agrupamiento temporal correcto incluso cuando los datos cruzan múltiples años

## Assumptions

- **A-001**: TenantConfig ya está correctamente configurado con currency, locale y timezone válidos
- **A-002**: El sistema tiene suficientes datos históricos (al menos 30 días) para que las comparaciones temporales sean significativas
- **A-003**: Los usuarios están familiarizados con interpretación básica de gráficos (líneas, barras, circulares)
- **A-004**: La biblioteca shadcn/ui charts está disponible y configurada en el proyecto
- **A-005**: Los rangos de precio para agrupamiento son apropiados para la moneda configurada (se asume COP basado en contexto colombiano)
- **A-006**: El volumen de datos es manejable para cálculos en tiempo real (< 10,000 cotizaciones). Para volúmenes mayores, se puede requerir caché o agregación pre-calculada
- **A-007**: NextAuth.js está correctamente configurado y proporciona información confiable del usuario autenticado
- **A-008**: El middleware RBAC existente del proyecto protege correctamente las rutas del dashboard

## Dependencies

- **D-001**: Sistema de autenticación NextAuth.js debe estar funcional y retornar correctamente user.role
- **D-002**: Middleware RBAC debe estar implementado y protegiendo rutas admin/seller
- **D-003**: shadcn/ui debe estar instalado con componentes de charts disponibles
- **D-004**: tRPC debe estar configurado para procedures que consulten Quote, QuoteItem, Model, GlassType
- **D-005**: Prisma ORM debe tener acceso a base de datos PostgreSQL con schema actualizado
- **D-006**: TenantConfig debe existir en la base de datos con valores válidos
- **D-007**: Helper functions de formateo (formatCurrency, formatDate) deben estar disponibles en @lib/format

## Out of Scope

- Exportación de datos a Excel/PDF (puede ser feature futura)
- Dashboard personalizable por usuario (drag & drop widgets)
- Alertas automáticas cuando métricas caen bajo umbrales
- Integración con sistemas externos de BI (Business Intelligence)
- Gráficos avanzados (heat maps, gráficos de dispersión, etc.)
- Métricas de performance del sistema (tiempo de respuesta, errores, etc.)
- Dashboard público para clientes finales (solo admin/seller)
- Comparación de rendimiento entre diferentes sellers
- Análisis predictivo o forecasting de ventas futuras
- Métricas de servicios adicionales (Service, QuoteItemService)
- Análisis de ajustes y descuentos (Adjustment)
- Seguimiento de historial de cambios de precios (ModelPriceHistory)
