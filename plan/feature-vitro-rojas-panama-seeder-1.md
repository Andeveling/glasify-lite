---
goal: Implementar seeder completo para Vitro Rojas S.A. (mercado panameño)
version: 1.0
date_created: 2025-01-21
last_updated: 2025-01-21
owner: Andres
status: 'In progress'
tags: [feature, seeder, data, preset, panama]
---

# Implementación Seeder Vitro Rojas S.A. - Panamá

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

Crear preset completo de datos para **Vitro Rojas S.A.**, fabricante de ventanas y puertas de aluminio en Panamá, basado en su sistema de cotización y especificaciones técnicas de perfiles Extralum.

## ✅ IMPLEMENTACIÓN COMPLETADA

### Archivos Creados

1. **Datos de Vitro Rojas** (`prisma/data/vitro-rojas/`):
   - ✅ `tenant-config.data.ts` - Configuración de negocio (referencia)
   - ✅ `profile-suppliers.data.ts` - Extralum (único proveedor)
   - ✅ `glass-suppliers.data.ts` - 2 proveedores locales (referencia)
   - ✅ `glass-types.data.ts` - 11 tipos de cristal (USD)
   - ✅ `glass-solutions.data.ts` - 4 soluciones
   - ✅ `models-sliding.data.ts` - 6 modelos corredizos
   - ✅ `models-casement.data.ts` - 3 modelos abatibles
   - ✅ `services.data.ts` - 5 servicios

2. **Preset Principal**:
   - ✅ `prisma/data/presets/vitro-rojas-panama.preset.ts` - Integración completa

3. **Integración CLI**:
   - ✅ `prisma/seed-cli.ts` - Preset registrado

4. **Documentación**:
   - ✅ `docs/seeders/vitro-rojas-panama.md` - Guía completa
   - ✅ `.env.vitro-rojas.example` - Configuración de ejemplo
   - ✅ `README.md` - Actualizado con comandos

### Contenido del Preset

- **1** proveedor de perfiles (Extralum)
- **11** tipos de cristal (2 general + 3 security + 2 insulation + 4 decorative)
- **9** modelos (6 corredizos + 3 abatibles)
- **5** servicios (instalación, sellado, desmonte, reposición, protección)
- **4** soluciones de cristal

### Cómo Usar

```bash
# 1. Configurar .env con datos de Vitro Rojas
cp .env.vitro-rojas.example .env
# Editar .env con valores reales

# 2. Ejecutar seeding
pnpm seed --preset=vitro-rojas-panama --verbose

# 3. Validar en Prisma Studio
pnpm db:studio
```

### Arquitectura: Single-Tenant ✅

- Cada cliente = Una instancia separada
- TenantConfig singleton por instancia
- Factories reutilizables entre clientes
- NO requiere cambios arquitecturales para agregar clientes

---

## 1. Requirements & Constraints

### Requisitos de Negocio

- **REQ-001**: Configurar tenant para mercado panameño (USD, es-PA, America/Panama)
- **REQ-002**: Implementar sistema de cotización de Vitro Rojas basado en m² con adicionales por tipo de cristal
- **REQ-003**: Soportar sistemas Corredizo y Abatible con configuraciones de 2, 3 y 4 paños
- **REQ-004**: Usar perfiles de aluminio Extralum como único proveedor
- **REQ-005**: Incluir cristales comunes del mercado panameño (mínimo 2 por solución)
- **REQ-006**: Implementar servicios basados en fórmulas de corte de Vitro Rojas

### Requisitos Técnicos

- **REQ-007**: Usar factories existentes (`model.factory.ts`, `glass-type.factory.ts`, `service.factory.ts`, etc.)
- **REQ-008**: Seguir patrón de presets existente (`minimal.preset.ts`, `demo-client.preset.ts`)
- **REQ-009**: Validar todos los datos con Zod schemas antes de inserción
- **REQ-010**: Mantener idempotencia (safe to run multiple times)
- **REQ-011**: Generar datos determinísticos (sin randomización)

### Precios Base de Vitro Rojas

- **REQ-012**: Sistema Corredizo:
  - 2 paños: $130 USD/m²
  - 3 paños: $150 USD/m²
  - 4 paños: $165 USD/m²

- **REQ-013**: Sistema Abatible:
  - 2 paños: $130 USD/m²
  - 3 paños: $150 USD/m²
  - 4 paños: $170 USD/m²

- **REQ-014**: Adicionales por tipo de cristal:
  - Claro: Incluido en precio base
  - Laminado: +$15 USD/m²
  - Gris o Bronce: +$10 USD/m²
  - Reflectivo: +$15 USD/m²
  - Laminado Gris/Bronce: +$18 USD/m²

### Fórmulas de Corte (Vitro Rojas)

- **REQ-015**: 2 paños:
  - Alto = Alto total - 66mm
  - Ancho = (Ancho total - 7mm) ÷ 2

- **REQ-016**: 3 paños:
  - Alto = Alto total - 66mm
  - Ancho = (Ancho total + 63mm) ÷ 3

- **REQ-017**: 4 paños:
  - Alto = Alto total - 66mm
  - Ancho = (Ancho total + 48mm) ÷ 4

- **REQ-018**: Puertas/ventanas con marco perimetral:
  - Alto = Alto total - 63mm
  - Ancho = Ancho total - 63mm

- **REQ-019**: Puertas con zócalo:
  - Alto = Alto total - 41mm

### Especificaciones Técnicas Extralum

- **REQ-020**: Sistema Corredizo VC Panamá:
  - Perfiles: Serie 100/400
  - Espesores: 1.10-1.52mm
  - Vidrios: 6mm (simple), 33.1mm (laminado)
  - Dimensiones: 250-1600mm (ancho), 272-1850mm (alto)

- **REQ-021**: Sistema Abatible Europa:
  - Perfiles: EX-1385, EX-1390, EX-1393
  - Espesores: 1.10-1.50mm
  - Vidrios: 6-12mm (simple), DVH 12.50-18.50mm
  - Dimensiones: 478-1050mm (ancho móvil), 478-2000mm (alto móvil)

- **REQ-022**: Sistema Corredizo Europa Clásica:
  - Perfiles: EX-1289, EX-1379, EX-1399, EX-1401
  - Espesores: 1.10-1.70mm
  - Vidrios: 6-12mm (simple), DVH 16-18.5mm
  - Dimensiones: 402-1600mm (ancho), 320-2800mm (alto)

### Constraints

- **CON-001**: NO usar randomización (datos determinísticos para testing)
- **CON-002**: NO crear barrels (index.ts) - usar imports directos
- **CON-003**: Mantener compatibilidad con CLI de seeding existente
- **CON-004**: Respetar límites de dimensiones según especificaciones Extralum
- **CON-005**: Precios en USD (no COP) para mercado panameño

### Guidelines

- **GUD-001**: Usar comentarios en español para descripciones de negocio
- **GUD-002**: Código y variables en inglés
- **GUD-003**: Documentar fuentes de datos (docs Extralum, fórmulas Vitro Rojas)
- **GUD-004**: Incluir metadata en factories (source, lastUpdate)
- **GUD-005**: Validar integridad referencial (GlassType.id ↔ Model.compatibleGlassTypeIds)

### Patterns

- **PAT-001**: Seguir Factory Pattern para creación de datos
- **PAT-002**: Usar Preset Pattern para configuración completa del cliente
- **PAT-003**: Validación en dos capas: Zod schema + business logic
- **PAT-004**: Separar datos de configuración (tenant) de datos de catálogo (models, glass types)

---

## 2. Implementation Steps

### Phase 1: Configuración de Tenant y Proveedores

**GOAL-001**: Establecer configuración base para Vitro Rojas y proveedores de Panamá

| Task     | Description                                                                                                                                                                                                                  | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Crear archivo `prisma/data/vitro-rojas/tenant-config.data.ts` con TenantConfig para Panamá (businessName: "Vitro Rojas S.A.", currency: "USD", locale: "es-PA", timezone: "America/Panama", quoteValidityDays: 15)           |           |      |
| TASK-002 | Crear archivo `prisma/data/vitro-rojas/profile-suppliers.data.ts` con ProfileSupplier para Extralum (materialType: "ALUMINUM", isActive: true, notes: "Distribuidor de perfiles de aluminio en Panamá - Series VC y Europa") |           |      |
| TASK-003 | Crear archivo `prisma/data/vitro-rojas/glass-suppliers.data.ts` con al menos 2 GlassSupplier para mercado panameño (usar factory `glass-supplier.factory.ts`)                                                                |           |      |

### Phase 2: Tipos de Vidrio (GlassTypes)

**GOAL-002**: Definir tipos de cristal compatibles con sistemas de Vitro Rojas

| Task     | Description                                                                                                                                   | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-004 | Crear archivo `prisma/data/vitro-rojas/glass-types.data.ts` con tipos de cristal para Solución General: Claro 6mm ($28/m²), Claro 8mm ($35/m²) |           |      |
| TASK-005 | Agregar tipos de cristal para Solución Seguridad: Laminado 6.38mm ($43/m²), Laminado 8.38mm ($52/m²)                                           |           |      |
| TASK-006 | Agregar tipos de cristal para Solución Térmica: DVH 16mm ($85/m²), DVH 18.5mm ($92/m²)                                                         |           |      |
| TASK-007 | Agregar tipos de cristal decorativos: Gris 6mm ($38/m²), Bronce 6mm ($38/m²), Reflectivo 6mm ($43/m²), Laminado Gris 6.38mm ($61/m²)           |           |      |
| TASK-008 | Validar que cada solución (general, security, insulation, decorative) tenga mínimo 2 tipos de cristal                                          |           |      |

### Phase 3: Modelos de Ventanas Corredizas

**GOAL-003**: Crear modelos de sistemas corredizos (VC Panamá y Europa Clásica)

| Task     | Description                                                                                                                                                                            | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-009 | Crear archivo `prisma/data/vitro-rojas/models-sliding.data.ts` para modelos corredizos                                                                                                 |           |      |
| TASK-010 | Agregar modelo "Corredizo VC Panamá 2 Paños (OX)" con basePrice: $130/m², minWidth: 500mm, maxWidth: 3200mm, minHeight: 544mm, maxHeight: 1850mm, glassDiscounts según fórmula 2 paños |           |      |
| TASK-011 | Agregar modelo "Corredizo VC Panamá 3 Paños (XOX)" con basePrice: $150/m², dimensiones ajustadas para 3 paños                                                                          |           |      |
| TASK-012 | Agregar modelo "Corredizo VC Panamá 4 Paños (OXXO)" con basePrice: $165/m², dimensiones para 4 paños                                                                                   |           |      |
| TASK-013 | Agregar modelo "Corredizo Europa Clásica 2 Paños (OX)" con basePrice: $140/m², minWidth: 804mm, maxWidth: 3200mm, minHeight: 640mm, maxHeight: 2800mm                                  |           |      |
| TASK-014 | Agregar modelo "Corredizo Europa Clásica 3 Paños (XOX)" con basePrice: $160/m², dimensiones Europa                                                                                     |           |      |
| TASK-015 | Agregar modelo "Corredizo Europa Clásica 4 Paños (OXXO)" con basePrice: $175/m², dimensiones Europa                                                                                    |           |      |
| TASK-016 | Vincular compatibleGlassTypeIds con cristales de 6-8mm (simple) y DVH 16-18.5mm para todos los modelos corredizos                                                                        |           |      |

### Phase 4: Modelos de Ventanas Abatibles

**GOAL-004**: Crear modelos de sistema abatible Europa

| Task     | Description                                                                                                                                            | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-017 | Crear archivo `prisma/data/vitro-rojas/models-casement.data.ts` para modelos abatibles                                                                 |           |      |
| TASK-018 | Agregar modelo "Abatible Europa 2 Hojas (OX)" con basePrice: $130/m², minWidth: 956mm (2x478mm), maxWidth: 2100mm, minHeight: 478mm, maxHeight: 2000mm |           |      |
| TASK-019 | Agregar modelo "Abatible Europa 3 Hojas (XOX)" con basePrice: $150/m², dimensiones ajustadas para 3 hojas                                              |           |      |
| TASK-020 | Agregar modelo "Abatible Europa 4 Hojas (XXOO)" con basePrice: $170/m², dimensiones para 4 hojas                                                       |           |      |
| TASK-021 | Configurar glassDiscounts según fórmula marco perimetral (63mm alto/ancho) para contramarco EX-1385                                                    |           |      |
| TASK-022 | Vincular compatibleGlassTypeIds con cristales 6-12mm (simple/templado) y DVH 12.5-18.5mm                                                                 |           |      |

### Phase 5: Servicios Adicionales

**GOAL-005**: Definir servicios típicos de instalación y mantenimiento de ventanas

| Task     | Description                                                                                                                                            | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-023 | Crear archivo `prisma/data/vitro-rojas/services.data.ts` para servicios                                                                                |           |      |
| TASK-024 | Agregar servicio "Instalación de Ventanas" (type: area, rate: $15 USD/m², unit: sqm, notes: "Incluye colocación y nivelación de ventanas")             |           |      |
| TASK-025 | Agregar servicio "Sellado Perimetral" (type: perimeter, rate: $3.50 USD/ml, unit: ml, notes: "Sellado con silicona estructural")                       |           |      |
| TASK-026 | Agregar servicio "Desmonte de Ventana Existente" (type: fixed, rate: $25 USD/unidad, unit: unit, notes: "Retiro de ventana antigua, incluye limpieza") |           |      |
| TASK-027 | Agregar servicio "Servicio de Reposición" (type: fixed, rate: $35 USD/unidad, unit: unit, notes: "Reposición de cristal o componentes dañados")         |           |      |
| TASK-028 | Agregar servicio "Protección para Obra" (type: area, rate: $2.50 USD/m², unit: sqm, notes: "Protección con film durante construcción")                 |           |      |

### Phase 6: Soluciones de Vidrio

**GOAL-006**: Definir GlassSolutions típicas del mercado panameño

| Task     | Description                                                                                                                                                                                       | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-031 | Crear archivo `prisma/data/vitro-rojas/glass-solutions.data.ts` para soluciones                                                                                                                   |           |      |
| TASK-032 | Agregar solución "Ventana Residencial Estándar" (purpose: general, description: "Vidrio claro simple para uso residencial", compatibleGlassTypeIds: ["Claro 6mm", "Claro 8mm"])                   |           |      |
| TASK-033 | Agregar solución "Seguridad Residencial" (purpose: security, description: "Vidrio laminado para mayor seguridad contra impactos", compatibleGlassTypeIds: ["Laminado 6.38mm", "Laminado 8.38mm"]) |           |      |
| TASK-034 | Agregar solución "Control Térmico" (purpose: insulation, description: "DVH para aislamiento térmico en áreas con A/C", compatibleGlassTypeIds: ["DVH 16mm", "DVH 18.5mm"])                        |           |      |
| TASK-035 | Agregar solución "Vidrios Decorativos" (purpose: decorative, description: "Vidrios tintados y reflectivos para privacidad", compatibleGlassTypeIds: ["Gris 6mm", "Bronce 6mm", "Reflectivo 6mm"]) |           |      |

### Phase 7: Preset Integration

**GOAL-007**: Integrar datos en preset ejecutable

| Task     | Description                                                                                                                                                                                            | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-036 | Crear archivo `prisma/data/presets/vitro-rojas-panama.preset.ts` que importe todos los datos creados                                                                                                   |           |      |
| TASK-037 | Exportar objeto SeedPreset con estructura: { name, description, tenantConfig, profileSuppliers, glassSuppliers, glassCharacteristics (usar existentes), glassSolutions, glassTypes, models, services } |           |      |
| TASK-038 | Agregar metadata al preset: version: "1.0.0", author: "Andres", createdAt: "2025-01-21", dataSource: "Vitro Rojas cotización + Extralum fichas técnicas"                                               |           |      |
| TASK-039 | Registrar preset en `prisma/seed-cli.ts` en el objeto PRESETS: 'vitro-rojas-panama': vitroRojasPanamaPreset                                                                                            |           |      |
| TASK-040 | Validar que el preset cumpla con tipo SeedPreset de `seed-orchestrator.ts`                                                                                                                             |           |      |

### Phase 8: Testing & Documentation

**GOAL-008**: Validar funcionamiento del seeder y documentar

| Task     | Description                                                                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-041 | Ejecutar `pnpm seed --preset=vitro-rojas-panama --verbose` en base de datos limpia y verificar sin errores                  |           |      |
| TASK-042 | Validar en Prisma Studio que TenantConfig tiene datos correctos de Panamá (USD, es-PA, America/Panama)                      |           |      |
| TASK-043 | Validar que se crearon exactamente 6 modelos corredizos + 3 modelos abatibles = 9 modelos totales                           |           |      |
| TASK-044 | Validar que cada modelo tiene mínimo 2 GlassTypes compatibles                                                               |           |      |
| TASK-045 | Validar que se crearon 5 servicios (Instalación, Sellado Perimetral, Desmonte, Reposición, Protección)                      |           |      |
| TASK-046 | Validar que se crearon 4 GlassSolutions con sus respectivos GlassTypes vinculados                                           |           |      |
| TASK-047 | Verificar que precios coinciden con sistema de Vitro Rojas ($130-$170 base + adicionales por tipo de cristal)                |           |      |
| TASK-048 | Crear archivo `docs/seeders/vitro-rojas-panama.md` documentando estructura del preset y cómo extenderlo para otros clientes |           |      |
| TASK-049 | Actualizar `README.md` con ejemplo de uso: `pnpm seed --preset=vitro-rojas-panama`                                          |           |      |

---

## 3. Alternatives

### Alternativas Consideradas

- **ALT-001**: Crear un seeder monolítico sin usar factories
  - **Razón descartada**: No es reutilizable para otros clientes, no valida datos

- **ALT-002**: Usar precios en COP y convertir a USD dinámicamente
  - **Razón descartada**: Vitro Rojas opera 100% en USD, conversión añade complejidad innecesaria

- **ALT-003**: Crear modelos genéricos sin especificaciones técnicas Extralum
  - **Razón descartada**: Perderíamos restricciones reales de dimensiones, espesores de cristal compatibles

- **ALT-004**: Hardcodear IDs de GlassTypes en modelos
  - **Razón descartada**: No es idempotente, requiere conocer IDs generados previamente

- **ALT-005**: Crear un preset por cada sistema (corredizo, abatible)
  - **Razón descartada**: Vitro Rojas necesita ambos sistemas, separar no tiene valor

---

## 4. Dependencies

### Dependencias de Código

- **DEP-001**: `prisma/factories/model.factory.ts` - Factory para crear Models validados
- **DEP-002**: `prisma/factories/glass-type.factory.ts` - Factory para crear GlassTypes validados
- **DEP-003**: `prisma/factories/service.factory.ts` - Factory para crear Services validados
- **DEP-004**: `prisma/factories/glass-solution.factory.ts` - Factory para crear GlassSolutions validados
- **DEP-005**: `prisma/factories/profile-supplier.factory.ts` - Factory para crear ProfileSuppliers validados
- **DEP-006**: `prisma/factories/glass-supplier.factory.ts` - Factory para crear GlassSuppliers validados
- **DEP-007**: `prisma/seeders/seed-orchestrator.ts` - Orchestrator que ejecuta seeding
- **DEP-008**: `prisma/seed-cli.ts` - CLI para ejecutar presets

### Dependencias de Datos

- **DEP-009**: Documentación Extralum (adjunta en `/docs/context/extralum-pa/`)
- **DEP-010**: Sistema de cotización Vitro Rojas (adjunto en `/docs/context/vitro-rojas/`)
- **DEP-011**: GlassCharacteristics existentes (reutilizar de minimal/demo-client presets)

### Dependencias de Configuración

- **DEP-012**: Variables de entorno validadas en `src/env-seed.ts`
- **DEP-013**: Esquema Prisma actualizado con relaciones ProfileSupplier ↔ Model
- **DEP-014**: TenantConfig singleton pattern establecido

---

## 5. Files

### Archivos Nuevos a Crear

- **FILE-001**: `prisma/data/vitro-rojas/tenant-config.data.ts` - Configuración de tenant para Panamá
- **FILE-002**: `prisma/data/vitro-rojas/profile-suppliers.data.ts` - Datos de Extralum
- **FILE-003**: `prisma/data/vitro-rojas/glass-suppliers.data.ts` - Proveedores de cristal en Panamá
- **FILE-004**: `prisma/data/vitro-rojas/glass-types.data.ts` - Tipos de cristal del mercado panameño
- **FILE-005**: `prisma/data/vitro-rojas/models-sliding.data.ts` - Modelos de sistemas corredizos
- **FILE-006**: `prisma/data/vitro-rojas/models-casement.data.ts` - Modelos de sistemas abatibles
- **FILE-007**: `prisma/data/vitro-rojas/services.data.ts` - Servicios de corte e instalación
- **FILE-008**: `prisma/data/vitro-rojas/glass-solutions.data.ts` - Soluciones de cristal típicas
- **FILE-009**: `prisma/data/presets/vitro-rojas-panama.preset.ts` - Preset completo ejecutable
- **FILE-010**: `docs/seeders/vitro-rojas-panama.md` - Documentación del preset

### Archivos a Modificar

- **FILE-011**: `prisma/seed-cli.ts` - Registrar nuevo preset en objeto PRESETS
- **FILE-012**: `README.md` - Agregar ejemplo de uso del preset

### Archivos de Referencia (NO modificar)

- **FILE-013**: `prisma/data/presets/minimal.preset.ts` - Ejemplo de estructura de preset
- **FILE-014**: `prisma/data/presets/demo-client.preset.ts` - Ejemplo de preset completo
- **FILE-015**: `docs/context/extralum-pa/Catálogo VC Panamá.md` - Especificaciones técnicas VC
- **FILE-016**: `docs/context/extralum-pa/FT-026-Sistema-de-Ventana-Abatible-Europa.md` - Specs Abatible
- **FILE-017**: `docs/context/extralum-pa/Corrediza-Europa-Clásica.md` - Specs Corredizo Europa
- **FILE-018**: `docs/context/vitro-rojas/Vitro Rojas S.A - Corte.md` - Sistema de cotización

---

## 6. Testing

### Unit Tests (NO requeridos para seeders)

Los seeders son scripts de datos, no lógica de negocio. La validación se hace mediante:
1. Zod schemas en factories
2. Business logic validations en factories
3. Prisma constraints en schema

### Integration Tests (Seeding en DB de prueba)

- **TEST-001**: Ejecutar `pnpm seed --preset=vitro-rojas-panama` en DB limpia
  - **Validar**: Sin errores de Zod validation
  - **Validar**: Sin errores de Prisma unique constraints
  - **Validar**: Sin errores de foreign key constraints

- **TEST-002**: Validar TenantConfig singleton
  - **Query**: `await prisma.tenantConfig.findUnique({ where: { id: '1' } })`
  - **Expect**: `businessName === "Vitro Rojas S.A."`
  - **Expect**: `currency === "USD"`
  - **Expect**: `locale === "es-PA"`
  - **Expect**: `timezone === "America/Panama"`

- **TEST-003**: Validar ProfileSuppliers
  - **Query**: `await prisma.profileSupplier.findMany()`
  - **Expect**: Contiene "Extralum" con `materialType === "ALUMINUM"`
  - **Expect**: `isActive === true`

- **TEST-004**: Validar GlassTypes creados
  - **Query**: `await prisma.glassType.count()`
  - **Expect**: Mínimo 9 tipos de cristal (2 por solución × 4 soluciones + extras)
  - **Expect**: Todos los precios en USD (no COP)

- **TEST-005**: Validar Models creados
  - **Query**: `await prisma.model.count()`
  - **Expect**: Exactamente 9 modelos (6 corredizos + 3 abatibles)
  - **Query**: `await prisma.model.findMany({ include: { glassTypes: true } })`
  - **Expect**: Cada modelo tiene mínimo 2 GlassTypes vinculados

- **TEST-006**: Validar Services creados
  - **Query**: `await prisma.service.count()`
  - **Expect**: Exactamente 5 servicios
  - **Query**: `await prisma.service.findMany({ where: { type: 'area' } })`
  - **Expect**: 2 servicios de área (Instalación + Protección)
  - **Query**: `await prisma.service.findMany({ where: { type: 'perimeter' } })`
  - **Expect**: 1 servicio perimetral (Sellado)
  - **Query**: `await prisma.service.findMany({ where: { type: 'fixed' } })`
  - **Expect**: 2 servicios fijos (Desmonte + Reposición)

- **TEST-007**: Validar GlassSolutions creadas
  - **Query**: `await prisma.glassSolution.count()`
  - **Expect**: Exactamente 4 soluciones (general, security, insulation, decorative)
  - **Query**: `await prisma.glassSolution.findMany({ include: { glassTypes: true } })`
  - **Expect**: Cada solución tiene mínimo 2 GlassTypes vinculados

- **TEST-008**: Validar dimensiones de modelos
  - **Query**: `await prisma.model.findFirst({ where: { name: { contains: "VC Panamá 2 Paños" } } })`
  - **Expect**: `minWidthMm === 500`, `maxWidthMm === 3200`, `minHeightMm === 544`, `maxHeightMm === 1850`

- **TEST-009**: Validar precios de modelos
  - **Query**: `await prisma.model.findFirst({ where: { name: { contains: "Corredizo VC Panamá 2 Paños" } } })`
  - **Expect**: `basePrice` aproximadamente $130 USD/m² (ajustado a Decimal)
  - **Query**: `await prisma.model.findFirst({ where: { name: { contains: "Abatible Europa 4 Hojas" } } })`
  - **Expect**: `basePrice` aproximadamente $170 USD/m²

- **TEST-010**: Validar idempotencia
  - **Step 1**: Ejecutar `pnpm seed --preset=vitro-rojas-panama`
  - **Step 2**: Ejecutar nuevamente `pnpm seed --preset=vitro-rojas-panama`
  - **Expect**: Sin errores de unique constraint
  - **Expect**: Counts de registros no se duplican (upsert funciona correctamente)

---

## 7. Risks & Assumptions

### Riesgos

- **RISK-001**: Conversión de precios COP → USD no documentada
  - **Mitigación**: Vitro Rojas opera en USD, no hay conversión necesaria
  - **Impacto**: Bajo

- **RISK-002**: Dimensiones máximas de Extralum pueden no cubrir todos los casos de uso
  - **Mitigación**: Usar dimensiones máximas de fichas técnicas como límites seguros
  - **Impacto**: Medio - puede requerir ajustes post-implementación

- **RISK-003**: Fórmulas de corte de Vitro Rojas pueden ser aproximaciones
  - **Mitigación**: Documentar en notas de servicios que son valores de referencia
  - **Impacto**: Bajo - son guías, no valores exactos

- **RISK-004**: Precios de cristal en Panamá pueden diferir de fuentes consultadas
  - **Mitigación**: Usar precios de referencia, Vitro Rojas puede actualizarlos post-seed
  - **Impacto**: Bajo - datos son base, no valores contractuales

- **RISK-005**: GlassCharacteristics actuales pueden no cubrir mercado panameño
  - **Mitigación**: Reutilizar existentes, agregar específicos si es necesario
  - **Impacto**: Bajo - características son genéricas

### Supuestos

- **ASSUMPTION-001**: Vitro Rojas usa únicamente perfiles Extralum (no otros proveedores)
  - **Validación**: Confirmado por documentación adjunta

- **ASSUMPTION-002**: Todos los precios están en USD sin IVA
  - **Validación**: Documentación de Vitro Rojas muestra precios en USD

- **ASSUMPTION-003**: Sistemas corredizos y abatibles son los únicos productos
  - **Validación**: Documentación Extralum cubre solo estos sistemas

- **ASSUMPTION-004**: GlassTypes son compartidos entre todos los modelos (no exclusivos por modelo)
  - **Validación**: Patrón establecido en presets existentes

- **ASSUMPTION-005**: Servicios de corte aplican por paño completo, no por corte individual
  - **Validación**: Interpretación de fórmulas de Vitro Rojas

- **ASSUMPTION-006**: DVH (Doble Vidrio Hermético) es equivalente a "Insulated Glass Unit"
  - **Validación**: Terminología estándar en industria del cristal

- **ASSUMPTION-007**: Locale `es-PA` es válido para formateo de fechas/números en Panamá
  - **Validación**: Estándar BCP 47 para español de Panamá

---

## 8. Related Specifications / Further Reading

### Especificaciones Relacionadas

- **SPEC-001**: [refactor-seeders-factory-pattern-1.md](/home/andres/Proyectos/glasify-lite/plan/refactor-seeders-factory-pattern-1.md) - Factory pattern para seeders (implementado)
- **SPEC-002**: [012-simplify-profile-suppliers](/home/andres/Proyectos/glasify-lite/specs/012-simplify-profile-suppliers/) - Simplificación de ProfileSupplier (branch actual)

### Documentación Externa

- **DOC-001**: [Catálogo VC Panamá](/home/andres/Proyectos/glasify-lite/docs/context/extralum-pa/Catálogo%20VC%20Panamá.md) - Especificaciones Sistema Corredizo VC
- **DOC-002**: [FT-026 Sistema Abatible Europa](/home/andres/Proyectos/glasify-lite/docs/context/extralum-pa/FT-026-Sistema-de-Ventana-Abatible-Europa.md) - Especificaciones Abatible
- **DOC-003**: [Corrediza Europa Clásica](/home/andres/Proyectos/glasify-lite/docs/context/extralum-pa/Corrediza-Europa-Clásica.md) - Especificaciones Corredizo Europa
- **DOC-004**: [Vitro Rojas - Corte](/home/andres/Proyectos/glasify-lite/docs/context/vitro-rojas/Vitro%20Rojas%20S.A%20-%20Corte.md) - Fórmulas de cotización

### Prisma Schema

- **SCHEMA-001**: `prisma/schema.prisma` - Modelo de datos completo
  - TenantConfig (singleton)
  - ProfileSupplier (fabricantes de perfiles)
  - GlassSupplier (proveedores de cristal)
  - GlassCharacteristic (características técnicas)
  - GlassSolution (soluciones de cristal)
  - GlassType (tipos específicos de cristal)
  - Model (modelos de ventanas/puertas)
  - Service (servicios adicionales)

### Factories Existentes

- **FACTORY-001**: `prisma/factories/model.factory.ts` - Validación de modelos
- **FACTORY-002**: `prisma/factories/glass-type.factory.ts` - Validación de tipos de cristal
- **FACTORY-003**: `prisma/factories/service.factory.ts` - Validación de servicios
- **FACTORY-004**: `prisma/factories/glass-solution.factory.ts` - Validación de soluciones
- **FACTORY-005**: `prisma/factories/profile-supplier.factory.ts` - Validación de proveedores de perfiles
- **FACTORY-006**: `prisma/factories/glass-supplier.factory.ts` - Validación de proveedores de cristal

### Presets de Referencia

- **PRESET-001**: `prisma/data/presets/minimal.preset.ts` - Preset básico (3 glass types, 2 models)
- **PRESET-002**: `prisma/data/presets/demo-client.preset.ts` - Preset demo completo
- **PRESET-003**: `prisma/data/presets/full-catalog.preset.ts` - Catálogo completo

### Estándares de Industria

- **STD-001**: BCP 47 Language Tags - Locales (es-PA para Panamá)
- **STD-002**: IANA Time Zone Database - Timezones (America/Panama)
- **STD-003**: ISO 4217 Currency Codes - USD para dólar estadounidense

---

## Notas de Implementación

### Orden de Ejecución Recomendado

1. **Phase 1** (TASK-001 a TASK-003): Configuración base sin dependencias
2. **Phase 2** (TASK-004 a TASK-008): GlassTypes - prerequisito para Models
3. **Phase 6** (TASK-031 a TASK-035): GlassSolutions - prerequisito para vincular GlassTypes
4. **Phase 3** (TASK-009 a TASK-016): Models Corredizos - requiere GlassTypes existentes
5. **Phase 4** (TASK-017 a TASK-022): Models Abatibles - requiere GlassTypes existentes
6. **Phase 5** (TASK-023 a TASK-030): Services - independiente
7. **Phase 7** (TASK-036 a TASK-040): Preset Integration - orquestación final
8. **Phase 8** (TASK-041 a TASK-049): Testing & Documentation - validación

### Comandos Útiles Durante Desarrollo

```bash
# Limpiar DB y ejecutar seed
pnpm db:reset
pnpm seed --preset=vitro-rojas-panama --verbose

# Abrir Prisma Studio para validar datos
pnpm db:studio

# Validar schema Prisma
pnpm prisma validate

# Ver logs de seed con detalle
pnpm seed --preset=vitro-rojas-panama --verbose 2>&1 | tee seed-log.txt
```

### Estructura de Directorios Final

```
prisma/
├── data/
│   ├── vitro-rojas/               # ← NUEVO
│   │   ├── tenant-config.data.ts
│   │   ├── profile-suppliers.data.ts
│   │   ├── glass-suppliers.data.ts
│   │   ├── glass-types.data.ts
│   │   ├── models-sliding.data.ts
│   │   ├── models-casement.data.ts
│   │   ├── services.data.ts
│   │   └── glass-solutions.data.ts
│   └── presets/
│       ├── minimal.preset.ts
│       ├── demo-client.preset.ts
│       ├── full-catalog.preset.ts
│       └── vitro-rojas-panama.preset.ts  # ← NUEVO
├── factories/
│   ├── model.factory.ts
│   ├── glass-type.factory.ts
│   ├── service.factory.ts
│   └── ... (existentes)
├── seeders/
│   └── seed-orchestrator.ts
├── seed-cli.ts                    # ← MODIFICAR
└── seed-tenant.ts

docs/
└── seeders/
    └── vitro-rojas-panama.md      # ← NUEVO
```

---

**Fecha de Próxima Revisión**: 2025-02-21 (1 mes después de implementación)

**Responsable de Mantenimiento**: Andres (@Andeveling)
