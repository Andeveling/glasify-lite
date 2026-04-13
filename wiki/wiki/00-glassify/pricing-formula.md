# Pricing Formula

**Summary**: Fórmula de cálculo de precio por ítem — perfil + vidrio + servicios.

**Sources**: (source: internal)

**Last updated**: 2026-04-13

---

## Fórmula de Precio por Ítem

Dado un modelo con:
- Dimensiones mínimas: `minWidthMm`, `minHeightMm`
- Precio base: `basePrice`
- Costos por mm: `costPerMmWidth`, `costPerMmHeight`
- Descuentos de vidrio: `glassDiscountWidthMm`, `glassDiscountHeightMm`

Para dimensiones `widthMm` × `heightMm`:

### 1. Precio del Perfil

```
deltaWidth = max(0, widthMm - minWidthMm)
deltaHeight = max(0, heightMm - minHeightMm)

ProfilePrice = basePrice + (costPerMmWidth × deltaWidth) + (costPerMmHeight × deltaHeight)
```

### 2. Precio del Vidrio (con Descuento)

```
effectiveWidthMm = widthMm - glassDiscountWidthMm
effectiveHeightMm = heightMm - glassDiscountHeightMm
glassAreaM2 = (effectiveWidthMm / 1000) × (effectiveHeightMm / 1000)

GlassPrice = pricePerSqm × glassAreaM2
```

**Validación**: `effectiveWidthMm > 0` y `effectiveHeightMm > 0`

### 3. Servicios Adicionales

```
Por área (m²):     areaM2 = (widthMm / 1000) × (heightMm / 1000)
                   price = rate × areaM2

Por perímetro (m): perimeterM = 2 × ((widthMm / 1000) + (heightMm / 1000))
                   price = rate × perimeterM

Precio fijo:       price = amount
```

### 4. Subtotal del Ítem

```
Subtotal = ProfilePrice + GlassPrice + AccessoryPrice + ServicesPrice
```

### 5. Total de la Cotización

```
Total = Σ(subtotal_ítems) + Σ(ajustes)
```

## Ejemplo Numérico

**Modelo**: Ventana corrediza PVC
- `minWidthMm = 600`, `maxWidthMm = 2000`
- `minHeightMm = 400`, `maxHeightMm = 2400`
- `basePrice = 120 USD`
- `costPerMmWidth = 0.05 USD/mm`
- `costPerMmHeight = 0.04 USD/mm`
- `glassDiscountWidthMm = 30`, `glassDiscountHeightMm = 30`

**Dimensiones solicitadas**: `widthMm = 900`, `heightMm = 700`

**Cálculo:**
1. Profile: `120 + (0.05 × 300) + (0.04 × 300) = 147 USD`
2. Glass: `(870 × 670) / 1,000,000 × 35 = 20.40 USD`
3. Subtotal: `147 + 20.40 = 167.40 USD`

## Validaciones

- Dimensiones: `minWidthMm ≤ widthMm ≤ maxWidthMm`
- Vidrio: debe estar en `compatibleGlassTypeIds` del modelo
- Área efectiva: `(widthMm - glassDiscountW) > 0`

## Related pages

- [[entities]]
- [[prd]]
