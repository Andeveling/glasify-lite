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

- **GlassSuppliers**: 2 proveedores
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
  - Uso General, Seguridad, Aislamiento Térmico, Decorativo

## Estructura de Archivos

```
prisma/data/vitro-rojas/
├── tenant-config.data.ts       # Configuración de negocio
├── profile-suppliers.data.ts   # Extralum (aluminio)
├── glass-suppliers.data.ts     # Proveedores de vidrio
├── glass-types.data.ts         # 11 tipos de vidrio
├── glass-solutions.data.ts     # 4 soluciones
├── models-sliding.data.ts      # 6 modelos corredizos
├── models-casement.data.ts     # 3 modelos abatibles
└── services.data.ts            # 5 servicios

prisma/data/presets/
└── vitro-rojas-panama.preset.ts  # Preset principal
```

## Características del Sistema de Precios

### Precios Base (USD/m²)

| Sistema          | 2 Paños | 3 Paños | 4 Paños |
|-----------------|---------|---------|---------|
| Corredizo VC     | $130    | $150    | $165    |
| Corredizo Europa | $140    | $160    | $175    |
| Abatible Europa  | $130    | $150    | $170    |

### Adicionales por Tipo de Vidrio

| Tipo             | Adicional (USD/m²) |
|-----------------|-------------------|
| Claro           | Incluido          |
| Laminado        | +$15             |
| Gris/Bronce     | +$10             |
| Reflectivo      | +$15             |
| Laminado Gris/Bronce | +$18        |

## Restricciones de Dimensiones

### Sistema Corredizo VC Panamá
- Ancho móvil: 250-1350mm
- Alto móvil: 272-1850mm

### Sistema Corredizo Europa Clásica
- Ancho móvil: 402-1600mm
- Alto móvil: 320-2800mm

### Sistema Abatible Europa
- Ancho hoja móvil: 478-1050mm
- Alto hoja móvil: 478-2000mm

## Related pages

- [[prd]]
- [[tech-stack]]
- [[entities]]
