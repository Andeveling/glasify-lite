# Historias de Usuario - Vitro Rojas

**Fecha**: 2025-10-26  
**Cliente**: Vitro Rojas (Panamá)  
**Versión**: 1.0  
**Fuente**: Reuniones 001 y análisis de necesidades

---

## Épica 1: Sistema de Colores para Modelos

### US-001: Configurar colores disponibles por modelo

**Como** Admin de Vitro Rojas  
**Quiero** configurar los colores disponibles para cada modelo de ventana/puerta  
**Para** ofrecer opciones personalizadas a mis clientes con recargos automáticos

**Criterios de Aceptación**:
- [ ] Puedo crear/editar/eliminar colores en el catálogo (ej. Blanco, Nogal, Antracita, Gris Titanio)
- [ ] Cada color tiene un nombre, código hexadecimal y recargo porcentual (ej. +15%)
- [ ] El recargo se define a nivel de modelo (diferentes modelos pueden tener diferentes recargos por color)
- [ ] Puedo marcar un color como "predeterminado" (sin recargo adicional)
- [ ] Los colores inactivos no se muestran en el catálogo público pero se mantienen en cotizaciones históricas

**Notas Técnicas**:
- Crear modelo `ModelColor` con relación Many-to-Many a `Model`
- Campos: `name`, `hexCode`, `surchargePercentage`, `isDefault`, `isActive`
- El recargo aplica solo al precio base del modelo (no incluye vidrio/servicios)

**Prioridad**: Alta  
**Estimación**: 5 puntos

---

### US-002: Seleccionar color en cotización del cliente

**Como** Cliente final  
**Quiero** seleccionar el color de la ventana al configurar mi cotización  
**Para** ver el precio final con el recargo aplicado automáticamente

**Criterios de Aceptación**:
- [ ] Veo un selector visual de colores (chips con color real) en el formulario de cotización
- [ ] Al seleccionar un color, veo el recargo porcentual indicado (ej. "+15% Nogal")
- [ ] El precio total se recalcula automáticamente en <200ms
- [ ] El color seleccionado aparece en el PDF de cotización con una muestra visual
- [ ] Si no selecciono color, se aplica el color predeterminado sin recargo

**Notas de UX**:
- Usar chips de color con borde y checkmark para el seleccionado
- Mostrar recargo de forma clara: "Nogal (+15%): +$XXX"
- En dispositivos móviles, usar lista vertical con swatches grandes

**Prioridad**: Alta  
**Estimación**: 3 puntos

---

## Épica 2: Simplificación de Dirección

### US-003: Simplificar campos de dirección en cotización

**Como** Cliente final  
**Quiero** completar solo los campos esenciales de ubicación  
**Para** reducir la fricción al enviar mi cotización

**Criterios de Aceptación**:
- [ ] El formulario de cotización tiene solo estos campos de ubicación:
  - Proyecto/Nombre (opcional)
  - Ciudad/Municipio (requerido)
  - Región/Departamento/Provincia (requerido, select)
  - Barrio/Localidad (opcional, texto libre)
- [ ] NO se solicita código postal
- [ ] El campo `contactAddress` se depreca pero mantiene compatibilidad en Base de Datos
- [ ] Los valores de región se cargan dinámicamente según país del tenant (ej. provincias de Panamá)

**Notas Técnicas**:
- Migración: agregar campos `projectCity`, `projectRegion`, `projectNeighborhood` a `Quote`
- Deprecar `contactAddress` con valor por defecto concatenado de nuevos campos
- Validación Zod: ciudad y región obligatorios, barrio opcional máx 100 chars

**Prioridad**: Media  
**Estimación**: 2 puntos

---

## Épica 3: Gestión de Transporte

### US-004: Indicar que transporte se calcula post-cotización

**Como** Cliente final  
**Quiero** saber desde el inicio que el transporte no está incluido en el precio  
**Para** no tener sorpresas al recibir la cotización final del comercial

**Criterios de Aceptación**:
- [ ] En la página de catálogo, hay un aviso claro: "El transporte se cotiza después de la revisión comercial"
- [ ] En el Budget Cart, se muestra un callout informativo antes del total general
- [ ] En el PDF de cotización, hay una sección "Nota sobre transporte" con texto configurable por tenant
- [ ] El aviso se puede personalizar desde TenantConfig (campo `shippingDisclaimer`)

**Ejemplo de Texto**:
```
📦 Transporte e Instalación
El costo de transporte e instalación se calculará según su ubicación específica
y complejidad del proyecto. Nuestro equipo comercial lo contactará para afinar
estos detalles y entregarle su cotización final.
```

**Prioridad**: Media  
**Estimación**: 1 punto

---

### US-005: Comercial agrega costo de transporte manualmente

**Como** Comercial/Vendedor  
**Quiero** agregar el costo de transporte calculado manualmente a la cotización  
**Para** enviar al cliente el presupuesto completo con todos los costos

**Criterios de Aceptación**:
- [ ] En la vista de edición de cotización, tengo un campo "Costo de Transporte" (monto fijo)
- [ ] Puedo agregar notas del comercial sobre el cálculo (ej. "Transporte a Chitré: 80km, instalación en piso 5")
- [ ] El transporte aparece como línea separada en el PDF final
- [ ] El sistema registra quién y cuándo agregó el transporte (audit trail)

**Notas Técnicas**:
- Agregar campos a `Quote`: `shippingCost`, `shippingNotes`, `shippingCalculatedBy`, `shippingCalculatedAt`
- El transporte NO se incluye en servicios adicionales, es un campo independiente

**Prioridad**: Media  
**Estimación**: 3 puntos

---

## Épica 4: Servicios Incluidos vs Opcionales

### US-006: Configurar servicios como incluidos u opcionales por modelo

**Como** Admin  
**Quiero** definir si un servicio está incluido en el precio o es opcional  
**Para** vender ventanas con instalación garantizada o dejar que el cliente decida

**Criterios de Aceptación**:
- [ ] Al asociar un servicio a un modelo, puedo marcar "Incluido en el precio" (checkbox)
- [ ] Servicios incluidos se suman al precio base sin mostrarse como opción al cliente
- [ ] Servicios opcionales aparecen como checkboxes en el formulario de cotización
- [ ] En el PDF:
  - Servicios incluidos: se muestran en sección "Incluye" con precio $0 o se ocultan (configurable)
  - Servicios opcionales: aparecen solo si el cliente los seleccionó

**Ejemplo**:
- Modelo "Ventana Corrediza PVC Rehau":
  - Servicio Instalación Básica: **Incluido** (no aparece en formulario, se suma al precio)
  - Servicio Templado de Vidrio: **Opcional** (cliente decide si lo agrega)

**Notas Técnicas**:
- Agregar campo `isIncluded` a tabla intermedia `ModelService`
- Modificar pricing engine para sumar servicios incluidos automáticamente
- PDF template con sección "Servicios Incluidos" condicional

**Prioridad**: Alta  
**Estimación**: 5 puntos

---

## Épica 5: Simplificación del Formulario de Cotización

### US-007: Wizard minimalista para configurar ventana

**Como** Cliente final  
**Quiero** un proceso simple paso a paso para cotizar  
**Para** no sentirme abrumado con demasiada información técnica

**Criterios de Aceptación**:
- [ ] El formulario de cotización es un wizard/stepper con 4 pasos:
  1. **Ubicación**: ¿Dónde irá la ventana? (Alcoba, Oficina, Baño, Sala, Cocina, etc.) - dropdown simple
  2. **Dimensiones**: Ancho × Alto (inputs numéricos con validación de límites)
  3. **Vidrio**: Selector visual de soluciones (térmico, acústico, seguridad) - tarjetas con íconos
  4. **Servicios** (solo los opcionales): Checkboxes con descripción corta
- [ ] Cada paso muestra el precio parcial actualizado
- [ ] Puedo volver atrás sin perder mis selecciones
- [ ] En mobile, el wizard es vertical; en desktop, horizontal con indicadores de progreso
- [ ] Al finalizar, veo resumen completo antes de agregar al Budget

**Notas de UX**:
- Usar librería react-hook-form multi-step o headless UI
- Validación paso a paso (no puedo avanzar si hay errores)
- Guardar progreso en localStorage por si el usuario cierra el navegador

**Prioridad**: Alta  
**Estimación**: 8 puntos

---

### US-008: Campo "Ubicación de la ventana" en ítem de cotización

**Como** Comercial  
**Quiero** saber dónde irá cada ventana del proyecto del cliente  
**Para** hacer recomendaciones específicas (ej. vidrio acústico en alcoba principal)

**Criterios de Aceptación**:
- [ ] El ítem de cotización tiene campo `roomLocation` (ej. "Alcoba principal", "Baño 2", "Sala")
- [ ] En el PDF, cada ítem muestra la ubicación claramente
- [ ] El campo es opcional pero recomendado (placeholder: "Ej. Alcoba principal")
- [ ] Las ubicaciones más comunes se sugieren en un dropdown (con opción de texto libre)

**Lista Sugerida**:
- Alcoba principal / Alcoba secundaria
- Sala / Comedor
- Cocina
- Baño principal / Baño secundario
- Oficina / Estudio
- Balcón / Terraza
- Escalera / Pasillo
- Otro (especificar)

**Prioridad**: Media  
**Estimación**: 2 puntos

---

## Épica 6: Branding y Comunicación

### US-009: Configurar datos de branding del tenant

**Como** Admin de Vitro Rojas  
**Quiero** personalizar el branding de la plataforma con mi logo y redes sociales  
**Para** que los clientes identifiquen mi negocio fácilmente

**Criterios de Aceptación**:
- [ ] En TenantConfig puedo subir:
  - Logo (PNG/SVG, máx 500KB)
  - Logo alternativo para PDF (versión horizontal si es necesario)
  - Colores corporativos (primario, secundario, acento) - hex codes
- [ ] Puedo configurar enlaces a redes sociales:
  - Facebook (URL)
  - Instagram (handle o URL)
  - LinkedIn (URL)
  - WhatsApp Business (número con código de país)
- [ ] El logo aparece en:
  - Header del sitio web
  - Footer del PDF de cotización
  - Emails transaccionales (futuro)
- [ ] Las redes sociales aparecen en footer del sitio y PDF

**Notas Técnicas**:
- Usar servicio de almacenamiento (Vercel Blob o Cloudinary) para logos
- Validar formatos y tamaños de imagen
- Campos nuevos en `TenantConfig`: `logoUrl`, `logoPdfUrl`, `primaryColor`, `socialFacebook`, `socialInstagram`, `socialLinkedIn`, `whatsappNumber`

**Prioridad**: Media  
**Estimación**: 5 puntos

---

### US-010: Botón de WhatsApp en catálogo y cotización

**Como** Cliente final  
**Quiero** contactar rápidamente al negocio por WhatsApp  
**Para** hacer preguntas antes o después de cotizar

**Criterios de Aceptación**:
- [ ] Hay un botón flotante de WhatsApp (bottom-right) en todo el sitio
- [ ] Al hacer clic, abre WhatsApp con mensaje prellenado:
  - Desde catálogo: "Hola, estoy interesado en [Nombre del Modelo]. ¿Me pueden ayudar?"
  - Desde Budget: "Hola, tengo una cotización de $XXX para [N] ventanas. ¿Podemos coordinar?"
  - Desde Quote: "Hola, quiero consultar sobre mi cotización #[ID]"
- [ ] El número de WhatsApp se configura en TenantConfig (formato internacional)
- [ ] El botón es accesible (ARIA label, contraste adecuado)

**Notas de UX**:
- Usar ícono oficial de WhatsApp (verde #25D366)
- Animación sutil de entrada (slide-in)
- En mobile, el botón no tapa elementos importantes (fab position)

**Prioridad**: Alta  
**Estimación**: 2 puntos

---

## Épica 7: Vista Admin de Cotizaciones

### US-011: Dashboard de cotizaciones para Admin/Comercial

**Como** Admin o Comercial  
**Quiero** ver todas las cotizaciones en una tabla con información relevante  
**Para** gestionarlas eficientemente y priorizar seguimiento

**Criterios de Aceptación**:
- [ ] Tabla server-side con columnas:
  - # (ID secuencial de cotización)
  - Fecha de creación
  - Cliente/Proyecto (nombre + ciudad)
  - Total (precio con formato de moneda)
  - Estado (chip visual: Pendiente, En Revisión, Enviada, Cancelada)
  - Responsable (comercial asignado, si aplica)
  - Acciones (Ver, Editar, Exportar PDF, Eliminar)
- [ ] Filtros:
  - Por estado (multi-select)
  - Rango de fechas (desde-hasta)
  - Búsqueda por proyecto/cliente/ciudad (debounced 300ms)
  - Ordenamiento por columna (fecha, total, estado)
- [ ] Paginación (20 cotizaciones por página)
- [ ] Performance: <2s carga (100 cotizaciones)

**Notas Técnicas**:
- Reutilizar patrón server-optimized table (URL state management)
- tRPC procedure `admin.quotes.list` con filtros + paginación
- Usar componente `ServerTable` de `src/app/_components/server-table/`

**Prioridad**: Alta  
**Estimación**: 8 puntos

---

### US-012: Asignar comercial a cotización

**Como** Admin  
**Quiero** asignar un comercial responsable a cada cotización  
**Para** distribuir el trabajo y tener trazabilidad de seguimiento

**Criterios de Aceptación**:
- [ ] En la vista de edición de cotización, puedo seleccionar un comercial de un dropdown
- [ ] Solo usuarios con rol "Comercial" aparecen en la lista
- [ ] El comercial asignado recibe notificación (email/in-app) de nueva cotización
- [ ] En el dashboard de cotizaciones, puedo filtrar por comercial responsable
- [ ] El audit trail registra quién asignó a quién y cuándo

**Notas Técnicas**:
- Agregar campo `assignedToUserId` en `Quote`
- Crear rol "Comercial" en sistema de roles (NextAuth)
- Endpoint tRPC `admin.quotes.assign` con validación de permisos

**Prioridad**: Media  
**Estimación**: 5 puntos

---

## Épica 8: Nuevo Flujo de Estados de Cotización

### US-013: Estado "Estimado del Sistema" para cotizaciones iniciales

**Como** Cliente final  
**Quiero** que mi cotización inicial se marque claramente como estimado  
**Para** entender que es un precio preliminar sujeto a revisión comercial

**Criterios de Aceptación**:
- [ ] Al crear una cotización desde el Budget Cart, el estado inicial es "Estimado del Sistema"
- [ ] El PDF generado muestra claramente en el header:
  ```
  COTIZACIÓN ESTIMADA
  Este es un precio preliminar. Nuestro equipo comercial lo contactará
  para confirmar detalles y entregarle su cotización final.
  ```
- [ ] En My Quotes, las cotizaciones estimadas tienen un badge naranja distintivo
- [ ] El cliente NO puede editar cotizaciones en este estado (solo ver/exportar)

**Notas Técnicas**:
- Renombrar estado `draft` a `system_estimate`
- Actualizar enums en Prisma schema y validaciones Zod
- Modificar PDF template para agregar disclaimer en header

**Prioridad**: Alta  
**Estimación**: 3 puntos

---

### US-014: Estado "En Revisión Comercial" para ajustes del vendedor

**Como** Comercial  
**Quiero** marcar una cotización como "En Revisión" mientras afino precios y transporte  
**Para** que el cliente sepa que estoy trabajando en su solicitud

**Criterios de Aceptación**:
- [ ] Puedo cambiar el estado de "Estimado del Sistema" a "En Revisión Comercial"
- [ ] Al cambiar el estado, puedo agregar notas internas (no visibles para el cliente)
- [ ] El cliente ve en My Quotes: "Tu cotización está siendo revisada por nuestro equipo"
- [ ] Puedo editar todos los campos: precios, servicios, transporte, descuentos
- [ ] El sistema registra timestamp de inicio de revisión

**Workflow**:
```
Estimado del Sistema → En Revisión Comercial → Enviada al Cliente
```

**Prioridad**: Alta  
**Estimación**: 5 puntos

---

### US-015: Estado "Enviada al Cliente" con versión final

**Como** Comercial  
**Quiero** marcar la cotización como "Enviada" cuando esté lista  
**Para** notificar al cliente que puede revisar su presupuesto final

**Criterios de Aceptación**:
- [ ] Solo puedo cambiar a "Enviada" si completé campos obligatorios:
  - Transporte calculado (o marcado como "No aplica")
  - Comercial asignado
  - Notas del comercial (opcional pero recomendado)
- [ ] Al cambiar a "Enviada":
  - Se genera PDF final automáticamente
  - Se envía email al cliente con link de descarga
  - Se bloquea edición de precios (solo notas adicionales)
- [ ] El PDF final NO tiene disclaimer de "estimado", muestra "COTIZACIÓN FORMAL"
- [ ] El sistema registra timestamp de envío

**Prioridad**: Alta  
**Estimación**: 5 puntos

---

## Épica 9: Configuración Multi-Tenant

### US-016: Configurar regiones/provincias por país

**Como** Admin de Vitro Rojas (Panamá)  
**Quiero** que los clientes seleccionen provincias panameñas en vez de departamentos colombianos  
**Para** adaptar la plataforma a mi mercado local

**Criterios de Aceptación**:
- [ ] TenantConfig tiene campo `country` (ISO 3166-1 alpha-2: PA, CO, MX, etc.)
- [ ] Al seleccionar país, el sistema carga lista de regiones correspondiente:
  - Panamá: Bocas del Toro, Coclé, Colón, Chiriquí, Darién, Herrera, Los Santos, Panamá, Veraguas, Panamá Oeste
  - Colombia: Antioquia, Bogotá D.C., Valle del Cauca, etc.
  - México: Estados mexicanos
- [ ] El dropdown de región en formularios se ajusta automáticamente
- [ ] El sistema soporta agregar países nuevos sin modificar código (JSON config)

**Notas Técnicas**:
- Crear archivo `src/lib/data/countries.json` con estructura:
  ```json
  {
    "PA": {
      "name": "Panamá",
      "regions": ["Bocas del Toro", "Coclé", ...]
    }
  }
  ```
- Helper function `getRegionsByCountry(countryCode: string)`

**Prioridad**: Media  
**Estimación**: 3 puntos

---

## Resumen de Prioridades

### Alta Prioridad (Sprint 1 - Funcionalidades Core)
- **US-001**: Configurar colores disponibles por modelo (5 pts)
- **US-002**: Seleccionar color en cotización del cliente (3 pts)
- **US-006**: Servicios incluidos vs opcionales (5 pts)
- **US-007**: Wizard minimalista para cotización (8 pts)
- **US-010**: Botón de WhatsApp (2 pts)
- **US-011**: Dashboard de cotizaciones admin (8 pts)
- **US-013**: Estado "Estimado del Sistema" (3 pts)
- **US-014**: Estado "En Revisión Comercial" (5 pts)
- **US-015**: Estado "Enviada al Cliente" (5 pts)

**Total Sprint 1**: 44 puntos

### Media Prioridad (Sprint 2 - Mejoras UX y Configuración)
- **US-003**: Simplificar campos de dirección (2 pts)
- **US-004**: Indicar transporte post-cotización (1 pt)
- **US-005**: Comercial agrega transporte (3 pts)
- **US-008**: Campo ubicación de ventana (2 pts)
- **US-009**: Configurar branding (5 pts)
- **US-012**: Asignar comercial (5 pts)
- **US-016**: Regiones por país (3 pts)

**Total Sprint 2**: 21 puntos

---

## Métricas de Éxito

### Objetivos Cuantitativos
- ⏱️ Reducir tiempo de cotización de cliente: **de 10 min a 3 min** (wizard simplificado)
- 📈 Aumentar tasa de conversión Budget → Quote: **de 42% a 55%** (menos fricción)
- 🎯 Reducir abandono en formulario: **de 35% a 15%** (stepper claro)
- 💰 Aumentar ticket promedio: **+12%** (opciones de color y servicios visibles)

### Objetivos Cualitativos
- ✅ **Clientes**: "El proceso es claro y no me siento perdido"
- ✅ **Comerciales**: "Las cotizaciones llegan con toda la info que necesito"
- ✅ **Admin**: "Puedo gestionar el catálogo sin ayuda técnica"

---

## Dependencias y Riesgos

### Dependencias Técnicas
1. **US-006** (Servicios incluidos) requiere refactor del pricing engine
2. **US-007** (Wizard) requiere decisión de librería UI (react-hook-form multi-step)
3. **US-011** (Dashboard admin) depende de patrón server-table existente
4. **US-013-015** (Flujo de estados) requiere migración de datos de cotizaciones existentes

### Riesgos Identificados
1. **Complejidad del Wizard**: 8 puntos es estimación optimista, puede extenderse
2. **Migración de Estados**: Cotizaciones en "draft" actual → ¿se convierten a "system_estimate"?
3. **Performance de Colores**: Si hay +20 colores por modelo, puede afectar UX del selector
4. **Multi-Tenant Real**: Vitro Rojas es el primer cliente real, configuración debe ser robusta

### Mitigaciones
- Prototipo de Wizard en Figma antes de implementar (validar con usuario)
- Script de migración de datos con rollback (test en staging primero)
- Lazy loading de colores si pasan de 10 opciones
- Feature flags para habilitar funcionalidades gradualmente por tenant

---

## Notas para Desarrollo

### Convenciones de Código
- **Archivos**: kebab-case (`model-colors.ts`, `quote-wizard.tsx`)
- **Componentes**: PascalCase (`ColorSelector`, `QuoteWizard`)
- **tRPC procedures**: kebab-case (`'admin.models.add-color'`)
- **UI Text**: Spanish (es-LA) ONLY

### Testing Requerido
- [ ] Unit tests para pricing engine con colores y servicios incluidos
- [ ] Integration tests para flujo de estados (system_estimate → review → sent)
- [ ] E2E tests para wizard completo (Playwright)
- [ ] Visual regression tests para selector de colores (Percy/Chromatic)

### Documentación
- Actualizar PRD con nuevas funcionalidades
- Crear guía de usuario para Admin (configuración de colores/servicios)
- Documentar flujo de estados con diagrama de máquina de estados
- FAQ para comerciales sobre transporte y revisión de cotizaciones

---

**Preparado por**: GitHub Copilot  
**Revisado por**: [Pendiente]  
**Aprobado por**: [Pendiente]  
**Fecha de aprobación**: [Pendiente]
