# Cálculo de Precio Final del Producto

**Última actualización**: 2025-11-05  
**Contexto**: Formulario de cotización en `/catalog/[modelId]`  
**Archivo principal**: `src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx`

---

## Resumen Ejecutivo

El sistema calcula el precio final del producto en tiempo real mientras el usuario configura las dimensiones, tipo de vidrio, color y servicios adicionales. El cálculo se ejecuta en el servidor mediante tRPC con un debounce de 300ms para optimizar rendimiento, y retorna un desglose detallado de todos los componentes del precio.

**Flujo de datos**:
```
Usuario modifica formulario
  ↓ (300ms debounce)
Hook usePriceCalculation valida dimensiones
  ↓ (si válido)
tRPC: quote.calculate-item
  ↓
Server: calculatePriceItem()
  ↓
Retorna: { dimPrice, accPrice, services, adjustments, subtotal }
  ↓
UI: Actualiza precio y desglose en tiempo real
```

---

## 1. Componentes del Precio Final

El precio final (`subtotal`) se compone de:

1. **Precio del Modelo (`dimPrice`)**:
   - Precio base del modelo (`basePrice`)
   - Costo por dimensiones (ancho y alto)
   - Costo del vidrio (área facturable × precio por m²)
   - **Recargo por color** (se aplica SOLO a perfil, NO a vidrio)

2. **Precio de Accesorios (`accPrice`)**:
   - Precio fijo de accesorios del modelo
   - **Recargo por color** (se aplica también a accesorios)

3. **Servicios Adicionales (`services[]`)**:
   - Servicios tipo "fijos" (cantidad = 1 o override)
   - Servicios tipo "área" (cantidad = m² de vidrio)
   - Servicios tipo "perímetro" (cantidad = metros lineales)
   - **NO se aplica recargo por color**

4. **Ajustes (`adjustments[]`)**:
   - Descuentos o recargos especiales
   - Pueden ser positivos o negativos

**Fórmula final**:
```
SUBTOTAL = dimPrice + accPrice + sum(services) + sum(adjustments)
```

---

## 2. Flujo de Cálculo en el Cliente

### 2.1 Hook Principal: `usePriceCalculation`

**Archivo**: `src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts`

**Responsabilidades**:
- Validar dimensiones contra límites del modelo
- Debounce de 300ms para evitar llamadas excesivas al API
- Llamar a tRPC `quote.calculate-item`
- Manejar estados: `isCalculating`, `error`, `calculatedPrice`, `breakdown`

**Parámetros de entrada**:
```typescript
{
  modelId: string;
  glassTypeId: string;
  widthMm: number;
  heightMm: number;
  minWidthMm?: number;  // Para validación client-side
  maxWidthMm?: number;
  minHeightMm?: number;
  maxHeightMm?: number;
  additionalServices: string[];  // Array de service IDs
  colorSurchargePercentage?: number;  // 0-100
}
```

**Validaciones client-side** (antes de llamar al API):
1. ✅ Verificar que todos los campos requeridos estén presentes
2. ✅ Verificar que dimensiones > 0
3. ✅ Verificar que dimensiones estén dentro del rango permitido
4. ❌ Si falla validación → No llama al API, muestra error

**Output**:
```typescript
{
  calculatedPrice: number | undefined;  // Precio final
  breakdown: PriceItemCalculationResult | undefined;  // Desglose detallado
  error: string | undefined;  // Mensaje de error user-friendly
  isCalculating: boolean;  // Estado de carga
}
```

### 2.2 Cálculo de Área de Vidrio: `useGlassArea`

**Archivo**: `src/app/(public)/catalog/[modelId]/_hooks/use-glass-area.ts`

**Propósito**: Calcular el área facturable del vidrio aplicando descuentos por perfil.

**Fórmula**:
```typescript
// Dimensiones efectivas (restando espacio ocupado por perfiles)
effectiveWidthMm = max(widthMm - glassDiscountWidthMm, 0)
effectiveHeightMm = max(heightMm - glassDiscountHeightMm, 0)

// Conversión a metros
widthM = effectiveWidthMm / 1000
heightM = effectiveHeightMm / 1000

// Área facturable
glassArea = widthM × heightM  // en m²
```

**Ejemplo**:
```
Dimensiones del usuario: 1000mm × 2000mm
Descuentos de perfil: 50mm × 50mm

Dimensiones efectivas: 950mm × 1950mm = 0.95m × 1.95m
Área facturable: 1.8525 m²
```

### 2.3 Desglose Detallado: `usePriceBreakdown`

**Archivo**: `src/app/(public)/catalog/[modelId]/_hooks/use-price-breakdown.ts`

**Propósito**: Transformar el resultado del cálculo en items legibles para mostrar al usuario.

**Formato de salida**:
```typescript
type PriceBreakdownItem = {
  category: "model" | "glass" | "service" | "adjustment" | "color";
  label: string;  // Texto descriptivo en español
  amount: number;  // Monto en USD
}
```

**Ejemplo de desglose**:
```typescript
[
  { category: "model", label: "Precio base del modelo", amount: 800 },
  { category: "glass", label: "Vidrio Templado (1.85 m²)", amount: 148 },
  { category: "color", label: "Recargo de color (+10%)", amount: 80 },
  { category: "model", label: "Accesorios", amount: 50 },
  { category: "service", label: "Instalación", amount: 100 }
]
```

---

## 3. Flujo de Cálculo en el Servidor

### 3.1 Procedimiento tRPC: `quote.calculate-item`

**Archivo**: `src/server/api/routers/quote/quote.ts`

**Parámetros de entrada** (validados con Zod):
```typescript
{
  modelId: string;
  glassTypeId: string;
  widthMm: number;  // Validado: min 1, max 10000
  heightMm: number;
  services?: { serviceId: string }[];
  adjustments?: { concept, unit, sign, value }[];
  colorSurchargePercentage?: number;  // 0-100
}
```

**Proceso**:
1. Buscar modelo en DB (con precios, dimensiones, descuentos)
2. Validar dimensiones contra límites del modelo
3. Buscar tipo de vidrio y verificar compatibilidad
4. Buscar servicios adicionales en DB
5. Preparar datos para `calculatePriceItem()`
6. Ejecutar cálculo
7. Retornar resultado con desglose

### 3.2 Función Core: `calculatePriceItem()`

**Archivo**: `src/server/price/price-item.ts`

**Este es el corazón del sistema de pricing**. Implementa toda la lógica de cálculo usando `Decimal.js` para precisión financiera.

#### Paso 1: Convertir dimensiones a metros
```typescript
const widthMm = ensurePositiveNumber(input.widthMm);
const heightMm = ensurePositiveNumber(input.heightMm);
const widthMeters = mmToMeters(widthMm);  // widthMm / 1000
const heightMeters = mmToMeters(heightMm);
```

#### Paso 2: Calcular costo de perfil (SIN recargo de color)
```typescript
const basePrice = toDecimal(input.model.basePrice);
const widthCost = toDecimal(input.model.costPerMmWidth).mul(widthMm);
const heightCost = toDecimal(input.model.costPerMmHeight).mul(heightMm);

const profileCostBeforeColor = basePrice.plus(widthCost).plus(heightCost);
```

**Ejemplo**:
```
basePrice = $800
costPerMmWidth = $0.50
costPerMmHeight = $0.30
widthMm = 1000
heightMm = 2000

widthCost = $0.50 × 1000 = $500
heightCost = $0.30 × 2000 = $600
profileCostBeforeColor = $800 + $500 + $600 = $1,900
```

#### Paso 3: Aplicar recargo por color al perfil
```typescript
const colorSurchargePercentage = input.colorSurchargePercentage ?? 0;
const colorSurchargeMultiplier = new Decimal(1).plus(
  new Decimal(colorSurchargePercentage).dividedBy(100)
);
const profileCostWithColor = profileCostBeforeColor.mul(colorSurchargeMultiplier);
const colorSurchargeAmount = profileCostWithColor.minus(profileCostBeforeColor);
```

**Ejemplo** (con 10% de recargo):
```
colorSurchargePercentage = 10
colorSurchargeMultiplier = 1 + (10 / 100) = 1.10
profileCostWithColor = $1,900 × 1.10 = $2,090
colorSurchargeAmount = $2,090 - $1,900 = $190
```

#### Paso 4: Calcular costo de vidrio (NO afectado por color)
```typescript
if (input.glass && toDecimal(input.glass.pricePerSqm).greaterThan(0)) {
  const dW = Math.max(input.glass.discountWidthMm ?? 0, 0);
  const dH = Math.max(input.glass.discountHeightMm ?? 0, 0);
  const effWidthMm = Math.max(widthMm - dW, 0);
  const effHeightMm = Math.max(heightMm - dH, 0);
  const effWidthM = mmToMeters(effWidthMm);
  const effHeightM = mmToMeters(effHeightMm);
  const areaSqm = effWidthM.mul(effHeightM);
  glassPriceDecimal = roundHalfUp(
    toDecimal(input.glass.pricePerSqm).mul(areaSqm)
  );
}
```

**Ejemplo**:
```
pricePerSqm = $80
discountWidthMm = 50mm
discountHeightMm = 50mm
widthMm = 1000mm
heightMm = 2000mm

effWidthMm = 1000 - 50 = 950mm = 0.95m
effHeightMm = 2000 - 50 = 1950mm = 1.95m
areaSqm = 0.95 × 1.95 = 1.8525 m²
glassPrice = $80 × 1.8525 = $148.20
```

#### Paso 5: Calcular `dimPrice` (perfil + vidrio)
```typescript
const rawDimPrice = profileCostWithColor.plus(glassPriceDecimal);
const dimPriceDecimal = roundHalfUp(rawDimPrice);
```

**Ejemplo**:
```
dimPrice = $2,090 (perfil con color) + $148.20 (vidrio) = $2,238.20
```

#### Paso 6: Calcular precio de accesorios (CON recargo de color)
```typescript
const includeAccessory = Boolean(input.includeAccessory);
const rawAccessoryPrice = includeAccessory
  ? toDecimal(input.model.accessoryPrice)
  : new Decimal(0);
const accessoryWithColor = rawAccessoryPrice.mul(colorSurchargeMultiplier);
const accPriceDecimal = roundHalfUp(accessoryWithColor);
```

**Ejemplo** (con accPrice = $50, color 10%):
```
accessoryPrice = $50
colorSurchargeMultiplier = 1.10
accPrice = $50 × 1.10 = $55
```

#### Paso 7: Calcular servicios adicionales
```typescript
for (const service of input.services) {
  const rate = toDecimal(service.rate);
  const quantityDecimal = computeServiceQuantity(service, dimensions);
  const amountDecimal = roundHalfUp(rate.mul(quantityDecimal));
  servicesTotal = servicesTotal.plus(amountDecimal);
}
```

**Tipos de servicios**:

**A. Servicio Fijo** (`type: "fixed"`):
```typescript
quantity = service.quantityOverride ?? 1
amount = rate × quantity
```

**B. Servicio por Área** (`unit: "sqm"`):
```typescript
quantity = widthMeters × heightMeters  // Área total en m²
if (minimumBillingUnit && quantity < minimumBillingUnit) {
  quantity = minimumBillingUnit
}
amount = rate × quantity
```

**C. Servicio por Perímetro** (`unit: "ml"`):
```typescript
quantity = (widthMeters + heightMeters) × 2  // Perímetro en m
if (minimumBillingUnit && quantity < minimumBillingUnit) {
  quantity = minimumBillingUnit
}
amount = rate × quantity
```

**Ejemplo**:
```
Servicio: "Instalación" (fijo)
  rate = $100
  quantity = 1
  amount = $100

Servicio: "Sellado" (por perímetro)
  rate = $15/m
  widthMeters = 1.0m
  heightMeters = 2.0m
  perimeter = (1.0 + 2.0) × 2 = 6.0m
  amount = $15 × 6.0 = $90
```

#### Paso 8: Calcular ajustes (descuentos/recargos)
```typescript
for (const adjustment of input.adjustments) {
  const quantityDecimal = adjustmentQuantity(adjustment.unit, dimensions);
  const valueDecimal = toDecimal(adjustment.value);
  const amountDecimal = roundHalfUp(
    signedAmount(quantityDecimal.mul(valueDecimal), adjustment.sign)
  );
  adjustmentsTotal = adjustmentsTotal.plus(amountDecimal);
}
```

**Ejemplo**:
```
Ajuste: "Descuento mayorista"
  unit = "sqm"
  value = $10
  sign = "negative"
  quantity = 1.8525 m²
  amount = -(1.8525 × $10) = -$18.53
```

#### Paso 9: Calcular subtotal final
```typescript
const subtotalDecimal = dimPriceDecimal
  .plus(accPriceDecimal)
  .plus(servicesTotal)
  .plus(adjustmentsTotal);
```

**Ejemplo completo**:
```
dimPrice =         $2,238.20  (perfil $2,090 + vidrio $148.20)
accPrice =         $55.00     (accesorios con color)
services =         $190.00    (instalación $100 + sellado $90)
adjustments =      -$18.53    (descuento mayorista)
----------------------------------------
SUBTOTAL =         $2,464.67
```

#### Paso 10: Retornar resultado
```typescript
return {
  dimPrice: toRoundedNumber(dimPriceDecimal),  // $2,238.20
  accPrice: toRoundedNumber(accPriceDecimal),  // $55.00
  colorSurchargePercentage: 10,
  colorSurchargeAmount: toRoundedNumber(colorSurchargeAmount),  // $190.00
  services: [
    { serviceId: "svc1", unit: "unit", quantity: 1, amount: 100 },
    { serviceId: "svc2", unit: "ml", quantity: 6, amount: 90 }
  ],
  adjustments: [
    { concept: "Descuento mayorista", amount: -18.53 }
  ],
  subtotal: toRoundedNumber(subtotalDecimal)  // $2,464.67
};
```

---

## 4. Precisión Numérica

**Librería**: `Decimal.js` (de Prisma)

**Razones para usar Decimal**:
- ✅ Evita errores de redondeo de punto flotante
- ✅ Precisión financiera exacta
- ✅ Compatible con PostgreSQL `DECIMAL` type
- ✅ Operaciones matemáticas encadenables

**Redondeo**:
- Todas las cantidades se redondean a 2 decimales
- Método: `ROUND_HALF_UP` (redondeo comercial estándar)
- Cantidades de servicios: 2 decimales
- Cantidades fijas: 4 decimales

**Ejemplo de diferencia**:
```javascript
// ❌ JavaScript nativo (impreciso)
0.1 + 0.2  // 0.30000000000000004

// ✅ Decimal.js (preciso)
new Decimal(0.1).plus(0.2).toNumber()  // 0.3
```

---

## 5. Casos Especiales y Validaciones

### 5.1 Dimensiones Inválidas
```typescript
// Client-side (hook)
if (width < minWidthMm || width > maxWidthMm) {
  setError("Dimensiones fuera del rango permitido");
  return;  // No llama al API
}

// Server-side (tRPC)
if (widthMm < model.minWidthMm || widthMm > model.maxWidthMm) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: `El ancho debe estar entre ${model.minWidthMm}mm y ${model.maxWidthMm}mm`
  });
}
```

### 5.2 Tipo de Vidrio Incompatible
```typescript
const isCompatible = glassType.models.some(m => m.id === modelId);
if (!isCompatible) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "El tipo de vidrio seleccionado no es compatible con este modelo"
  });
}
```

### 5.3 Sin Recargo de Color
```typescript
// Si colorSurchargePercentage es 0 o undefined
colorSurchargeMultiplier = 1.0
profileCostWithColor = profileCostBeforeColor × 1.0 = profileCostBeforeColor
colorSurchargeAmount = 0
```

### 5.4 Sin Vidrio
```typescript
// Si no se selecciona glass type o pricePerSqm = 0
glassPriceDecimal = new Decimal(0)
dimPrice = profileCostWithColor + 0
```

### 5.5 Unidad de Facturación Mínima
```typescript
// Para servicios por área o perímetro
if (minimumBillingUnit && quantity < minimumBillingUnit) {
  quantity = minimumBillingUnit  // Ej: mínimo 1.0 m²
}
```

---

## 6. Optimizaciones de Performance

### 6.1 Debounce (300ms)
```typescript
// Evita llamadas excesivas al API mientras el usuario escribe
setTimeout(() => {
  mutateRef.current(params);
}, 300);
```

**Ventajas**:
- ✅ Reduce carga del servidor (menos queries)
- ✅ Mejora UX (no parpadea el precio)
- ✅ Balance óptimo entre responsiveness y eficiencia

### 6.2 Validación Client-Side
```typescript
// NO llama al API si dimensiones están fuera de rango
if (!isDimensionsValid) {
  setError("Dimensiones fuera del rango permitido");
  return;  // No hace request
}
```

### 6.3 Memoización de Hooks
```typescript
// useGlassArea usa useMemo
const glassArea = useMemo(
  () => calculateGlassArea(widthMm, heightMm, discounts),
  [widthMm, heightMm, discounts]
);
```

### 6.4 Refs para Evitar Re-renders
```typescript
// Evita loops infinitos por cambios en arrays
const servicesRef = useRef(params.additionalServices);
servicesRef.current = params.additionalServices;
```

---

## 7. Ejemplo Completo de Cálculo

**Input del usuario**:
```typescript
{
  modelId: "model-123",
  glassTypeId: "glass-templado",
  widthMm: 1000,
  heightMm: 2000,
  additionalServices: ["svc-instalacion", "svc-sellado"],
  colorSurchargePercentage: 10  // 10% de recargo
}
```

**Datos del modelo** (desde DB):
```typescript
{
  basePrice: 800,
  costPerMmWidth: 0.50,
  costPerMmHeight: 0.30,
  accessoryPrice: 50,
  glassDiscountWidthMm: 50,
  glassDiscountHeightMm: 50,
  minWidthMm: 500,
  maxWidthMm: 3000,
  minHeightMm: 500,
  maxHeightMm: 3000
}
```

**Datos del vidrio**:
```typescript
{
  id: "glass-templado",
  name: "Vidrio Templado",
  pricePerSqm: 80
}
```

**Servicios**:
```typescript
[
  {
    id: "svc-instalacion",
    name: "Instalación",
    type: "fixed",
    rate: 100
  },
  {
    id: "svc-sellado",
    name: "Sellado perimetral",
    type: "area",
    unit: "ml",
    rate: 15
  }
]
```

**Proceso de cálculo**:

1. **Perfil (sin color)**:
   ```
   base = $800
   width = $0.50 × 1000 = $500
   height = $0.30 × 2000 = $600
   profileCost = $800 + $500 + $600 = $1,900
   ```

2. **Recargo de color (10%)**:
   ```
   multiplier = 1.10
   profileWithColor = $1,900 × 1.10 = $2,090
   colorSurcharge = $2,090 - $1,900 = $190
   ```

3. **Vidrio**:
   ```
   effWidth = 1000 - 50 = 950mm = 0.95m
   effHeight = 2000 - 50 = 1950mm = 1.95m
   area = 0.95 × 1.95 = 1.8525 m²
   glassPrice = $80 × 1.8525 = $148.20
   ```

4. **dimPrice**:
   ```
   dimPrice = $2,090 + $148.20 = $2,238.20
   ```

5. **Accesorios (con color)**:
   ```
   accPrice = $50 × 1.10 = $55.00
   ```

6. **Servicios**:
   ```
   Instalación: $100 × 1 = $100.00
   Sellado: $15/m × 6m = $90.00
   servicesTotal = $190.00
   ```

7. **SUBTOTAL**:
   ```
   $2,238.20 + $55.00 + $190.00 = $2,483.20
   ```

**Response del servidor**:
```typescript
{
  dimPrice: 2238.20,
  accPrice: 55.00,
  colorSurchargePercentage: 10,
  colorSurchargeAmount: 190.00,
  services: [
    { serviceId: "svc-instalacion", unit: "unit", quantity: 1, amount: 100 },
    { serviceId: "svc-sellado", unit: "ml", quantity: 6, amount: 90 }
  ],
  adjustments: [],
  subtotal: 2483.20
}
```

**Desglose en UI**:
```
✓ Precio base del modelo ........... $1,900.00
✓ Vidrio Templado (1.85 m²) ........ $148.20
✓ Recargo de color (+10%) .......... $190.00
✓ Accesorios ....................... $55.00
✓ Instalación ...................... $100.00
✓ Sellado perimetral ............... $90.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL .............................. $2,483.20
```

---

## 8. Diagrama de Flujo Visual

```
┌─────────────────────────────────────────────────────────────┐
│              USUARIO INGRESA DATOS EN FORMULARIO            │
│  • Ancho: 1000mm   • Alto: 2000mm                          │
│  • Vidrio: Templado   • Color: Blanco (+10%)               │
│  • Servicios: [Instalación, Sellado]                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         REACT HOOK FORM + REACT HOOK FORM WATCH            │
│  • width, height, glassType, color, services               │
│  • Actualiza en cada cambio                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              usePriceCalculation Hook                       │
│  ✓ Validación client-side (dimensiones en rango)           │
│  ✓ Debounce 300ms                                          │
│  ✓ setIsCalculating(true)                                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              tRPC: quote.calculate-item                     │
│  • Buscar modelo en DB                                     │
│  • Validar dimensiones server-side                         │
│  • Buscar vidrio y servicios                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            calculatePriceItem() - SERVER CORE               │
│                                                             │
│  PASO 1: Perfil base                                       │
│    $800 + ($0.50×1000) + ($0.30×2000) = $1,900            │
│                                                             │
│  PASO 2: Recargo color                                     │
│    $1,900 × 1.10 = $2,090 (recargo = $190)                │
│                                                             │
│  PASO 3: Vidrio                                            │
│    (0.95m × 1.95m) × $80/m² = $148.20                     │
│                                                             │
│  PASO 4: dimPrice                                          │
│    $2,090 + $148.20 = $2,238.20                           │
│                                                             │
│  PASO 5: Accesorios (con color)                           │
│    $50 × 1.10 = $55.00                                    │
│                                                             │
│  PASO 6: Servicios                                         │
│    Instalación: $100                                       │
│    Sellado: $15 × 6m = $90                                │
│    Total: $190.00                                          │
│                                                             │
│  PASO 7: SUBTOTAL                                          │
│    $2,238.20 + $55.00 + $190.00 = $2,483.20              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              RETORNO A CLIENTE                              │
│  {                                                          │
│    dimPrice: 2238.20,                                      │
│    accPrice: 55.00,                                        │
│    colorSurchargePercentage: 10,                           │
│    colorSurchargeAmount: 190.00,                           │
│    services: [...],                                        │
│    subtotal: 2483.20                                       │
│  }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         usePriceBreakdown Hook (Formatting)                 │
│  • Transforma breakdown en items legibles                  │
│  • Categoriza por tipo (model, glass, service, color)      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              UI ACTUALIZA EN TIEMPO REAL                    │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  PRECIO TOTAL: $2,483.20                │              │
│  │                                          │              │
│  │  Desglose:                               │              │
│  │  ✓ Precio base ............ $1,900.00   │              │
│  │  ✓ Vidrio Templado ........ $148.20     │              │
│  │  ✓ Recargo de color ....... $190.00     │              │
│  │  ✓ Accesorios ............. $55.00      │              │
│  │  ✓ Instalación ............ $100.00     │              │
│  │  ✓ Sellado ................ $90.00      │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
│  [Agregar al Carrito]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Archivos Relacionados

### Cliente (Frontend)
- `src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx` - Componente principal del formulario
- `src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts` - Hook de cálculo con debounce
- `src/app/(public)/catalog/[modelId]/_hooks/use-glass-area.ts` - Cálculo de área de vidrio
- `src/app/(public)/catalog/[modelId]/_hooks/use-price-breakdown.ts` - Formateo de desglose
- `src/app/(public)/catalog/[modelId]/_utils/glass-area-calculator.ts` - Utilidad para área
- `src/app/(public)/catalog/[modelId]/_utils/price-breakdown-builder.ts` - Constructor de desglose

### Servidor (Backend)
- `src/server/api/routers/quote/quote.ts` - Procedimiento tRPC `calculate-item`
- `src/server/price/price-item.ts` - **Función core de cálculo**

### Schemas
- `src/app/(public)/catalog/[modelId]/_utils/validation.ts` - Validación Zod del formulario

---

## 10. Glosario

| Término                          | Definición                                                            |
| -------------------------------- | --------------------------------------------------------------------- |
| **dimPrice**                     | Precio dimensional = Perfil + Vidrio (con recargo de color en perfil) |
| **accPrice**                     | Precio de accesorios (con recargo de color)                           |
| **Área facturable**              | Área de vidrio después de restar espacio de perfiles                  |
| **Descuento de perfil**          | Milímetros que ocupan los perfiles en ancho/alto                      |
| **Recargo de color**             | Porcentaje adicional que se aplica SOLO a perfil y accesorios         |
| **Servicio fijo**                | Servicio con cantidad = 1 (ej: instalación)                           |
| **Servicio por área**            | Servicio facturado por m² de vidrio                                   |
| **Servicio por perímetro**       | Servicio facturado por metros lineales                                |
| **Unidad mínima de facturación** | Cantidad mínima a cobrar (ej: mínimo 1 m²)                            |
| **Subtotal**                     | Precio final antes de impuestos                                       |
| **Decimal.js**                   | Librería para cálculos financieros precisos                           |
| **ROUND_HALF_UP**                | Método de redondeo comercial estándar                                 |
| **Debounce**                     | Técnica para retrasar ejecución hasta que el usuario deje de escribir |

---

## 11. Notas Importantes

### ⚠️ Recargo de Color
- **SE APLICA** a: Perfil (base + dimensiones) y Accesorios
- **NO SE APLICA** a: Vidrio, Servicios adicionales, Ajustes

### ⚠️ Validaciones
- **Client-side**: Para UX (evita llamadas innecesarias al API)
- **Server-side**: Para seguridad (validación definitiva)
- Ambas deben estar sincronizadas

### ⚠️ Precisión
- Usar siempre `Decimal.js` para operaciones financieras
- Redondear a 2 decimales antes de mostrar al usuario
- Método ROUND_HALF_UP para consistencia

### ⚠️ Performance
- Debounce de 300ms es óptimo (ni muy lento ni muy rápido)
- Validar client-side antes de llamar al API
- Memoizar hooks para evitar re-renders innecesarios

---

**Fin del documento**
