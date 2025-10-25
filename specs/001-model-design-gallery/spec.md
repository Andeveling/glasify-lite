# Feature Specification: Galería de Diseños 2D para Modelos

**Feature Branch**: `001-model-design-gallery`  
**Created**: 2025-01-25  
**Status**: Draft  
**Input**: User description: "Sistema de rendering de modelos 2D usando Konva.js para asociar diseños predefinidos a modelos de ventanas/puertas"

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar diseño de modelo en catálogo (Priority: P1)

Como cliente navegando el catálogo, quiero ver el diseño visual del modelo en cada tarjeta de producto para entender rápidamente el aspecto físico de la ventana o puerta antes de hacer clic en los detalles.

**Why this priority**: Es la funcionalidad core del feature - sin esto, no hay valor visible para el usuario final. Reemplaza el placeholder actual con visualización real del producto.

**Independent Test**: Puede ser completamente probado navegando al catálogo (`/catalog`) y verificando que cada `ModelCard` muestra un diseño 2D renderizado en lugar del placeholder genérico actual.

**Acceptance Scenarios**:

1. **Given** un cliente visita la página de catálogo, **When** el catálogo se carga, **Then** cada tarjeta de modelo muestra su diseño 2D asociado renderizado visualmente
2. **Given** un modelo tiene diseño asociado, **When** se renderiza en `ModelCard`, **Then** el diseño muestra la estructura básica de marcos y vidrios acorde al tipo de modelo
3. **Given** un modelo NO tiene diseño asociado, **When** se renderiza en `ModelCard`, **Then** se muestra el placeholder genérico actual (fallback)
4. **Given** un diseño está cargando, **When** se renderiza la tarjeta, **Then** se muestra un skeleton loader apropiado

---

### User Story 2 - Asignar diseño predefinido a modelo (Priority: P2)

Como administrador creando o editando un modelo, quiero seleccionar un diseño predefinido de una galería visual para que el modelo tenga representación gráfica en el catálogo sin necesidad de dibujar manualmente.

**Why this priority**: Habilita a los admins a usar la funcionalidad de diseños. Es P2 porque los diseños pueden ser asignados via seeders/DB inicialmente, pero esta interfaz mejora la experiencia administrativa.

**Independent Test**: Puede ser probado accediendo a `/admin/models/new` o `/admin/models/[id]`, verificando que hay un selector de diseños con preview visual, y confirmando que la asignación persiste correctamente.

**Acceptance Scenarios**:

1. **Given** un admin está en el formulario de creación de modelo, **When** selecciona un tipo de modelo (ventana fija, corredera, puerta, etc.), **Then** la galería de diseños se filtra mostrando solo diseños compatibles con ese tipo
2. **Given** un admin está en el formulario de modelo, **When** accede a la sección de diseño sin haber definido tipo, **Then** el sistema solicita que defina el tipo de modelo antes de continuar
3. **Given** un admin selecciona un diseño de la galería, **When** guarda el modelo, **Then** el diseño queda asociado permanentemente al modelo
4. **Given** un admin está editando un modelo existente con diseño, **When** abre el formulario, **Then** el diseño actual aparece pre-seleccionado en la galería
5. **Given** un admin cambia el diseño de un modelo, **When** guarda los cambios, **Then** el nuevo diseño se refleja inmediatamente en el catálogo (tras refresh/invalidation)
6. **Given** un admin cambia el material del modelo (ProfileSupplier), **When** visualiza el preview, **Then** el diseño se renderiza con el color correspondiente al nuevo material

---

### User Story 3 - Explorar galería de diseños disponibles (Priority: P3)

Como administrador, quiero explorar la galería completa de diseños predefinidos con filtros y búsqueda para encontrar rápidamente el diseño más apropiado para cada tipo de modelo (ventana fija, corredera, puerta, etc.).

**Why this priority**: Mejora la usabilidad cuando hay muchos diseños disponibles, pero no es esencial para el MVP - puede funcionar con selección simple si la galería es pequeña.

**Independent Test**: Puede ser probado accediendo al selector de diseños en el formulario de modelo y verificando capacidades de búsqueda/filtrado.

**Acceptance Scenarios**:

1. **Given** un admin abre el selector de diseños, **When** hay más de 10 diseños disponibles, **Then** puede filtrar por tipo (ventana fija, ventana corredera, puerta, etc.)
2. **Given** un admin busca diseños, **When** escribe en el campo de búsqueda, **Then** los resultados se filtran en tiempo real por nombre o descripción
3. **Given** un admin visualiza la galería, **When** hace hover sobre un diseño, **Then** ve información adicional (nombre, descripción, dimensiones recomendadas)

---

### Edge Cases

- ¿Qué pasa cuando un modelo tiene dimensiones extremas (muy ancho/angosto o muy alto/bajo)? El diseño debe adaptarse dinámicamente manteniendo proporciones lógicas de los elementos internos (marcos, vidrios, bisagras)
- ¿Cómo maneja el sistema diseños corruptos o inválidos (JSON malformado)? Debe mostrar fallback y registrar error sin romper la UI
- ¿Qué sucede si se elimina un diseño que está siendo usado por modelos existentes? Sistema debe prevenir eliminación o marcar como inactivo y mantener rendering
- ¿Cómo se comporta el rendering en dispositivos móviles con pantallas pequeñas? Debe escalar proporcionalmente al contenedor manteniendo legibilidad
- ¿Qué pasa cuando el material del modelo cambia? El diseño debe re-renderizarse con el color base correspondiente (gris=aluminio, blanco=PVC, marrón=madera, neutro=mixto)
- ¿Cómo maneja el sistema un modelo sin tipo definido al asignar diseño? Debe requerir tipo antes de permitir asignación
- ¿Qué sucede si las dimensiones del modelo cambian después de asignar un diseño? El rendering debe actualizarse automáticamente en próxima visualización

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEBE renderizar diseños 2D en tarjetas de catálogo usando tecnología de canvas 2D
- **FR-002**: Sistema DEBE permitir asociar UN diseño predefinido a cada modelo
- **FR-003**: Sistema DEBE persistir la relación modelo-diseño en la base de datos
- **FR-004**: Sistema DEBE almacenar definiciones de diseños como estructuras JSON que describan formas geométricas
- **FR-005**: Sistema DEBE proporcionar fallback visual cuando un modelo no tiene diseño asignado
- **FR-006**: Administradores DEBEN poder seleccionar diseños de una galería visual en el formulario de modelo
- **FR-007**: Sistema DEBE mostrar preview del diseño seleccionado antes de guardar
- **FR-008**: Sistema DEBE validar que el tipo del diseño coincida con el tipo del modelo antes de permitir asignación (ventana fija, ventana corredera, puerta, etc.)
- **FR-009**: Sistema NO DEBE permitir creación/edición manual de diseños via UI (solo asignación de predefinidos)
- **FR-010**: Sistema DEBE renderizar diseños de manera consistente en diferentes tamaños de viewport
- **FR-011**: Sistema DEBE optimizar performance del rendering para catálogos con múltiples modelos (lazy loading, virtualización)
- **FR-012**: Sistema DEBE preservar aspect ratio y proporciones lógicas del diseño al escalar
- **FR-013**: Sistema DEBE adaptar diseños dinámicamente a las dimensiones específicas del modelo (rendering parametrizado)
- **FR-014**: Sistema DEBE ajustar elementos internos del diseño (marcos, vidrios, bisagras) proporcionalmente según dimensiones del modelo
- **FR-015**: Sistema DEBE aplicar color base al diseño según el material del perfil: gris para aluminio, blanco para PVC, marrón para madera, color neutro para mixto
- **FR-016**: Sistema DEBE re-renderizar diseño automáticamente cuando cambian dimensiones o material del modelo
- **FR-017**: Sistema DEBE requerir que el modelo tenga tipo definido antes de permitir asignación de diseño
- **FR-018**: Sistema DEBE prevenir eliminación de diseños activos en uso o marcarlos como inactivos manteniendo rendering

### Key Entities

- **Design (ModelDesign)**: Representa un diseño 2D predefinido que puede ser asociado a modelos
  - Nombre único del diseño
  - Descripción breve
  - Tipo de modelo compatible (ventana fija, ventana corredera horizontal, ventana corredera vertical, puerta estándar, puerta doble, etc.)
  - Definición JSON de formas geométricas (marcos, vidrios, bisagras, manijas) con parámetros adaptativos
  - Dimensiones base de referencia (ancho y alto en mm)
  - Reglas de adaptación para diferentes proporciones (cómo escalan marcos, vidrios, etc.)
  - Estado activo/inactivo para disponibilidad en galería
  - Metadata de creación/actualización

- **Model (modificado)**: Extiende el modelo existente con relación a Design y tipo
  - Relación opcional a un Design (`designId`)
  - Tipo de modelo (ventana fija, ventana corredera horizontal, ventana corredera vertical, puerta estándar, puerta doble, etc.)
  - Mantiene todos los campos existentes (dimensiones, precios, material del ProfileSupplier)
  - Material heredado de ProfileSupplier afecta color de rendering

- **MaterialColorMapping**: Mapeo de materiales a colores base para rendering
  - PVC → Blanco (#FFFFFF o similar)
  - ALUMINUM → Gris (#808080 o similar)
  - WOOD → Marrón (#8B4513 o similar)
  - MIXED → Color neutro/gris claro (#D3D3D3 o similar)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clientes pueden identificar visualmente el tipo de ventana/puerta en menos de 2 segundos viendo la tarjeta del catálogo
- **SC-002**: El catálogo carga y renderiza 20+ tarjetas con diseños 2D en menos de 3 segundos (performance)
- **SC-003**: Administradores pueden asignar un diseño a un modelo en menos de 30 segundos durante la creación/edición
- **SC-004**: 100% de los modelos con diseño asignado muestran rendering visual correcto sin errores
- **SC-005**: El sistema maneja gracefully modelos sin diseño asignado (fallback visible, sin errores en consola)
- **SC-006**: Los diseños se renderizan correctamente en dispositivos móviles (responsive, aspect ratio preservado)
- **SC-007**: Los diseños se adaptan correctamente a modelos con diferentes proporciones (1:1, 2:1, 1:2, etc.) manteniendo apariencia lógica
- **SC-008**: El color del diseño refleja correctamente el material del perfil en 100% de los casos (PVC=blanco, aluminio=gris, madera=marrón, mixto=neutro)
- **SC-009**: Sistema previene asignación de diseños incompatibles (0% de asignaciones tipo ventana a modelo tipo puerta)

## Assumptions

- Los diseños 2D son estructuras parametrizadas que se adaptan a dimensiones del modelo manteniendo proporciones lógicas
- Los diseños utilizan sistema de parámetros para definir cómo escalan marcos, vidrios y accesorios según input de dimensiones
- La paleta de colores por material es fija: PVC=blanco, ALUMINUM=gris, WOOD=marrón, MIXED=neutro
- Los colores son aproximaciones visuales básicas, no texturas fotorrealistas (suficiente para diferenciación rápida)
- La galería inicial de diseños será poblada mediante seeders con tipos comunes: ventana fija, corredera horizontal, corredera vertical, puerta estándar, puerta doble
- Cada modelo debe tener un tipo definido antes de asignar diseño (ventana fija, corredera, puerta, etc.)
- El rendering se optimiza mediante lazy loading, virtualización o memoización según volumen del catálogo
- La tecnología de rendering 2D (canvas-based) es compatible con Next.js 15 App Router y React Server Components
- El schema de Prisma puede ser extendido para agregar campo `type` a Model y relación `designId` sin romper migraciones existentes
- Los diseños predefinidos cubren las configuraciones más comunes del mercado (80-90% de casos de uso)
- La adaptación de diseños es proporcional pero mantiene espesores mínimos de marcos visibles (no escalan linealmente todos los elementos)

## Dependencies

- Konva.js (biblioteca de canvas 2D)
- react-konva (bindings de React para Konva)
- Schema Prisma actual (Model, ProfileSupplier)
- Componente ModelCard existente (requiere modificación)
- Sistema de seeders existente (para poblar diseños iniciales)

## Out of Scope

- Interfaz de dibujo/edición manual de diseños (los diseños son 100% predefinidos)
- Texturas fotorrealistas o renders 3D (solo colores planos básicos por material)
- Animaciones de apertura/cierre de ventanas o puertas
- Renderizado 3D o perspectiva (solo 2D plano)
- Exportación de diseños a formatos externos (SVG, PNG, PDF)
- Versionado de diseños (cambios en diseños afectan a todos los modelos asociados)
- Sistema de templates reutilizables entre diseños (cada diseño es independiente)
- Personalización de paleta de colores por tenant (colores de material son fijos)
- Adaptación a accesorios específicos del modelo (bisagras, manijas personalizadas)
- Preview 360° o vistas múltiples del diseño
