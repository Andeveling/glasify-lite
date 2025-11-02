# Feature Specification: Sistema de Catálogo de Colores para Modelos

**Feature Branch**: `001-model-color-catalog`  
**Created**: 2025-10-27  
**Status**: Draft  
**Input**: User description: "Sistema de colores seleccionables para modelos de ventanas basados en el top 10 más comerciales, con seeding en DB y porcentajes ajustables por modelo"

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrador configura catálogo de colores base (Priority: P1)

Como Administrador del sistema (superadmin), necesito configurar el catálogo maestro de colores disponibles en la plataforma, basado en los 10 colores más comerciales de la industria de ventanas, para establecer las opciones estándar que todos los tenants pueden utilizar.

**Why this priority**: Este es el fundamento del sistema. Sin el catálogo base de colores, no se puede configurar ninguna relación con modelos ni permitir selecciones de usuarios. Es el MVP absoluto que debe existir primero.

**Independent Test**: El administrador puede acceder a una interfaz de gestión de colores, ver los 10 colores pre-cargados (seeded), agregar nuevos colores manualmente, editar nombres y códigos hexadecimales, y desactivar colores existentes. Los cambios se persisten correctamente en la base de datos.

**Acceptance Scenarios**:

1. **Given** el administrador accede al panel de gestión de colores, **When** visualiza el listado, **Then** debe ver los 10 colores comerciales estándar pre-cargados: Blanco (RAL 9010), Gris Antracita (RAL 7016), Negro Mate (RAL 9005), Gris Medio (RAL 7022), Natural/Anodizado Plata (RAL 9006), Madera Roble Oscuro, Marrón Chocolate (RAL 8017), Gris Perla/Beige (RAL 1013), Inox/Acero (RAL 9007), Champagne (C33)

2. **Given** el administrador crea un nuevo color, **When** ingresa nombre "Verde Musgo", código hexadecimal "#6B8E23" y código RAL "RAL 6025", **Then** el color se guarda exitosamente y aparece en el catálogo con estado activo

3. **Given** existe un color en el catálogo, **When** el administrador lo marca como inactivo, **Then** el color deja de aparecer en opciones de nuevos modelos pero se mantiene en modelos que ya lo tenían asignado

4. **Given** el administrador edita un color existente, **When** modifica el código hexadecimal o nombre, **Then** los cambios se reflejan inmediatamente en todos los modelos que usan ese color

---

### User Story 2 - Administrador asigna colores a modelo con recargo porcentual (Priority: P2)

Como Administrador de tenant (Vitro Rojas), necesito asignar colores específicos a cada modelo de ventana con sus respectivos recargos porcentuales personalizados, para reflejar los costos reales de fabricación según el tipo de perfil y acabado.

**Why this priority**: Una vez existe el catálogo base, la configuración por modelo es el siguiente paso lógico. Sin esta asignación, los clientes no tendrían opciones de color en el flujo de cotización. Es el segundo componente crítico del MVP.

**Independent Test**: El administrador puede seleccionar un modelo existente, agregar múltiples colores del catálogo maestro, asignar recargo porcentual individual a cada color (ejemplo: Blanco +0%, Nogal +15%, Negro Mate +20%), marcar un color como predeterminado, y guardar la configuración. Al cotizar ese modelo, solo aparecen los colores asignados con sus recargos correctos.

**Acceptance Scenarios**:

1. **Given** el administrador edita un modelo "Ventana Corrediza PVC Rehau", **When** asigna 5 colores del catálogo (Blanco 0%, Gris Antracita +10%, Negro Mate +18%, Madera Roble +22%, Champagne +12%), **Then** la relación modelo-color se guarda con los porcentajes específicos para ese modelo

2. **Given** un modelo tiene colores asignados, **When** el administrador marca "Blanco" como color predeterminado (checkbox o toggle), **Then** ese color se selecciona automáticamente en el formulario de cotización del cliente

3. **Given** un modelo tiene 8 colores asignados, **When** el administrador elimina la asignación de "Inox/Acero", **Then** ese color deja de aparecer solo en ese modelo específico pero sigue disponible para otros modelos

4. **Given** el administrador asigna un recargo de +25% a "Madera Roble" en modelo "Puerta Batiente Aluminio", **When** guarda los cambios, **Then** el sistema valida que el porcentaje esté entre 0% y 100% (límite razonable para evitar errores humanos)

---

### User Story 3 - Cliente selecciona color en cotización con recálculo automático (Priority: P3)

Como Cliente final cotizando una ventana, necesito seleccionar el color deseado de forma visual e intuitiva y ver el recargo aplicado instantáneamente en el precio total, para tomar una decisión informada sobre estética vs presupuesto.

**Why this priority**: Este es el resultado final del sistema desde la perspectiva del usuario. Depende completamente de P1 y P2, pero sin esta UX el sistema no entrega valor al cliente final. Es la pieza que completa el ciclo de negocio.

**Independent Test**: El cliente accede a la cotización de un modelo específico, ve un selector visual de colores (chips con color real + nombre + recargo porcentual), selecciona "Madera Roble (+22%)", el precio total se recalcula en menos de 200ms mostrando el desglose (precio base + recargo por color), y el color seleccionado se refleja en el PDF de cotización generado.

**Acceptance Scenarios**:

1. **Given** el cliente cotiza modelo "Ventana Corrediza PVC" con precio base $450, **When** selecciona color "Gris Antracita (+10%)", **Then** el sistema muestra precio actualizado: Base $450 + Recargo Color $45 = Total $495

2. **Given** el cliente no selecciona color manualmente, **When** avanza en el formulario de cotización, **Then** el sistema aplica automáticamente el color predeterminado (sin recargo adicional)

3. **Given** el cliente selecciona un color, **When** cambia a otro color diferente, **Then** el precio se recalcula instantáneamente (<200ms) sin necesidad de recargar la página

4. **Given** el cliente completa la cotización con color "Negro Mate", **When** genera el PDF, **Then** el documento muestra una muestra visual del color (chip hexadecimal) junto al nombre y desglose del recargo

5. **Given** un modelo solo tiene 1 color disponible (el predeterminado), **When** el cliente accede a la cotización, **Then** el selector de colores no aparece en el formulario (se aplica automáticamente sin mostrar opciones)

---

### Edge Cases

- **¿Qué sucede si un administrador elimina un color del catálogo maestro que ya está asignado a 20 modelos?**: El sistema debe prevenir la eliminación física y solo permitir desactivación. Los modelos conservan la relación pero al editar no pueden agregar ese color nuevamente. Se debe mostrar advertencia clara: "Este color está en uso en X modelos. Solo puedes desactivarlo."

- **¿Cómo maneja el sistema colores duplicados por error humano (ejemplo: dos "Blanco" con hex similares)?**: Validación a nivel de base de datos (constraint unique en combinación name+hexCode) y validación en frontend que muestre error antes de guardar: "Ya existe un color con este nombre o código hexadecimal."

- **¿Qué pasa si un modelo tiene 15 colores asignados y afecta la UX del selector?**: El frontend debe implementar paginación o scroll en el selector visual si hay más de 10 colores. Alternativamente, mostrar advertencia al admin: "Advertencia: Este modelo tiene más de 10 colores, considera reducir opciones para mejor experiencia de usuario."

- **¿Cómo se comporta el recálculo de precio si el cliente tiene conexión intermitente?**: El cálculo debe ser client-side (no requiere llamada al servidor) usando los datos ya cargados del modelo. El porcentaje se aplica directamente sobre el precio base en JavaScript/TypeScript para garantizar funcionamiento offline.

- **¿Qué ocurre con cotizaciones históricas si se cambia el recargo de un color de +15% a +20%?**: Las cotizaciones ya generadas deben mantener su precio original (snapshot inmutable). Solo las nuevas cotizaciones aplican el nuevo porcentaje. El sistema debe almacenar el porcentaje aplicado en cada item de cotización (denormalización intencional para auditoría).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE pre-cargar (seed) los 10 colores comerciales más utilizados en la industria de ventanas con sus códigos RAL y hexadecimales correspondientes: Blanco (RAL 9010, #F3F3E9), Gris Antracita (RAL 7016, #384043), Negro Mate (RAL 9005, #101010), Gris Medio (RAL 7022, #464A4B), Natural Anodizado Plata (RAL 9006, #A0A8A9), Madera Roble Oscuro (#794D35), Marrón Chocolate (RAL 8017, #4E3730), Gris Perla/Beige (RAL 1013, #E4E0D6), Inox/Acero (RAL 9007, #8D9395), Champagne C33 (#D8C3A4)

- **FR-002**: El sistema DEBE permitir al administrador crear, editar y desactivar colores en el catálogo maestro, incluyendo campos: nombre comercial (máx 50 caracteres), código RAL (opcional, formato "RAL XXXX"), código hexadecimal (obligatorio, formato #RRGGBB), estado activo/inactivo

- **FR-003**: El sistema DEBE permitir al administrador asignar múltiples colores de catálogo a cada modelo específico, con recargo porcentual independiente por modelo (rango permitido: 0% a 100%)

- **FR-004**: El sistema DEBE permitir marcar un solo color como "predeterminado" por modelo, aplicándose automáticamente si el cliente no selecciona ninguno

- **FR-005**: El sistema DEBE validar que el código hexadecimal tenga formato válido (#RRGGBB) y que no existan duplicados exactos (misma combinación nombre+hexCode) en el catálogo maestro

- **FR-006**: El sistema DEBE prevenir la eliminación de colores que estén asignados a uno o más modelos, permitiendo solo desactivación con mensaje informativo sobre modelos afectados

- **FR-007**: El cliente DEBE poder seleccionar un color de los disponibles para el modelo elegido mediante un selector visual que muestre: muestra de color (chip con hexadecimal), nombre comercial, recargo porcentual (si aplica)

- **FR-008**: El sistema DEBE recalcular el precio total de la cotización automáticamente al seleccionar un color, aplicando el recargo porcentual sobre el precio base del modelo únicamente (excluyendo vidrio y servicios adicionales)

- **FR-009**: El sistema DEBE almacenar en cada ítem de cotización el porcentaje de recargo aplicado al momento de creación (snapshot), independiente de cambios futuros en la configuración del color

- **FR-010**: El PDF de cotización DEBE mostrar el color seleccionado con: muestra visual (chip hexadecimal), nombre comercial, desglose del recargo en línea separada si es mayor a 0%

- **FR-011**: El sistema DEBE aplicar automáticamente el color predeterminado del modelo si el cliente no realiza selección manual, sin mostrar selector visual si solo hay un color disponible

- **FR-012**: El sistema DEBE permitir búsqueda y filtrado de colores en el panel de administración por: nombre, código RAL, estado (activo/inactivo)

### Key Entities *(include if feature involves data)*

- **Color**: Representa un color del catálogo maestro disponible en la plataforma. Atributos clave: identificador único, nombre comercial (ej. "Nogal Europeo"), código RAL (opcional), código hexadecimal (#RRGGBB), estado activo/inactivo, timestamps de creación/actualización. Este es un catálogo global compartido por todos los tenants.

- **ModelColor**: Representa la relación Many-to-Many entre un modelo específico y los colores disponibles para ese modelo. Atributos clave: referencia al modelo, referencia al color, recargo porcentual específico para esa combinación (0-100%), flag de color predeterminado (boolean), timestamps. Esta entidad permite que el mismo color tenga diferentes recargos según el modelo.

- **QuoteItem**: Entidad existente que se extiende para almacenar el color seleccionado. Nuevos atributos: referencia al color elegido (puede ser null si usa predeterminado), snapshot del porcentaje de recargo aplicado al momento de cotización (denormalización para inmutabilidad histórica), snapshot del código hexadecimal para mostrar en PDF aunque el color se modifique después.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede configurar los 10 colores estándar y asignarlos a un modelo completo en menos de 5 minutos (medido desde login hasta guardado exitoso)

- **SC-002**: El cliente final puede seleccionar un color y ver el precio recalculado en menos de 200 milisegundos en el 95% de los casos (medido en conexiones de red estándar 3G/4G)

- **SC-003**: El 100% de las cotizaciones generadas con color personalizado muestran correctamente en el PDF: muestra visual del color, nombre comercial y desglose de recargo (validado mediante tests automatizados de generación de PDF)

- **SC-004**: Cero inconsistencias en precios históricos cuando se modifican recargos de colores (validado mediante query de auditoría que compara snapshot almacenado vs recálculo con configuración actual - deben diferir intencionalmente)

- **SC-005**: La tasa de conversión de cotizaciones con selección de color personalizado aumenta en al menos 15% comparado con cotizaciones sin opciones de color (medido en período de 3 meses post-implementación)

- **SC-006**: Reducción del 40% en tiempo de respuesta de comerciales a consultas sobre disponibilidad de colores (medido por análisis de tickets de soporte y conversaciones de WhatsApp pre/post implementación)
