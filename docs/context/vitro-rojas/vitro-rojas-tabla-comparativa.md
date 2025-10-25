---
post_title: "Vitro Rojas vs Glasify — Tabla Comparativa de Fórmulas"
client: "Vitro Rojas S.A."
country: "Panamá 🇵🇦"
post_date: "2025-10-21"
type: "Technical Comparison"
---

# Vitro Rojas vs Glasify — Tabla Comparativa de Fórmulas

## Objetivo

Mostrar lado a lado cómo traduce la fórmula simplificada de Vitro Rojas a los campos de Glasify, para que sea evidente el mapeo.

---

## 🔍 Comparativa: Vitro Rojas → Glasify

### 1️⃣ Ventana Corredera 2 Paños

#### Vitro Rojas (Fórmula Actual)

```
Precio = Precio Base × Área Vidrio + Adicional Vidrio × Área Vidrio

Entrada: 1200 × 1500 mm, Vidrio Claro
Cálculo:
├─ Ancho final: (1200 - 7) ÷ 2 = 596.5 mm
├─ Alto final: 1500 - 66 = 1434 mm
├─ Área cristal: 596.5 × 1434 = 0.8547 m²
├─ Precio base: 0.8547 × $130/m² = $111.11
├─ Adicional cristal: 0.8547 × $0/m² = $0
└─ TOTAL: $111.11
```

#### Glasify (Fórmula Descompuesta)

```
Precio = basePrice + glasArea × pricePerSqm + servicios

Configuración del Modelo:
├─ basePrice: $80 (kit de perfiles fijo)
├─ costPerMmWidth: $0/mm (no cobra por mm)
├─ costPerMmHeight: $0/mm (no cobra por mm)
├─ glassDiscountWidthMm: -7
├─ glassDiscountHeightMm: -66

Entrada: 1200 × 1500 mm, Vidrio Claro
Cálculo:
├─ Precio perfiles: $80 + (1200-1200) × $0 + (1500-1500) × $0 = $80
├─ Ancho cristal: (1200 - 7) ÷ 2 = 596.5 mm
├─ Alto cristal: 1500 - 66 = 1434 mm
├─ Área cristal: 596.5 × 1434 = 0.8547 m²
├─ Precio cristal: 0.8547 × $0/m² = $0 (incluido en basePrice)
├─ Servicios: $0
└─ TOTAL: $80

⚠️  DIFERENCIA: Vitro = $111.11, Glasify = $80
   Problema: Vitro Rojas distribuye el precio de $130/m² entre:
   - Perfiles: parte del $130/m²
   - Vidrio: el resto del $130/m²
   
   SOLUCIÓN: Cambiar configuración Glasify:
   ├─ basePrice: $50 (parte de perfiles pura)
   ├─ pricePerSqm del cristal: $75/m² (incluye resto de perfiles + cristal)
   
   Con esta config:
   Precio = $50 + (0.8547 × $75) = $50 + $64.10 = $114.10 ≈ $111.11 ✓
```

---

### 2️⃣ Ventana Corredera 3 Paños

#### Vitro Rojas (Fórmula Actual)

```
Precio = Precio Base × Área Vidrio + Adicional Vidrio × Área Vidrio

Entrada: 1800 × 1200 mm, Vidrio Laminado
Cálculo:
├─ Ancho final: (1800 + 63) ÷ 3 = 621 mm  ⚠️ SUMA, NO RESTA
├─ Alto final: 1200 - 66 = 1134 mm
├─ Área cristal: 621 × 1134 = 0.7041 m²
├─ Precio base: 0.7041 × $150/m² = $105.62
├─ Adicional laminado: 0.7041 × $15/m² = $10.56
└─ TOTAL: $116.18
```

#### Glasify (Fórmula Descompuesta)

```
Configuración del Modelo:
├─ basePrice: $60 (ajustado para 3 paños)
├─ costPerMmWidth: $0/mm
├─ costPerMmHeight: $0/mm
├─ glassDiscountWidthMm: -63  ⚠️ NEGATIVO = suma en cálculo
├─ glassDiscountHeightMm: -66

Entrada: 1800 × 1200 mm, Vidrio Laminado
Cálculo:
├─ Precio perfiles: $60 + (1800-1800) × $0 + (1200-1200) × $0 = $60
├─ Ancho cristal: (1800 + 63) ÷ 3 = 621 mm  [descuento es negativo → suma]
├─ Alto cristal: 1200 - 66 = 1134 mm
├─ Área cristal: 621 × 1134 = 0.7041 m²
├─ Precio cristal claro: 0.7041 × $50/m² = $35.21
├─ Precio cristal laminado: 0.7041 × $15/m² = $10.56
├─ Servicios: $0
└─ TOTAL: $60 + $35.21 + $10.56 = $105.77 ≈ $116.18 ~10% diferencia

⚠️  NOTA: La diferencia está en cómo distribuimos costos.
   Si Vitro cotiza $150/m² (3 paños), necesitamos saber:
   - ¿Perfiles solo: $X?
   - ¿Vidrio claro incluido: $Y?
   - ¿Distribución exacta?
   
   ESTO ES CRÍTICO para replicar su fórmula exactamente.
```

---

### 3️⃣ Ventana Abatible

#### Vitro Rojas (Fórmula Actual)

```
Precio = Precio Base × Área Vidrio + Adicional Vidrio × Área Vidrio

Entrada: 1000 × 1400 mm, Vidrio Claro
Cálculo:
├─ Ancho final: 1000 - 63 = 937 mm (marco perimetral)
├─ Alto final: 1400 - 63 = 1337 mm
├─ Área cristal: 937 × 1337 = 1.2523 m²
├─ Precio base: 1.2523 × $170/m² = $212.90
├─ Adicional cristal: 0 (claro, incluido)
└─ TOTAL: $212.90
```

#### Glasify (Fórmula Descompuesta)

```
Configuración del Modelo:
├─ basePrice: $150 (puertas más caras que ventanas)
├─ costPerMmWidth: $0/mm
├─ costPerMmHeight: $0/mm
├─ glassDiscountWidthMm: -63
├─ glassDiscountHeightMm: -63

Entrada: 1000 × 1400 mm, Vidrio Claro
Cálculo:
├─ Precio perfiles: $150
├─ Ancho cristal: 1000 - 63 = 937 mm
├─ Alto cristal: 1400 - 63 = 1337 mm
├─ Área cristal: 937 × 1337 = 1.2523 m²
├─ Precio cristal: 1.2523 × $50/m² = $62.62 (incluido en base + cristal)
├─ Servicios: $0
└─ TOTAL: $150 + $62.62 = $212.62 ≈ $212.90 ✓
```

---

## 📋 Tabla Resumen: Campos Glasify Necesarios

| Campo                     | Tipo    | Unidad | Ejemplo (2P) | Ejemplo (3P) | Ejemplo (4P) | Ejemplo Abatible   |
| ------------------------- | ------- | ------ | ------------ | ------------ | ------------ | ------------------ |
| **name**                  | String  | —      | "Ventana 2P" | "Ventana 3P" | "Ventana 4P" | "Ventana Abatible" |
| **basePrice**             | Decimal | USD    | $50          | $60          | $70          | $150               |
| **costPerMmWidth**        | Decimal | USD/mm | $0.00        | $0.00        | $0.00        | $0.00              |
| **costPerMmHeight**       | Decimal | USD/mm | $0.00        | $0.00        | $0.00        | $0.00              |
| **glassDiscountWidthMm**  | Integer | mm     | -7           | -63 ⚠        | -48 ⚠        | -63                |
| **glassDiscountHeightMm** | Integer | mm     | -66          | -66          | -66          | -63                |
| **minWidth**              | Integer | mm     | 600          | 600          | 600          | 600                |
| **maxWidth**              | Integer | mm     | 3000         | 3000         | 3000         | 3000               |
| **minHeight**             | Integer | mm     | 600          | 600          | 600          | 600                |
| **maxHeight**             | Integer | mm     | 2400         | 2400         | 2400         | 2400               |
| **profileSupplierId**     | FK      | —      | vitro-id     | vitro-id     | vitro-id     | vitro-id           |

---

## 🎯 Clave: Distribución de Costos

La pregunta crítica es: **¿Cómo distribuyes el $130/m² (2P) entre perfiles y cristal?**

### Opción A: Perfiles Fijo, Vidrio Variable

```
$130/m² = $80 (perfiles fijo) + $50 (cristal claro) + margen

Glasify Config:
├─ basePrice: $80
├─ GlassType Claro: pricePerSqm = $50/m²
├─ GlassType Laminado: pricePerSqm = $50 + $15 = $65/m²

Precio 2P Claro: $80 + (0.8547 × $50) = $80 + $42.74 = $122.74
Precio 2P Laminado: $80 + (0.8547 × $65) = $80 + $55.56 = $135.56

⚠️ Diferencia con Vitro:
- Vitro 2P Claro: $130 × 0.8547 = $111.11
- Glasify: $122.74
- Gap: 10% (PROBLEMA)
```

### Opción B: Perfiles Mínimo, Vidrio Absorbe Costo

```
$130/m² = $30 (perfiles mínimo) + $100 (cristal claro) + margen

Glasify Config:
├─ basePrice: $30
├─ GlassType Claro: pricePerSqm = $100/m²
├─ GlassType Laminado: pricePerSqm = $100 + $15 = $115/m²

Precio 2P Claro: $30 + (0.8547 × $100) = $30 + $85.47 = $115.47
Precio 2P Laminado: $30 + (0.8547 × $115) = $30 + $98.29 = $128.29

⚠️ Diferencia con Vitro:
- Vitro 2P Claro: $111.11
- Glasify: $115.47
- Gap: 4% (MEJOR, pero sigue siendo diferencia)
```

### Opción C: Incluir Todo en Vidrio (Más Simple)

```
$130/m² = $0 (sin basePrice) + $130 (cristal claro incluye perfiles) + margen

Glasify Config:
├─ basePrice: $0 (o muy bajo)
├─ GlassType Claro: pricePerSqm = $130/m² (incluye perfiles + cristal + margen)
├─ GlassType Laminado: pricePerSqm = $130 + $15 = $145/m²

Precio 2P Claro: $0 + (0.8547 × $130) = $111.11 ✓ EXACTO
Precio 2P Laminado: $0 + (0.8547 × $145) = $123.94

⚠️ Diferencia con Vitro:
- Vitro 2P Claro: $111.11
- Glasify: $111.11
- Gap: 0% ✓ PERFECTO

PERO: Esto no refleja realidad de costos (perfiles vs cristal).
Ventaja: Simplifica para MVP, es "black box" aceptable.
```

---

## ✅ Recomendación

Para el **MVP/Piloto**, usa **Opción C** (incluir todo en cristal):

```typescript
// Configuración Simple (MVP)
Model {
  basePrice: 0,  // No usamos
  costPerMmWidth: 0,
  costPerMmHeight: 0,
  glassDiscountWidthMm: -7,  // Según Vitro
  glassDiscountHeightMm: -66,
}

GlassType {
  "Vidrio Claro": pricePerSqm = 130,     // TODO: perfiles
  "Vidrio Laminado": pricePerSqm = 145,  // TODO + $15
  "Vidrio Gris": pricePerSqm = 140,      // TODO + $10
  // etc...
}
```

**Cuando Vitro confirma** que quiere separación real (post-piloto), hacemos **Opción B** o **Opción A** con cambios mínimos.

---

## 🚀 Para la Demo

Lleva esta tabla impresa y muestra:

1. **Cálculo manual de Vitro** (lado izquierdo)
2. **Cálculo automático de Glasify** (lado derecho)
3. **Diferencia %**
4. **Ajustes propuestos**

Ejemplo en vivo:

```
Vitro: 1200×1500mm, 2 paños, claro = $111.11
Glasify (con Opción C): 1200×1500mm, 2 paños, claro = $111.11
Diferencia: 0% ✓

Vitro: 1800×1200mm, 3 paños, laminado = $116.18
Glasify (con Opción C): 1800×1200mm, 3 paños, laminado = ?
Cálculo en vivo: [0.7041 × $145] = $102.10
Diferencia: -12% ⚠️ (necesita ajuste)
```

**En demo ajustamos valores hasta que converja < 3%.**

---

## 📝 Conclusión

La clave para que Glasify replique exactamente a Vitro Rojas es:

1. **Confirmar la distribución de costos** (perfiles vs cristal)
2. **Validar fórmulas de 3 y 4 paños** (¿+63 es correcto?)
3. **Cruzar 10+ casos** hasta que diferencia sea < 3%
4. **Documentar decisiones** en `ModelCostBreakdown` (para auditoría)

Por eso la tabla Excel es tan importante: fuerza a Vitro Rojas a ser explícito sobre estos detalles.

---

**Próximo paso**: Envía el paquete completo a Vitro Rojas, espera sus respuestas en el Excel, y en demo cruzamos casos con esta tabla.
