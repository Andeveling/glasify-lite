# Plan de Onboarding de Calibracion para PYMES

**Summary**: Plan para disenar un wizard de calibracion que permite a fabricantes como Juan (Vitro Rojas) integrarse a Glasify sin tener que entender la complejidad de bundles, mm, ni parametros abstractos.

**Sources**: (source: dominio-onboarding)

**Last updated**: 2026-04-13

---

## El Problema de Friccion

Hoy, para que Juan configure Glasify necesita:

- Entender que es `costPerMmWidth` ($/mm)
- Calcular bundles de perfiles horizontales y verticales
- Traducir precios por barra de 5.8m a costos por metro
- Resolver sistemas de ecuaciones
- Estimar overhead y MO del taller

Esto es razonable para un ingeniero de pricing. Pero Juan es un fabricante que piensa en:
- "Esta ventana me costo $X en materiales"
- "Le cobré $Y al cliente"
- "Gano $Z por ventana"

**La friccion**: Glasify pide parametros matematicos cuando Juan tiene datos de negocio.

---

## La Estrategia: Wizard de Calibracion

El objetivo es que Juan solo proporcione:

1. Sus datos de negocio (proveedor, costos operativos)
2. Dos ventanas reales que haya cotizado (con dimensiones y costo real)
3. El sistema deduce los parametros automaticamente

El wizard habla el idioma de Juan, no el idioma de Glasify.

---

## Arquitectura del Wizard

### Flujo de 5 Pasos

```
Paso 1: Datos del Negocio
  - Nombre del taller
  - Moneda
  - Proveedor de perfiles
  -> Se guarda en TenantConfig

Paso 2: Seleccionar Plantilla de Modelo
  - VC Panama 2 Panos (OX)
  - Europa Clasica 3 Panos (XOX)
  - Abatible Europa 2 Hojas
  -> Trae minWidth, minHeight, maxWidth, maxHeight predefinidos

Paso 3: Precios del Proveedor
  - Lista simple: "Barra Marco 2 vias = $45"
  - Sin calculos, sin conversiones
  -> Se guarda en ModelCostBreakdown por componente

Paso 4: Dos Ventanas de Referencia
  - Ventana A: dimensions + costo real de fabricacion
  - Ventana B: dimensions + costo real de fabricacion
  -> El sistema resuelve para basePrice, costPerMmWidth, costPerMmHeight

Paso 5: Revisar y Validar
  - Resumen de parametros derivados
  - Verificacion automatica con las dos ventanas de referencia
  - Breakdown visual de cada ventana (perfiles, vidrio, accesorios, MO)
  -> Se guardan en Model + ModelCostBreakdown
```

---

## Detalle de Cada Paso

### Paso 1: Datos del Negocio

Formulario simple:

```
Nombre del taller: [________________]
Moneda: [USD        v]
Ciudad: [Ciudad de Panama]
Proveedor de perfiles: [Extralum     v]  (o "Otro")
```

Resultado en el sistema: `TenantConfig` (businessName, currency, timezone).

### Paso 2: Seleccionar Plantilla de Modelo

Tarjetas visuales del catalogo:

```
+------------------+  +------------------+
| VC Panama 2P    |  | Europa Clasica   |
| [imagen]        |  | [imagen]         |
| OX              |  | XOX              |
| 600-2000 x 400-2400mm |  | 600-1800 x 400-2200mm |
+------------------+  +------------------+
```

Juan selecciona una plantilla. El sistema carga:

```
minWidthMm = 600
minHeightMm = 400
maxWidthMm = 2000
maxHeightMm = 2400
```

Esto ya le ahorra a Juan tener que pensar en dimensiones minimas — la plantilla se las da.

### Paso 3: Precios del Proveedor (Entrada Natural)

**La clave**: Juan no tiene que convertir nada. Solo ingresa lo que le dijo el proveedor.

Interfaz tipo tabla de doble entrada:

```
+----------------------------------+-------------+
| Perfil                           | Precio      |
+----------------------------------+-------------+
| Barra Marco 2 vias (5.8m)        | [$45    ]  |
| Barra Hoja (5.8m)                | [$35    ]  |
| Barra Guia Traslape (5.8m)       | [$15    ]  |
| Barra Hoja Malla (5.8m)          | [$22    ]  |
| Felpa (por metro lineal)          | [$0.30  ]  |
+----------------------------------+-------------+
| Accesorios                       |             |
+----------------------------------+-------------+
| Rueda hoja (por unidad)           | [$3     ]  |
| Cerradura embutida (por unidad)   | [$3     ]  |
| Tope (por unidad)                 | [$0.30  ]  |
| Escuadra de resorte (por unidad)  | [$1     ]  |
+----------------------------------+-------------+
```

Debajo de la tabla, el sistema deduce automaticamente:

```
Longitud de barra detectada: 5.8m (estandar)
Costo efectivo Marco 2 vias: $45 / 5.8m = $7.76/m
Costo efectivo Hoja: $35 / 5.8m = $6.03/m
...
```

Juan ve estos numeros derivados pero NO tiene que ingresarlos. Si el proveedor le da otra longitud, Juan la cambia y todo se recalcula.

### Paso 4: Dos Ventanas de Referencia (El Nucleo)

**Por que dos?**: Con dos puntos (W1,H1,C1) y (W2,H2,C2), el sistema tiene 2 ecuaciones y puede resolver `basePrice`, `costPerMmWidth`, `costPerMmHeight`.

Interfaz:

```
--- Ventana de Referencia A ---

"Ancho de esta ventana que cotize:"
  [900] mm

"Alto de esta ventana que cotize:"
  [900] mm

"Cuanto le costo fabrics esta ventana? (materiales + mano de obra, sin margen)"
  [________] USD

[AYUDA] "Esto es lo que le pago al proveedor de aluminio + el vidrio + el tiempo de fabricacion. No incluya su ganancia."

--- Ventana de Referencia B ---

"Ancho:"
  [1500] mm

"Alto:"
  [1200] mm

"Cuanto le costo fabrics esta ventana?"
  [________] USD
```

El sistema toma estas dos ventanas y resuelve:

```
CostoReal_A = basePrice + costPerMmWidth × (W1 - minWidth) + costPerMmHeight × (H1 - minHeight)
CostoReal_B = basePrice + costPerMmWidth × (W2 - minWidth) + costPerMmHeight × (H2 - minHeight)
```

Restando: las incognitas se cancelan parcialmente y el sistema despeja los parametros.

**Importante**: Juan solo ingresa costos reales de fabricacion. El sistema deduce los parametros. Juan no necesita saber que es `costPerMmWidth`.

### Paso 5: Revision y Validacion

El sistema muestra:

```
Parametros derivados para VC Panama 2 Panos (OX):

basePrice:        $236.04
costPerMmWidth:  $0.0401
costPerMmHeight: $0.0396
accessoryPrice:  $23.00

--- Verificacion con sus ventanas de referencia ---

Ventana A (900x900mm):
  Su costo real: $308
  Costo Glasify: $308  (diferencia: $0.0)
  [breakdown visual]

Ventana B (1500x1200mm):
  Su costo real: $368
  Costo Glasify: $368  (diferencia: $0.0)
  [breakdown visual]
```

El breakdown visual le muestra a Juan:

```
Ventana A (900x900mm):
  Perfiles:     $160.90
  Vidrio:        $17.38
  Accesorios:    $23.00
  MO + overhead: $52.14
  --------------------------
  Total:        $253.42  (sin margen)
```

Juan puede validar que los numeros tienen sentido. Si algo esta mal, puede ajustar los datos de entrada y recalcular.

---

## Como el Sistema Resuelve (Logica Interna)

Para transparency, aqui esta como el sistema calcula internamente:

### Paso 3 (Precios) → Calculo de costo por ventana

Con los precios por barra, el sistema calcula el costo real de cada ventana de referencia:

```
Para ventana 900x900mm:

Marco 2 vias (horizontal): 2 × 900mm = 1800mm = 1.8m
Marco 2 vias (vertical):   2 × 900mm = 1800mm = 1.8m
Hoja perfil (largos):     4 × (900-66)mm = 3336mm = 3.34m
Hoja perfil (anchos):     4 × (900-66)mm = 3336mm = 3.34m

Barras Marco 2 vias: ceil((1.8+1.8)/5.8) = 1 barra → $45.00
Barras Hoja: ceil((3.34+3.34)/5.8) = 2 barras → $70.00
Felpa: 3.6m × $0.30 = $1.08
Accesorios: $23.00

Costo perfiles: $139.08
Costo vidrio: 0.695m2 × $25 = $17.38
Subtotal materiales: $156.46
MO + overhead: estimado -> $XX.XX
```

### Paso 4 (Dos ventanas) → Resolucion del sistema

```
Ventana A: 900x900mm, Costo = $308.00
Ventana B: 1500x1200mm, Costo = $368.00

Extra Width A = 900 - 600 = 300mm
Extra Height A = 900 - 400 = 500mm
Extra Width B = 1500 - 600 = 900mm
Extra Height B = 1200 - 400 = 800mm

CostoA = basePrice + cw × 300 + ch × 500
CostoB = basePrice + cw × 900 + ch × 800

Restando:
CostoB - CostoA = cw × 600 + ch × 300
$60.00 = cw × 600 + ch × 300

Asumiendo cw ≈ ch (aproximacion inicial):
$60.00 = cw × 900
cw = $0.0667/mm

Calculando basePrice con ventana A:
$308.00 = basePrice + 0.0667 × 300 + 0.0667 × 500
basePrice = $308.00 - $53.36 = $254.64
```

El sistema afina estos numeros iterativamente hasta que el error sea < 1%.

---

## ModelCostBreakdown: Almacenando el Desglose

El modelo `ModelCostBreakdown` del schema permite guardar el detalle de componentes:

```
model ModelCostBreakdown {
  component String   // 'perfil_horizontal', 'vidrio', 'herrajes', 'mo'
  costType  CostType // fixed, per_mm_width, per_mm_height, per_sqm
  unitCost  Decimal
  notes     String?
}
```

Esto permite que Juan vea el breakdown completo de cada ventana en la validacion:

```
Perfil horizontal (bundle):  $80.30  (per_mm_width: $0.0401 × mm)
Perfil vertical (bundle):   $75.60  (per_mm_height: $0.0396 × mm)
Vidrio:                     $17.38  (per_sqm: $25.00 × 0.695m2)
Herrajes:                   $23.00  (fixed)
MO + overhead:              $52.14  (fixed)
-----------------------------------
Total:                     $248.42
```

El `costNotes` en `Model` puede guardar la metodologia:

```
"Parametros calibrados usando 2 ventanas de referencia.
Costo MO/overhead estimado: $52.14/ventana.
Metodo de bundle: perfiles horizontales = marco sup+inf + hoja anchos + guia traslape.
Metodo de bundle: perfiles verticales = marco izq+der + hoja largos."
```

---

## Validacion y Ajustes Post-Calibracion

Despues de la calibracion inicial, Juan puede:

### 1. Revisar el desglose de una ventana cualquier

Glasify muestra el breakdown completo para cada item cotizado:

```
Ventana VC Panama 2P - 1500x1200mm - Vidrio 6mm

Perfil bundle horiz:  900mm × $0.0401 = $36.09
Perfil bundle vert:   800mm × $0.0396 = $31.68
Subtotal perfil:                       $67.77

Vidrio (1434×1134mm): 1.63m2 × $25 = $40.65
Accesorios (fijos):                    $23.00

Costo fabricacion:                   $131.42
Margen (35%):                         $45.99
-----------------------------------
Precio de venta:                     $177.41
```

### 2. Ajustar el margen

Juan puede cambiar el `%` de margen para toda la cotizacion. Esto no cambia los costos — solo el precio final.

### 3. Validar contra cotizaciones reales

Juan puede tomar una cotizacion que hizo hace 2 semanas y compararla con lo que Glasify calcularia. Si la diferencia es > 10%, hay que ajustar:

- Precios del proveedor desactualizados
- Costos MO diferentes a los estimados
- Margen diferente al que uso realmente

### 4. Recalibrar cuando cambian los costos

Si Extralum sube precios, Juan:
1. Actualiza los precios en el Paso 3
2. El sistema recalcula los bundles automaticamente
3. Juan revisa el impacto en las ventanas de referencia

---

## Alternativa: Sin Ventanas de Referencia (Modo Directo)

Si Juan conoce sus costos operativos con precision, puede usar el modo directo:

```
1. Seleccionar plantilla de modelo
2. Ingresar precios del proveedor (Paso 3)
3. El sistema calcula automaticamente el costo de la ventana minima
   - Perfiles en minWidth x minHeight
   - Accesorios fixos
   - MO estimada por dimension
4. Juan ingresa el porcentaje de overhead del taller
5. Parametros se derivan de los calculos automaticos
```

Este modo no requiere ventanas de referencia. Es mas preciso pero requiere que Juan conozca su MO y overhead.

---

## Roadmap de Implementacion

### Fase 1: MVP (2-3 semanas)

- Wizard basico de 5 pasos
- Paso 3 y 4 funcionales
- Resolucion del sistema de ecuaciones
- Guardado en Model + ModelCostBreakdown
- Vista de validacion con breakdown

### Fase 2: Mejoras UX (1-2 semanas)

- Tarjetas visuales para plantillas de modelo
- Input de precios del proveedor con autocomplete (desde lista de Extralum, Rehau, etc.)
- Calculadora de MO integrada (Juan ingresa costo/hora y tiempo x ventana)
- Sugerencia automatica de overhead basada en industria (15-20%)

### Fase 3: Multi-modelo y Versioning

- Calibrar todos los modelos del catalogo de un cliente
- Historial de recalibraciones (cuando sube el aluminio, Juan ve el impacto)
- Comparacion de rentabilidad entre modelos

### Fase 4: Inteligencia de Negocio

- Dashboard: "Esta ventana es mas rentable que otra?"
- Benchmarking: "Cual modelo te da mas margen por m2?"
- Alertas: "Tu vidrio subio 10%. Impacto en cotizaciones pendientes: $X"

---

## Resumen: Reduccion de Friccion

| Sin Wizard | Con Wizard |
|-----------|------------|
| Juan debe entender bundles y mm | Juan solo ingresa precios de proveedor y 2 costos reales |
| Juan resuelve ecuaciones a mano | Sistema resuelve automaticamente |
| Juan calcula overhead sin saber como | Sistema sugiere valores tipicos |
| Parametros parecen magicos | Juan ve breakdown completo y valida |
| Cada modelo requiere calibracion manual | Se importa desde plantillas predefinidas |

**El objetivo**: Juan tarda 20 minutos en lugar de 4 horas. Y entiende lo que tiene configurado.

---

## Related pages

- [[30-clients/01-vitro-rojas/calibracion-precios]] — Metodo matematico de calibracion (referencia)
- [[30-clients/01-vitro-rojas/flujo-cotizacion]] — Flujo actual de Juan y como Glasify lo mejora
- [[calculo-precios-pymes-latam]] — Metodos de calculo en fabricas LATAM (contexto de mercado)
- [[pricing-formula]] — Formula implementada en Glasify (referencia tecnica)
