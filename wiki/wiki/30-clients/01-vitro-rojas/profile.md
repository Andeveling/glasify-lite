---
title: Vitro Rojas S.A. - Perfil de Cliente
description: Perfil completo del cliente Vitro Rojas S.A., fabricante de ventanas y puertas de aluminio en Panamá
version: 1.0.0
date: 2026-04-13
author: Glasify Team
---

# Vitro Rojas S.A. - Perfil de Cliente

**Summary**: Vitro Rojas S.A. es una PYME dedicada a la fabricación e instalación de ventanas y puertas de aluminio en Ciudad de Panamá. Cliente single-tenant para Glasify Lite con catálogo de 9 modelos (6 corredizos + 3 abatibles) y pricing en USD.

**Sources**: `(source: prisma/data/clients/vitro-rojas/)`

**Last updated**: 2026-04-13

---

## Identificación

| Campo | Valor |
|-------|-------|
| **Nombre legal** | Vitro Rojas S.A. |
| **País** | Panamá |
| **Ciudad** | Ciudad de Panamá |
| **Industria** | Fabricación e instalación de productos de aluminio y vidrio |
| **Mercado** | Residencial y comercial |
| **Moneda** | USD (dólar estadounidense — moneda oficial de Panamá) |
| **Locale** | es-PA |
| **Zona horaria** | America/Panama (UTC-5, sin DST) |
| **Arquitectura** | Single-tenant (instancia dedicada Glasify) |

---

## Contacto

| Canal | Valor |
|-------|-------|
| **Email** | ventas@vitrorojas.com |
| **Teléfono** | +507-123-4567 |
| **Dirección** | Ciudad de Panamá, Panamá |

---

## Negocio

### Descripción General

Vitro Rojas es un fabricante e instalador de ventanas y puertas de aluminio con presencia en el mercado panameño. Su propuesta de valor combina productos de aluminio extrusionado (proveedor Extralum) con soluciones de vidrio para el segmento residencial y comercial.

### Sitio web y canales

- Web principal: https://www.vitrorojas.com/
- Servicios: https://www.vitrorojas.com/servicios
- Tienda: https://www.vitrorojas.com/shop
- Puertas y ventanas: https://www.vitrorojas.com/puertas-y-ventanas
- Espejos a la medida: https://www.vitrorojas.com/espejos-a-la-medida
- Vidrio templado: https://www.vitrorojas.com/vidrio-templado

### Productos y Servicios

#### Sistemas de Ventanas (Catálogo Glasify)

**Corredizos** (6 modelos):

| Modelo | Sistema | Paños | basePrice USD | accessoryPrice USD | Margen |
|--------|---------|-------|---------------|--------------------|--------|
| VC Panamá 2 Paños (OX) | VC Serie 100/400 | 2 | $130 | $45 | 35% |
| VC Panamá 3 Paños (XOX) | VC Serie 100/400 | 3 | $150 | $65 | 35% |
| VC Panamá 4 Paños (OXXO) | VC Serie 100/400 | 4 | $165 | $85 | 35% |
| Europa Clásica 2 Paños (OX) | EX-1289/1379/1399/1401 | 2 | $140 | $55 | 38% |
| Europa Clásica 3 Paños (XOX) | EX-1289/1379/1399/1401 | 3 | $160 | $75 | 38% |
| Europa Clásica 4 Paños (OXXO) | EX-1289/1379/1399/1401 | 4 | $175 | $95 | 38% |

**Abatibles** (3 modelos):

| Modelo | Hojas | basePrice USD | accessoryPrice USD | Margen |
|--------|-------|---------------|--------------------|--------|
| Abatible Europa 2 Hojas (OX) | 2 | $130 | $85 | 40% |
| Abatible Europa 3 Hojas (XOX) | 3 | $150 | $125 | 40% |
| Abatible Europa 4 Hojas (XXOO) | 4 | $170 | $165 | 42% |

> **Nota**: `basePrice` es el **costo mínimo facturable del perfil** para dimensiones `(minWidthMm × minHeightMm)`. No es un precio por m². El precio final se calcula con la fórmula de [[pricing-formula]].

#### Productos Complementarios (sitio web)

- Espejos a la medida
- Vidrio templado
- Puertas y ventanas (línea completa)
- Shop (productos terminados)

---

## Proveedores

### Perfiles de Aluminio

- **Extralum** (proveedor principal)
  - Catálogos: VC Panamá (Serie 100/400), Europa Clásica, Abatible Europa
  - Origen: Costa Rica (presencia en Panamá)
  - Perfiles con espesores 1.10-1.70mm

### Vidrios

- **Vidriera Nacional S.A.**
- **Guardian Glass Panamá**

### Tipos de Vidrio Compatibles

| Tipo | Espesores | Aplicación |
|------|-----------|------------|
| Vidrio simple | 6-12mm | Estándar |
| Laminado | 33.1mm | Seguridad |
| DVH (Doble Vidrio al Vacío) | 12.5-18.5mm | Aislamiento térmico/acústico |

---

## Configuración de Negocio en Glasify

### TenantConfig

```typescript
{
  businessName: "Vitro Rojas S.A.",
  currency: "USD",
  locale: "es-PA",
  timezone: "America/Panama",
  quoteValidityDays: 15,
  contactEmail: "ventas@vitrorojas.com",
  contactPhone: "+507-123-4567",
  businessAddress: "Ciudad de Panamá, Panamá",
}
```

### Reglas de Cotización

- **Validez de cotización**: 15 días
- **Moneda**: USD (sin conversión — Panamá usa USD)
- **ITBMS (IVA Panamá)**: 7% — no incluido en configuración base del sistema
- **Fórmulas de corte de vidrio**:
  - Corredizo: `Alto = H - 66mm`
  - Abatible: `Alto = H - 63mm`, `Ancho = W - 63mm`
  - Descuentos de ancho por paño varían según configuración (2, 3 o 4 paños)

---

## Related pages

- [[30-clients/01-vitro-rojas/presets]] — Preset de seeding y configuración de datos
- [[prd]] — Product Requirements Document
- [[entities]] — Entidades del sistema
- [[tech-stack]] — Stack tecnológico de Glasify Lite
