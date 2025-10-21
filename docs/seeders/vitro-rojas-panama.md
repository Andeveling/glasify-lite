---
title: Preset Vitro Rojas S.A. - Panamá
description: Documentación del preset de datos para Vitro Rojas, fabricante de ventanas de aluminio en Panamá
version: 1.0.0
date: 2025-01-21
author: Andres
---

# Preset Vitro Rojas S.A. - Panamá

## Información General

**Cliente**: Vitro Rojas S.A.  
**País**: Panamá  
**Industria**: Fabricación e instalación de ventanas y puertas de aluminio  
**Mercado**: Residencial y comercial  
**Arquitectura**: Single-Tenant (instancia dedicada)

## Contenido del Preset

### Datos de Configuración

- **TenantConfig**: 1 registro singleton
  - Business Name: "Vitro Rojas S.A."
  - Currency: USD (dólar estadounidense)
  - Locale: es-PA (español de Panamá)
  - Timezone: America/Panama (UTC-5)
  - Quote Validity: 15 días

### Proveedores

- **ProfileSuppliers**: 1 proveedor
  - Extralum (aluminio) - Distribuidor exclusivo de perfiles

- **GlassSuppliers**: 2 proveedores (configurados en seed-tenant.ts)
  - Vidriera Nacional S.A.
  - Guardian Glass Panamá

### Catálogo de Productos

- **GlassTypes**: 11 tipos de vidrio
  - General (2): Claro 6mm, Claro 8mm
  - Security (3): Laminado 6.38mm, Laminado 8.38mm, Templado 6mm
  - Insulation (2): DVH 16mm, DVH 18.5mm
  - Decorative (4): Gris 6mm, Bronce 6mm, Reflectivo 6mm, Laminado Gris 6.38mm

- **Models**: 9 modelos de ventanas
  - **Corredizos VC Panamá** (3):
    - 2 Paños (OX): $130 USD/m²
    - 3 Paños (XOX): $150 USD/m²
    - 4 Paños (OXXO): $165 USD/m²
  - **Corredizos Europa Clásica** (3):
    - 2 Paños (OX): $140 USD/m²
    - 3 Paños (XOX): $160 USD/m²
    - 4 Paños (OXXO): $175 USD/m²
  - **Abatibles Europa** (3):
    - 2 Hojas (OX): $130 USD/m²
    - 3 Hojas (XOX): $150 USD/m²
    - 4 Hojas (XXOO): $170 USD/m²

- **Services**: 5 servicios
  - Instalación de Ventanas: $15 USD/m² (area)
  - Sellado Perimetral: $3.50 USD/ml (perimeter)
  - Desmonte de Ventana Existente: $25 USD/unidad (fixed)
  - Servicio de Reposición: $35 USD/unidad (fixed)
  - Protección para Obra: $2.50 USD/m² (area)

- **GlassSolutions**: 4 soluciones
  - Uso General: Vidrio claro simple
  - Seguridad: Laminados y templados
  - Aislamiento Térmico: DVH para A/C
  - Decorativo: Tintados y reflectivos

## Fuentes de Datos

### Especificaciones Técnicas

- **Extralum Panamá - Catálogo VC Panamá**
  - Sistema corredizo económico
  - Perfiles Serie 100/400
  - Espesores: 1.10-1.52mm
  - Vidrios: 6mm simple, 33.1mm laminado

- **Extralum Panamá - FT-026 Sistema Abatible Europa**
  - Sistema abatible con bisagras
  - Perfiles con corte 45°
  - Espesores: 1.10-1.50mm
  - Vidrios: 6-12mm simple, DVH 12.5-18.5mm

- **Extralum Panamá - Sistema Corredizo Europa Clásica**
  - Sistema premium 3 vías
  - Espesores: 1.10-1.70mm
  - Vidrios: 6-12mm simple, DVH 16-18.5mm

### Sistema de Cotización

- **Vitro Rojas S.A. - Instrucciones de Corte y Presupuesto**
  - Precios base por m² según cantidad de paños
  - Adicionales por tipo de vidrio
  - Fórmulas de corte por configuración

## Estructura de Archivos

```
prisma/data/vitro-rojas/
├── tenant-config.data.ts       # Configuración de negocio (referencia)
├── profile-suppliers.data.ts   # Extralum (aluminio)
├── glass-suppliers.data.ts     # Proveedores de vidrio (referencia)
├── glass-types.data.ts         # 11 tipos de vidrio
├── glass-solutions.data.ts     # 4 soluciones
├── models-sliding.data.ts      # 6 modelos corredizos
├── models-casement.data.ts     # 3 modelos abatibles
└── services.data.ts            # 5 servicios

prisma/data/presets/
└── vitro-rojas-panama.preset.ts  # Preset principal (integración)
```

## Uso

### Instalación Inicial

```bash
# 1. Configurar variables de entorno (.env)
TENANT_BUSINESS_NAME="Vitro Rojas S.A."
TENANT_CURRENCY="USD"
TENANT_LOCALE="es-PA"
TENANT_TIMEZONE="America/Panama"
TENANT_QUOTE_VALIDITY_DAYS="15"
TENANT_CONTACT_EMAIL="ventas@vitrorojas.com"
TENANT_CONTACT_PHONE="+507-123-4567"
TENANT_BUSINESS_ADDRESS="Ciudad de Panamá, Panamá"

# 2. Ejecutar seeding
pnpm seed --preset=vitro-rojas-panama --verbose

# 3. Validar en Prisma Studio
pnpm db:studio
```

### Verificación Post-Seeding

Validar en Prisma Studio:

1. **TenantConfig** (1 registro)
   - ✅ businessName: "Vitro Rojas S.A."
   - ✅ currency: "USD"
   - ✅ locale: "es-PA"
   - ✅ timezone: "America/Panama"

2. **ProfileSupplier** (1 registro)
   - ✅ name: "Extralum"
   - ✅ materialType: "ALUMINUM"
   - ✅ isActive: true

3. **GlassType** (11 registros)
   - ✅ 2 general purpose
   - ✅ 3 security
   - ✅ 2 insulation
   - ✅ 4 decorative

4. **Model** (9 registros)
   - ✅ 6 corredizos (3 VC + 3 Europa)
   - ✅ 3 abatibles
   - ✅ Todos con profileSupplierId vinculado a Extralum

5. **Service** (5 registros)
   - ✅ 2 area (Instalación + Protección)
   - ✅ 1 perimeter (Sellado)
   - ✅ 2 fixed (Desmonte + Reposición)

6. **GlassSolution** (4 registros)
   - ✅ general_purpose
   - ✅ security
   - ✅ thermal_insulation
   - ✅ decorative

### Re-seeding (Actualización de Datos)

```bash
# El preset es idempotente (safe to run multiple times)
# Usa upsert para actualizar datos existentes

pnpm seed --preset=vitro-rojas-panama
```

## Características del Sistema de Precios

### Precios Base (USD/m²)

| Sistema | 2 Paños | 3 Paños | 4 Paños |
|---------|---------|---------|---------|
| Corredizo VC | $130 | $150 | $165 |
| Corredizo Europa | $140 | $160 | $175 |
| Abatible Europa | $130 | $150 | $170 |

### Adicionales por Tipo de Vidrio

| Tipo | Adicional (USD/m²) |
|------|-------------------|
| Claro | Incluido |
| Laminado | +$15 |
| Gris/Bronce | +$10 |
| Reflectivo | +$15 |
| Laminado Gris/Bronce | +$18 |

### Fórmulas de Corte (Vitro Rojas)

**Ventanas de 2 paños:**
- Alto vidrio = Alto total - 66mm
- Ancho vidrio = (Ancho total - 7mm) ÷ 2

**Ventanas de 3 paños:**
- Alto vidrio = Alto total - 66mm
- Ancho vidrio = (Ancho total + 63mm) ÷ 3

**Ventanas de 4 paños:**
- Alto vidrio = Alto total - 66mm
- Ancho vidrio = (Ancho total + 48mm) ÷ 4

**Marco perimetral (abatibles):**
- Alto vidrio = Alto total - 63mm
- Ancho vidrio = Ancho total - 63mm

## Restricciones de Dimensiones

### Sistema Corredizo VC Panamá

- Ancho móvil: 250-1350mm
- Alto móvil: 272-1850mm
- Ancho fijo: 250-1600mm
- Alto fijo: 272-1850mm

### Sistema Corredizo Europa Clásica

- Ancho móvil: 402-1600mm
- Alto móvil: 320-2800mm
- Ancho fijo: 402-1600mm
- Alto fijo: 320-2800mm

### Sistema Abatible Europa

- Ancho hoja móvil: 478-1050mm
- Alto hoja móvil: 478-2000mm
- Ancho hoja fija: 395-2400mm
- Alto hoja fija: 395-2800mm

## Extensión para Otros Clientes

Este preset sigue el patrón **Single-Tenant** de Glasify. Para agregar otro cliente:

### 1. Crear Estructura de Datos

```
prisma/data/nuevo-cliente/
├── profile-suppliers.data.ts
├── glass-types.data.ts
├── glass-solutions.data.ts
├── models-sliding.data.ts     # Si aplica
├── models-casement.data.ts    # Si aplica
└── services.data.ts
```

### 2. Crear Preset

```typescript
// prisma/data/presets/nuevo-cliente.preset.ts
import type { SeedPreset } from '../../seeders/seed-orchestrator';
import { nuevoClienteGlassTypes } from '../nuevo-cliente/glass-types.data';
// ... otros imports

export const nuevoClientePreset: SeedPreset = {
  name: 'nuevo-cliente',
  description: 'Descripción del cliente',
  profileSuppliers: [...],
  glassTypes: [...],
  glassSolutions: [...],
  models: [...],
  services: [...],
};
```

### 3. Registrar en CLI

```typescript
// prisma/seed-cli.ts
import { nuevoClientePreset } from './data/presets/nuevo-cliente.preset';

const PRESETS: Record<string, SeedPreset> = {
  // ... existing
  'nuevo-cliente': nuevoClientePreset,
};
```

### 4. Configurar Variables de Entorno

```bash
# .env (instancia del nuevo cliente)
TENANT_BUSINESS_NAME="Nuevo Cliente S.A."
TENANT_CURRENCY="COP"  # O USD, según país
TENANT_LOCALE="es-CO"  # O es-PA, es-MX, etc.
TENANT_TIMEZONE="America/Bogota"  # Según país
# ... otros TENANT_*
```

### 5. Ejecutar Seeding

```bash
pnpm seed --preset=nuevo-cliente
```

## Ventajas del Patrón Single-Tenant

✅ **Aislamiento Completo**: Datos de clientes nunca se mezclan  
✅ **Simplicidad**: No requiere lógica de multi-tenancy  
✅ **Seguridad**: Imposible data leak entre clientes  
✅ **Flexibilidad**: Cada cliente puede tener versión/features diferentes  
✅ **Escalabilidad**: Agregar clientes no afecta a existentes  

## Soporte y Mantenimiento

### Actualizar Precios

Modificar archivos en `prisma/data/vitro-rojas/` y re-ejecutar:

```bash
pnpm seed --preset=vitro-rojas-panama
```

### Agregar Nuevos Modelos

1. Agregar modelo en `models-sliding.data.ts` o `models-casement.data.ts`
2. Vincular `compatibleGlassTypeIds` (se resuelven automáticamente por nombre)
3. Re-ejecutar seeding

### Agregar Nuevos Tipos de Vidrio

1. Agregar tipo en `glass-types.data.ts`
2. Asignar `purpose` correcto (general, security, insulation, decorative)
3. Re-ejecutar seeding

## Contacto

Para soporte técnico o consultas sobre este preset:

**Desarrollador**: Andres  
**Repositorio**: glasify-lite  
**Branch**: 012-simplify-profile-suppliers  
**Fecha de Creación**: 2025-01-21

---

**Versión**: 1.0.0  
**Última Actualización**: 2025-01-21
