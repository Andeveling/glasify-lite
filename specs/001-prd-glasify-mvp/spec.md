# Feature Specification: Glasify MVP — Cotizador multi‑ítem con cálculo dinámico

**Feature Branch**: `[001-prd-glasify-mvp]`  
**Created**: 2025-09-27  
**Status**: Draft  
**Input**: User description: "PRD — Glasify MVP (Cotizador de ventanas en aluminio y PVC). Catálogo por fabricante, reglas de precio por medidas y servicios, flujo multi‑ítem, autenticación con Google y envío de cotizaciones; multi‑tenant, i18n es‑LA, a11y, performance <200 ms en cálculo."

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

### Session 2025-09-27
- Q: ¿Dónde aplicamos el redondeo a 2 decimales (half‑up) en el cálculo por ítem? → A: A (Redondear cada componente y luego sumar)
- Q: ¿Mostramos al cliente la vigencia de la cotización? → A: A (Mostrar “Válida hasta X días” configurable por fabricante)
- Q: ¿Cuál será el canal de notificación del MVP al enviar cotización? → A: A (Email simple)
- Q: ¿La “línea adicional” de ajuste se aplica por ítem o a nivel de cotización? → A: C (Ambas opciones: por ítem y total)
- Q: ¿El ajuste puede ser positivo y negativo (descuento), o solo positivo? → A: A (Positivo y negativo)

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Como Cliente final quiero cotizar ventanas seleccionando un modelo publicado por un fabricante,
ingresando ancho/alto en mm, eligiendo vidrio compatible y servicios opcionales, para ver el precio
total dinámico y agregar múltiples ítems a una cotización que luego puedo enviar al fabricante.

Como Admin (fabricante) quiero publicar mi catálogo (modelos, límites de medidas, reglas de precio,
vidrios compatibles, accesorios y servicios) para que los clientes puedan cotizar correctamente.

### Acceptance Scenarios
1. Dado un modelo publicado con límites válidos, cuando el cliente ingresa `widthMm` y `heightMm`
    dentro de rango y selecciona vidrio compatible, entonces el subtotal se calcula y muestra en <200 ms.
2. Dado un ítem válido, cuando el cliente presiona "Agregar", entonces el ítem se suma a la
    cotización con su desglose (dimensiones, accesorios y servicios).
3. Dado que el cliente tiene una cotización con ítems, cuando se autentica con Google y completa
    teléfono y dirección del proyecto, entonces puede enviar la cotización y recibe una confirmación
    con un ID de cotización.
4. Dado que el cliente ingresa medidas fuera de rango, cuando intenta calcular, entonces ve un mensaje
    de error claro indicando el campo inválido (en español) y no se agrega el ítem.
5. Dado que la vigencia está configurada por el fabricante (X días), cuando el cliente revisa el
   resumen, entonces ve un indicador “Válida hasta X días”.
6. Dado que el canal de notificación del MVP es email simple, cuando se envía la cotización, entonces
   el fabricante recibe un correo con el detalle de la solicitud.
7. Dado que existen ajustes por ítem y un ajuste general de cotización, cuando el cliente agrega ambos,
   entonces el resumen refleja el subtotal por ítem con su ajuste correspondiente y el total con el
   ajuste general aplicado.

### Edge Cases
- Medidas en mínimos/máximos exactos (límites inclusivos).
- Medidas fuera de rango (ancho o alto) → error bloqueante y mensajes claros.
- Vidrio incompatible para el modelo/propósito → opciones no visibles o error al validar.
- Servicios con cantidad derivada (m² o ml) cuando ancho/alto son muy pequeños o muy grandes.
- Redondeo a 2 decimales y presentación con formato local es‑LA.
- Accesorio fijo presente o ausente según configuración del modelo.
- Aplicación de redondeo: cada componente (dimensiones, accesorios y cada servicio) se redondea a 2
   decimales antes de sumar el subtotal.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: El sistema DEBE permitir a fabricantes publicar modelos con límites de medidas
   (min/max en mm), precio base y costos por mm en ancho/alto, accesorios y servicios.
- **FR-002**: El sistema DEBE calcular el precio por ítem dinámicamente al ingresar medidas u opciones,
   en menos de 200 ms, según las fórmulas del PRD.
- **FR-003**: El sistema DEBE validar que `widthMm` y `heightMm` estén dentro de los límites del modelo.
- **FR-004**: El sistema DEBE mostrar únicamente vidrios compatibles con el modelo/propósito y validar
   compatibilidad al agregar el ítem.
- **FR-005**: El cliente DEBE poder agregar múltiples ítems a una cotización y ver un resumen con
   subtotales por ítem y total general.
- **FR-006**: El sistema DEBE permitir una línea adicional de ajuste configurable (concepto + unidad).
- **FR-007**: El sistema DEBE requerir autenticación con Google para enviar cotizaciones, y recoger
   teléfono y dirección/ubicación del proyecto.
- **FR-008**: El sistema DEBE presentar mensajes de validación en español (es‑LA) y con formato numérico local.
- **FR-009**: El sistema DEBE soportar multi‑tenant por fabricante, aislando datos y catálogos.
- **FR-010**: El sistema DEBE redondear totales a 2 decimales y conservar un desglose explicativo por ítem.
- **FR-011**: El sistema DEBE cumplir con accesibilidad (WCAG 2.1 AA) y ser responsive.
- **FR-012**: El sistema DEBE registrar y exponer el estado de la cotización (borrador/enviado/cancelado)
   y su fecha de creación.
- **FR-013**: El sistema NO incluirá logística/pagos en el MVP; se limita a cotización y envío al fabricante.
- **FR-014**: El sistema DEBE permitir servicios por área (m²), perímetro (ml) y precio fijo por ítem.
- **FR-015**: El sistema DEBE ofrecer confirmación al enviar cotización con un ID de cotización.
- **FR-016**: El sistema DEBE mantener trazabilidad de reglas de precio aplicadas por ítem (snapshot).
- **FR-017**: Endpoints administrativos DEBEN requerir autorización (rol admin) para operar en catálogos.

- **FR-020**: El sistema DEBE aplicar redondeo half‑up a 2 decimales en cada componente de precio
   (dimPrice, accPrice y cada servicio) y luego sumar para obtener el subtotal del ítem.

- **FR-021**: El sistema DEBE mostrar al cliente la vigencia de la cotización como “Válida hasta X días”,
   donde X es configurable por fabricante.

- **FR-022**: El MVP DEBE notificar al fabricante por email simple (SMTP/mock) al enviar una cotización,
  incluyendo el ID de cotización y el desglose básico.

- **FR-023**: El sistema DEBE soportar la “línea adicional” de ajuste tanto por ítem como a nivel de
   cotización (concepto + unidad: unidad, m² o ml), y reflejar su impacto en subtotales y total general.

- **FR-024**: El ajuste DEBE admitir valores positivos y negativos (incluyendo descuentos), aplicables
   según su alcance (ítem o cotización).

*Ambigüedades marcadas del PRD:*
- **FR-018**: Vigencia de cotización (ej. 15 días) y su representación visible para el cliente.
- **FR-019**: Políticas de retención y eliminación de datos personales (no especificadas en detalle).

### Key Entities *(include if feature involves data)*
- **Manufacturer**: Representa al fabricante; nombre, moneda de trabajo.
- **Model**: Ítem de catálogo con límites, reglas de precio, accesorios, estado (borrador/publicado).
- **GlassType**: Tipo de vidrio (propósito y espesor) utilizable por ciertos modelos.
- **Service**: Servicio del fabricante de tipo área/perímetro/fijo con unidad y tarifa.
- **Quote**: Cotización con fabricante, usuario (si aplica), estado, moneda y total.
- **QuoteItem**: Ítem de cotización con modelo, medidas, vidrio, accesorio aplicado y subtotal.
- **QuoteItemService**: Servicio aplicado al ítem, con unidad/cantidad y monto calculado.
- **Adjustment**: Ajuste configurable con alcance `item` o `quote`, concepto, unidad (unidad/m²/ml) y
   monto (positivo o negativo); afecta el subtotal del ítem o el total de la cotización según alcance.
- **User**: Usuario con email y teléfono; puede autenticarse con Google para envío.
- **Address**: Dirección del proyecto, utilizada al enviar la cotización.

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
