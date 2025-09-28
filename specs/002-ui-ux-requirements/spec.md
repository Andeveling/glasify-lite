# Feature Specification: Glasify MVP — Interfaz de Usuario para Cotizador

**Feature Br8. **Given** que soy admin, **When** acceso al panel administrativo, **Then** puedo gestionar modelos, precios, servicios y ver cotizaciones recibidas de manera organizada.

### Usability Validation
- **UV-001**: Los usuarios deben completar una cotización de un ítem (desde catálogo hasta envío) en menos de 3 minutos en promedio.
- **UV-002**: Los usuarios deben poder agregar un ítem a la cotización sin cometer errores en el primer intento (tasa de éxito >80%).
- **UV-003**: Los usuarios deben poder identificar y corregir errores de medidas fuera de rango sin ayuda adicional.

### Edge Casesh**: `[002-ui-ux-requirements]`  
**Created**: 2025-09-28  
**Status**: Draft  
**Input**: User description: "UI/UX Requirements para tener una UI que consuma todos los servicios que construimos"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## Clarifications

### Session 2025-09-28
- Q: ¿Cuáles son los límites de escala que debe manejar la interfaz de usuario? → A: Cotizaciones 20 Items Catalogo hasta 100 modelos
- Q: ¿Qué estados específicos debe mostrar la interfaz cuando hay problemas o situaciones especiales? → A: Estados empty, loading, error con mensajes específicos y opciones de recuperación
- Q: ¿Qué acciones específicas puede realizar cada rol de usuario y qué restricciones existen? → A: Cliente: cotizar, enviar, ver historial. Admin: gestionar catálogo, cotizaciones y usuarios
- Q: ¿Qué navegadores y dispositivos mínimos debe soportar la aplicación? → A: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Q: ¿Cómo se debe medir y validar que la interfaz sea "intuitiva" y "clara" para los usuarios? → A: Pruebas de usabilidad básicas con tiempo de completación de tareas

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Como Cliente final quiero una interfaz intuitiva y accesible que me permita navegar el catálogo de modelos, configurar múltiples ítems con sus medidas y opciones, ver el cálculo de precios en tiempo real, completar el flujo de envío de cotización, y ver el historial de mis cotizaciones enviadas.

Como Admin (fabricante) quiero una interfaz administrativa clara que me permita gestionar mi catálogo de modelos, precios, servicios, revisar las cotizaciones recibidas, y administrar usuarios, todo en español y con una experiencia consistente.

### Acceptance Scenarios
1. **Given** que accedo al sistema, **When** navego a la página principal, **Then** veo una introducción clara del servicio, opciones de login y acceso al catálogo.

2. **Given** que estoy en el catálogo, **When** filtro por fabricante o tipo de modelo, **Then** los resultados se actualizan inmediatamente y muestran información relevante de cada modelo.

3. **Given** que selecciono un modelo, **When** ingreso medidas válidas en los campos de ancho y alto, selecciono un vidrio según la lista compatible con el modelo y selecciono los servicios disponibles que quiero incluir para la ventana (instalación, sello, etc..) **Then** el precio se calcula automáticamente en menos de 200ms y se muestra un desglose detallado.

4. **Given** que tengo un ítem configurado, **When** selecciono la cantidad, presiono "Agregar a cotización", **Then** el ítem se añade al resumen y veo la cantidad total de ítems en la cotización.

5. **Given** que tengo múltiples ítems en mi cotización, **When** reviso el resumen, **Then** veo cada ítem con su desglose, subtotales, ajustes aplicables, vigencia de la cotización y el total general.

6. **Given** que quiero enviar mi cotización, **When** inicio el proceso de envío, **Then** me autentico con Google (si es necesario), completo mis datos de contacto y dirección del proyecto en un formulario claro.

7. **Given** que completo el envío, **When** confirmo la cotización, **Then** recibo una confirmación con ID de cotización y indicaciones sobre el siguiente paso.

8. **Given** que soy admin, **When** accedo al panel administrativo, **Then** puedo gestionar modelos, precios, servicios y ver cotizaciones recibidas de manera organizada.

### Edge Cases
- Mensajes de error claros en español When las medidas están fuera de rango.
- Indicadores visuales When los vidrios no son compatibles con el modelo seleccionado en base a los `Thickness` para el admin.
- Para el usuario selecciono un modelo y este ya trae una lista de opciones de vidrios compatibles con el modelo.
- Estados empty: Mostrar mensajes informativos cuando no hay modelos disponibles, cotización vacía, o sin resultados de búsqueda.
- Estados loading: Mostrar indicadores de carga durante operaciones como cálculo de precios, búsqueda de modelos y envío de cotizaciones.
- Estados error: Mostrar mensajes específicos de error con opciones de recuperación (reintentar, contactar soporte, volver atrás).
- Navegación y funcionalidad completa en dispositivos móviles y tabletas.
- Comportamiento apropiado When hay problemas de conectividad.
- Accesibilidad completa para usuarios con lectores de pantalla.

## Requirements *(mandatory)*

### Functional Requirements

#### Navegación y Estructura General (Route Groups)
- **FR-001**: El sistema DEBE proporcionar una página de inicio (`/`) que explique el propósito del cotizador y redirija automáticamente al catálogo (`/catalog`).
- **FR-002**: El sistema DEBE organizar la navegación en tres dominios principales:
  - **Rutas Públicas** (`(public)`): Catálogo de modelos (`/catalog`), configuración de cotización (`/quote`) y revisión (`/quote/review`) - sin autenticación requerida
  - **Rutas de Autenticación** (`(auth)`): Login (`/signin`) con diseño centrado y minimal
  - **Rutas del Dashboard** (`(dashboard)`): Panel administrativo (`/dashboard`) con gestión de modelos (`/dashboard/models`), cotizaciones (`/dashboard/quotes`) y configuración (`/dashboard/settings`) - requiere autenticación
- **FR-003**: El sistema DEBE mantener un estado de cotización visible que muestre la cantidad de ítems agregados y permita acceso rápido al resumen desde cualquier página pública.
- **FR-004**: El sistema DEBE proporcionar manejo de estados específicos por dominio:
  - **Estados de carga** (`loading.tsx`): Por route group y páginas específicas
  - **Estados de error** (`error.tsx`): Con opciones de recuperación contextuales por dominio
  - **Estados 404** (`not-found.tsx`): Con navegación apropiada según el contexto (público/admin)
- **FR-005**: El sistema DEBE diferenciar layouts según el dominio:
  - **Layout público**: Navegación principal, footer, breadcrumbs
  - **Layout de auth**: Diseño centrado, minimal, solo formularios
  - **Layout de dashboard**: Sidebar de administración, contexto de admin

#### Catálogo de Modelos
- **FR-004**: El sistema DEBE presentar el catálogo de modelos en un formato visual organizado con filtros por fabricante, tipo de modelo y estado de disponibilidad, soportando hasta 100 modelos por fabricante.
- **FR-005**: El sistema DEBE mostrar para cada modelo información básica como nombre, fabricante, límites de medidas y precio de referencia.
- **FR-006**: El sistema DEBE permitir búsqueda rápida de modelos por nombre o código.

#### Configurador de Ítems
- **FR-007**: El sistema DEBE proporcionar un formulario intuitivo para ingresar medidas con campos numéricos que validen rangos mínimos y máximos en tiempo real.
- **FR-008**: El sistema DEBE mostrar únicamente los tipos de vidrio compatibles con el modelo seleccionado como opciones seleccionables.
- **FR-009**: El sistema DEBE presentar los servicios disponibles organizados por tipo (área, perímetro, fijo) con descripciones claras.
- **FR-010**: El sistema DEBE calcular y mostrar el precio dinámicamente mientras el usuario configura el ítem, con desglose detallado visible.
- **FR-011**: El sistema DEBE mostrar un resumen visual del ítem configurado antes de agregarlo a la cotización.
- **FR-012**: El sistema DEBE ver las opciones de vidrio en un lenguaje que sea comprensible para el usuario, basados en tres pilares:

1. Aislamiento Térmico (Eficiencia Energética)
Este pilar se centra en la capacidad del vidrio para minimizar la transferencia de calor entre el interior y el exterior. Un buen aislamiento térmico es clave para el confort y el ahorro energético.

Indicadores clave: El valor U (coeficiente de transmitancia térmica), donde un valor más bajo indica mejor aislamiento. Se logra principalmente a través del uso de Doble Vidrio Hermético (DVH) o Triple Acristalamiento, a menudo con cámaras rellenas de gas argón y láminas de vidrio bajo emisivo (Low-E).

2. Seguridad y Resistencia
Se refiere a la robustez del vidrio frente a impactos, roturas accidentales, y como barrera de protección.

Factores importantes:

Seguridad contra lesiones: Que el vidrio, en caso de rotura, no produzca fragmentos grandes y afilados. Esto se logra con vidrio templado (se rompe en trozos pequeños no cortantes) o vidrio laminado (mantiene los fragmentos adheridos a una lámina interior de PVB).

Seguridad antirrobo/anti-vandalismo: El vidrio laminado es el más efectivo, ya que la lámina de PVB dificulta la penetración en caso de impacto.

Resistencia mecánica: El grosor del vidrio y el uso de vidrio templado aumentan la resistencia a la carga de viento o a los impactos fuertes.

3. Aislamiento Acústico (Insonorización)
Evalúa la capacidad del vidrio para reducir el paso del ruido exterior hacia el interior. Es esencial en zonas urbanas o ruidosas.

Cómo se consigue: Se mejora sustancialmente usando dobles o triples acristalamientos con diferentes espesores de vidrio y/o una cámara de aire de grosor adecuado (idealmente entre 12 y 16 mm). También se recomienda el vidrio laminado acústico, que utiliza láminas especiales de PVB para absorber mejor las vibraciones sonoras.

#### Resumen de Cotización
- **FR-013**: El sistema DEBE presentar todos los ítems agregados en una tabla clara con opción de editar o eliminar cada ítem individual, soportando hasta 20 ítems por cotización.
- **FR-014**: El sistema DEBE mostrar subtotales por ítem, ajustes aplicados y total general con formato monetario apropiado para es-LA.
- **FR-015**: El sistema DEBE indicar claramente la vigencia de la cotización ("Válida hasta X días") en el resumen.
- **FR-016**: El sistema DEBE permitir aplicar ajustes tanto por ítem individual como a nivel de cotización total con campos claramente identificados.

#### Proceso de Envío
- **FR-017**: El sistema DEBE guiar al usuario a través del proceso de autenticación con Google con instrucciones claras y manejo de errores.
- **FR-018**: El sistema DEBE solicitar información de contacto (teléfono) y dirección del proyecto en campos separados y valiGivens.
- **FR-019**: El sistema DEBE mostrar un resumen final de la cotización antes de confirmar el envío.
- **FR-020**: El sistema DEBE proporcionar confirmación inmediata del envío con ID de cotización y expectativas sobre la respuesta.

#### Panel Administrativo
- **FR-022**: El sistema DEBE proporcionar una interfaz administrativa protegida para fabricantes autenticados con navegación específica.
- **FR-023**: El sistema DEBE permitir crear, editar y publicar modelos con todos sus atributos a través de formularios estructurados.
- **FR-024**: El sistema DEBE mostrar las cotizaciones recibidas organizadas por fecha con filtros por estado y fabricante.
- **FR-025**: El sistema DEBE permitir gestionar tipos de vidrio, servicios y configuraciones de precios de manera independiente.
- **FR-026**: El sistema DEBE permitir a los Admin gestionar usuarios del sistema con capacidades básicas de alta, baja y modificación.

#### Historial de Cliente
- **FR-027**: El sistema DEBE permitir a los Clientes acceder a un historial de sus cotizaciones enviadas con filtros por fecha y estado.

#### Accesibilidad y Experiencia de Usuario
- **FR-028**: El sistema DEBE cumplir con estándares WCAG 2.1 AA incluyendo navegación por teclado, lectores de pantalla y contraste adecuado.
- **FR-029**: El sistema DEBE ser completamente funcional en dispositivos móviles con interfaz responsive apropiada.
- **FR-030**: El sistema DEBE presentar todos los textos, mensajes y formatos en español (es-LA) incluyendo mensajes de error y validación.
- **FR-031**: El sistema DEBE soportar navegadores modernos: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.
- **FR-032**: El sistema DEBE mostrar estados empty con mensajes informativos cuando no hay contenido disponible.
- **FR-033**: El sistema DEBE mostrar indicadores de loading durante operaciones que requieran tiempo de procesamiento.
- **FR-034**: El sistema DEBE mostrar estados de error con mensajes específicos y opciones de recuperación (reintentar, contactar soporte).

#### Rendimiento y Estados
- **FR-035**: El sistema DEBE mostrar el cálculo de precios en menos de 200ms con retroalimentación visual durante el procesamiento.
- **FR-036**: El sistema DEBE mantener el estado de la cotización durante la sesión del usuario incluso si navega entre páginas.
- **FR-037**: El sistema DEBE manejar errores de conectividad con mensajes informativos y opciones de recuperación.

### Key Entities *(include if feature involves data)*
- **Página**: Cada pantalla principal del sistema (Inicio, Catálogo, Configurador, Resumen, Envío, Confirmación, Admin)
- **Componente de UI**: Elementos reutilizables como formularios, tablas, botones, modales y mensajes
- **Estado de Sesión**: Información mantenida durante la interacción del usuario incluyendo cotización en progreso y autenticación
- **Tema Visual**: Configuración de colores (theme), tipografías y espaciado coherente con la marca
- **Flujo de Navegación**: Secuencia lógica de páginas que guía al usuario desde la entrada hasta la confirmación
- **Contexto de Accesibilidad**: Configuraciones y adaptaciones para usuarios con diferentes capacidades

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
