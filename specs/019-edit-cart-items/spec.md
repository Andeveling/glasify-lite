# Feature Specification: Edición de Items del Carrito

**Feature Branch**: `019-edit-cart-items`  
**Created**: 2025-11-03  
**Status**: Draft  
**Input**: User description: "Demos garantizar que un cliente pueda editar un item del carrito, es decir llegados a ese punto deberia poder editar deser necesario, el ancho, el alto, el vidrio y el sistema poder recalcular, esto por si un usuario se ha equivocado en su creacion, se puede considerar reusar el form de catalog y/o una solucion de edicion en modal con un solo recalculo, no en realtime, tambien cada elemento de carrito debe poder mostrar la imagen del modelo"

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Imagen del Modelo en Item de Carrito (Priority: P1)

Como cliente, cuando visualizo mi carrito de compras, necesito ver la imagen del modelo de vidrio de cada item para identificar rápidamente qué productos he agregado y verificar que corresponden a lo que necesito.

**Why this priority**: Es la base visual del carrito. Sin la imagen del modelo, el usuario no puede verificar visualmente lo que está comprando, lo cual es crítico para la confianza del cliente y reducción de errores de pedido.

**Independent Test**: Puede probarse completamente agregando un item al carrito y verificando que la imagen del modelo se muestra correctamente. Entrega valor inmediato al mejorar la claridad visual del carrito.

**Acceptance Scenarios**:

1. **Given** un usuario ha agregado items al carrito, **When** el usuario navega a la página del carrito, **Then** cada item debe mostrar la imagen del modelo de vidrio correspondiente
2. **Given** un item tiene modelo asociado, **When** la imagen se renderiza, **Then** debe mostrarse con dimensiones apropiadas y carga optimizada
3. **Given** un modelo no tiene imagen disponible, **When** se muestra en el carrito, **Then** debe mostrarse un placeholder genérico de producto

---

### User Story 2 - Editar Dimensiones de Item Existente (Priority: P2)

Como cliente que cometió un error al ingresar las dimensiones de un vidrio, necesito poder editar el ancho y alto de un item ya agregado al carrito, para corregir el error sin tener que eliminar y recrear el item completo.

**Why this priority**: Permite corrección de errores en dimensiones, que es el tipo de error más común en cotizaciones de vidrio. Mejora la experiencia de usuario al evitar el proceso tedioso de eliminar y recrear items.

**Independent Test**: Puede probarse creando un item con dimensiones incorrectas, editándolas, y verificando que el precio se recalcula correctamente. Es independiente de otras funcionalidades de edición.

**Acceptance Scenarios**:

1. **Given** un usuario visualiza un item en el carrito, **When** el usuario hace clic en "Editar" o acción equivalente, **Then** debe abrirse una interfaz de edición mostrando las dimensiones actuales (ancho y alto)
2. **Given** el usuario está editando dimensiones, **When** modifica el ancho o alto, **Then** los valores deben validarse según las reglas de negocio (mínimos, máximos, formato)
3. **Given** el usuario ha modificado las dimensiones, **When** confirma los cambios, **Then** el sistema debe recalcular el precio del item y actualizar el total del carrito
4. **Given** el usuario está editando, **When** cancela la operación, **Then** el item debe mantener sus valores originales sin cambios

---

### User Story 3 - Cambiar Tipo de Vidrio de Item Existente (Priority: P2)

Como cliente que seleccionó un tipo de vidrio incorrecto, necesito poder cambiar el vidrio de un item existente en el carrito para ajustar mi cotización sin perder las dimensiones ya configuradas.

**Why this priority**: Complementa la edición de dimensiones permitiendo corrección completa de errores. El cambio de vidrio puede afectar significativamente el precio, por lo que es importante para la precisión de la cotización.

**Independent Test**: Puede probarse seleccionando un item, cambiando su tipo de vidrio, y verificando el recálculo de precio. Es independiente de la edición de dimensiones.

**Acceptance Scenarios**:

1. **Given** el usuario está editando un item, **When** accede a la selección de vidrio, **Then** debe ver el vidrio actualmente seleccionado y las opciones disponibles para el modelo
2. **Given** el usuario selecciona un nuevo tipo de vidrio, **When** confirma el cambio, **Then** el sistema debe recalcular el precio considerando el nuevo vidrio y las dimensiones existentes
3. **Given** el cambio de vidrio resulta en incompatibilidad con el modelo, **When** se intenta guardar, **Then** el sistema debe mostrar un mensaje de error claro y mantener el vidrio original
4. **Given** el usuario cambia el vidrio, **When** cancela la edición, **Then** el tipo de vidrio original debe mantenerse

---

### User Story 4 - Recálculo Manual de Precio (Priority: P3)

Como cliente editando un item, necesito que el precio se recalcule solo cuando confirmo los cambios, no en tiempo real mientras edito, para evitar distracciones y tener control sobre cuándo se aplican las modificaciones.

**Why this priority**: Mejora la experiencia de usuario al reducir re-renderizados y distracciones durante la edición. Es menos crítico que la funcionalidad de edición básica.

**Independent Test**: Puede probarse editando múltiples campos y verificando que el precio solo cambia al confirmar, no durante la edición.

**Acceptance Scenarios**:

1. **Given** el usuario está editando un item, **When** modifica campos (dimensiones o vidrio), **Then** el precio mostrado NO debe cambiar hasta confirmar
2. **Given** el usuario ha modificado varios campos, **When** hace clic en "Guardar" o "Confirmar", **Then** el sistema debe calcular el nuevo precio una sola vez con todos los cambios
3. **Given** el usuario está editando, **When** visualiza la interfaz de edición, **Then** debe ver claramente el precio actual y una indicación de que se recalculará al confirmar


---

### Edge Cases

- ¿Qué sucede cuando el usuario edita un item mientras otro usuario (en sesión diferente) está modificando el mismo carrito compartido?
- ¿Cómo maneja el sistema la edición de un item cuyo modelo ha sido eliminado o deshabilitado desde su creación?
- ¿Qué ocurre si las nuevas dimensiones editadas exceden los límites permitidos por el modelo seleccionado?
- ¿Cómo se comporta el sistema si el tipo de vidrio seleccionado se vuelve incompatible con el modelo después de actualizar dimensiones?
- ¿Qué pasa si el usuario intenta editar múltiples items simultáneamente en diferentes pestañas del navegador?
- ¿Cómo se manejan los errores de recálculo de precio si hay problemas de conexión al confirmar cambios?
- ¿Qué sucede si la imagen del modelo no puede cargarse debido a errores de servidor o archivos faltantes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar la imagen del modelo de vidrio en cada item del carrito con dimensiones de 80x80px (thumbnail) o equivalente optimizado
- **FR-002**: El sistema DEBE proporcionar un mecanismo de edición accesible desde cada item del carrito (botón "Editar" o ícono de edición)
- **FR-003**: El sistema DEBE permitir la edición del ancho del item con validación de rango según especificaciones del modelo (típicamente entre 100mm y 3000mm)
- **FR-004**: El sistema DEBE permitir la edición del alto del item con validación de rango según especificaciones del modelo (típicamente entre 100mm y 3000mm)
- **FR-005**: El sistema DEBE permitir la selección de un tipo de vidrio diferente entre las opciones compatibles con el modelo actual
- **FR-006**: El sistema DEBE validar que el nuevo tipo de vidrio seleccionado sea compatible con el modelo del item
- **FR-007**: El sistema DEBE recalcular el precio del item únicamente cuando el usuario confirma los cambios, NO durante la edición en tiempo real
- **FR-008**: El sistema DEBE actualizar el total del carrito después de confirmar cambios en un item
- **FR-009**: El sistema DEBE permitir cancelar la edición y restaurar los valores originales del item
- **FR-010**: El sistema DEBE mostrar mensajes de error claros cuando las validaciones fallen (dimensiones fuera de rango, vidrio incompatible, etc.)
- **FR-011**: El sistema DEBE mostrar un placeholder de imagen genérico cuando la imagen del modelo no esté disponible
- **FR-012**: El sistema DEBE preservar el estado del carrito si el usuario cancela la edición
- **FR-013**: El sistema DEBE actualizar la visualización del item inmediatamente después de confirmar cambios exitosos
- **FR-014**: El sistema DEBE prevenir la edición simultánea del mismo item desde múltiples sesiones/pestañas
- **FR-015**: El sistema DEBE validar dimensiones con precisión decimal (permitir decimales según configuración del tenant)

### Key Entities *(include if feature involves data)*

- **CartItem**: Representa un item en el carrito con atributos: id, modelId, width, height, glassTypeId, quantity, calculatedPrice, model (relación), glassType (relación), imageUrl (del modelo)
  
- **Model**: Modelo de vidrio con atributos relevantes: id, name, imageUrl, minWidth, maxWidth, minHeight, maxHeight, availableGlassTypes (relación)

- **GlassType**: Tipo de vidrio con atributos: id, name, pricePerM2, thickness, compatibleModels (relación)

- **Cart**: Carrito de compras conteniendo: id, items (relación a CartItem), totalPrice, userId/sessionId

### File Organization *(include if feature involves forms/components)*

Para el componente de edición de item del carrito, la estructura debe seguir:

```
cart/
├── _components/
│   ├── cart-item.tsx                    # Visualización del item con imagen del modelo (orquestación <100 líneas)
│   ├── cart-item-edit-modal.tsx         # Modal de edición del item (orquestación <100 líneas)
│   └── cart-item-image.tsx              # Componente de imagen con placeholder fallback
├── _hooks/
│   ├── use-cart-item-mutations.ts       # Mutaciones de edición + invalidación de cache
│   └── use-cart-data.ts                 # Fetching de datos del carrito con stale time
├── _schemas/
│   └── cart-item-edit.schema.ts         # Validación Zod para edición de item
├── _utils/
│   ├── cart-item-edit.utils.ts          # getDefaults(), transformEditData(), tipos
│   └── cart-price-calculator.ts         # Lógica de recálculo de precio
└── _constants/
    └── cart-item.constants.ts           # Dimensiones mín/máx, URLs de placeholder, etc.
```

**SOLID Requirements**:
- Single Responsibility: Componente de imagen separado, modal de edición separado de visualización
- No magic numbers: Dimensiones de imagen, límites de validación en constantes
- No inline schemas: Schema de validación en archivo dedicado
- No mutation logic in UI: Lógica de mutación y recálculo en hooks y utils
- No hardcoded defaults: Valores por defecto extraídos a utils

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden visualizar la imagen del modelo en el 100% de los items del carrito que tienen modelo con imagen disponible
- **SC-002**: Los usuarios pueden editar y guardar cambios en dimensiones de un item del carrito en menos de 30 segundos
- **SC-003**: El sistema recalcula el precio del item editado en menos de 2 segundos después de confirmar cambios
- **SC-004**: El 95% de las ediciones de items se completan exitosamente sin errores de validación o cálculo
- **SC-005**: Los usuarios pueden cambiar el tipo de vidrio de un item y ver el precio actualizado en una sola operación de confirmación
- **SC-006**: La tasa de items eliminados y recreados se reduce en un 60% después de implementar la funcionalidad de edición
- **SC-007**: El tiempo promedio para corregir un error en un item del carrito se reduce de 90 segundos (eliminar + recrear) a 30 segundos (editar)
- **SC-008**: El sistema mantiene la integridad de datos del carrito en el 100% de los casos de edición, sin pérdida de información al cancelar

## Dependencies & Assumptions

### Dependencies

- **Existing Cart System**: Esta funcionalidad requiere que exista un sistema de carrito funcional donde los usuarios puedan agregar items
- **Product Catalog**: Depende del catálogo de productos (modelos y tipos de vidrio) con sus especificaciones de dimensiones y compatibilidades
- **Pricing Engine**: Requiere un motor de cálculo de precios que pueda recalcular el costo de un item basado en dimensiones y tipo de vidrio
- **Image Storage**: Depende de un sistema de almacenamiento y entrega de imágenes de modelos

### Assumptions

- Se asume que cada modelo tiene límites de dimensiones configurados (minWidth, maxWidth, minHeight, maxHeight)
- Se asume que existe una relación many-to-many entre modelos y tipos de vidrio que define compatibilidades
- Se asume que el carrito puede ser accedido desde una sesión de usuario (autenticado o anónimo con sessionId)
- Se asume que las imágenes de modelos están almacenadas y accesibles mediante una URL
- Se asume que el sistema actual soporta decimales en dimensiones (según configuración del tenant)
- Se asume que existe validación del lado del servidor para prevenir inconsistencias de datos
- Se asume que el precio de un item se calcula como: (ancho × alto × precio_por_m2_del_vidrio) + fórmulas adicionales del modelo
