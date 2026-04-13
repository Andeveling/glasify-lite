---
title: Preset Vitro Rojas S.A. - Panamá
description: Documentación del preset de datos para Vitro Rojas, fabricante de ventanas de aluminio en Panamá
version: 1.0.0
date: 2025-01-21
author: Andres
---

# Preset Vitro Rojas S.A. - Panamá

**Summary**: Cliente Vitro Rojas S.A. (Panamá) — fabricante de ventanas de aluminio single-tenant.

**Sources**: `(source: raw/seeders/vitro-rojas-panama.md)`

**Last updated**: 2026-04-13

---

## Sistema de Precios

### Cómo funciona el pricing real dentro de Glasify

```
profileCost = basePrice 
            + (costPerMmWidth × extraWidthMm) 
            + (costPerMmHeight × extraHeightMm)

extraWidthMm = max(widthMm - minWidthMm, 0)
extraHeightMm = max(heightMm - minHeightMm, 0)
```

**NO es precio por m².** El sistema usa:
- `basePrice`: precio mínimo (válido para dimensiones mínimas)
- `costPerMmWidth`: costo adicional por cada mm de ancho超越 mínimo
- `costPerMmHeight`: costo adicional por cada mm de alto超越 mínimo
- `pricePerSqm`: precio del vidrio por m² (con descuentos de vidrio)

### Componentes del precio

| Componente | Descripción | Afectado por color? |
|-----------|-------------|---------------------|
| Profile cost | basePrice + dimension costs | Sí |
| Glass cost | (area efectiva m²) × pricePerSqm | No |
| Accessory cost | precio fijo de accesorios | Sí |
| Services | area/perimeter/fixed | No |
| Adjustments | recargos/descuentos | No |

## Información General

**Cliente**: Vitro Rojas S.A.  
**País**: Panamá  
**Industria**: Fabricación e instalación de ventanas y puertas de aluminio  
**Mercado**: Residencial y comercial  
**Arquitectura**: Single-Tenant (instancia dedicada)

## Configuración

### TenantConfig
- Business Name: "Vitro Rojas S.A."
- Currency: USD
- Locale: es-PA
- Timezone: America/Panama
- Quote Validity: 15 días

### Proveedores
- **ProfileSuppliers**: Extralum (aluminio)
- **GlassSuppliers**: Vidriera Nacional S.A., Guardian Glass Panamá

## Estructura de Archivos

```
prisma/data/vitro-rojas/
├── tenant-config.data.ts
├── profile-suppliers.data.ts
├── glass-suppliers.data.ts
├── glass-types.data.ts
├── glass-solutions.data.ts
├── models-sliding.data.ts
├── models-casement.data.ts
└── services.data.ts

prisma/data/presets/
└── vitro-rojas-panama.preset.ts
```

## Related pages

- [[prd]]
- [[pricing-formula]]
- [[entities]]
