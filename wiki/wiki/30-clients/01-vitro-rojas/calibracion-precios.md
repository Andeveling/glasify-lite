# Plan de Calibracion de Precios — Vitro Rojas a Glasify

**Summary**: Metodo para derivar los parametros `basePrice`, `costPerMmWidth`, `costPerMmHeight` y `accessoryPrice` de Glasify a partir de los costos reales por componente de Vitro Rojas. Los precios del proveedor son por barra de 5.8m.

**Sources**: (source: dominio-calibracion)

**Last updated**: 2026-04-13

---

## CORRECCION IMPORTANTE: Precios Por Barra, No Por Unidad

Los precios que Juan tiene de Extralum son por **barra de aluminio de 5.8 metros**, no por unidad de perfil. Esto cambia fundamentalmente el calculo.

```
"Marco 2 vias $45" = una barra de 5.8m cuesta $45
"Hoja ventana $35" = una barra de 5.8m cuesta $35
```

Esto significa que el costo real de una ventana depende de:
1. Cuantos metros de cada perfil necesita
2. Cuantas barras completas ocupa (se redondea hacia arriba)
3. Cuanto material se desperdicia por recorte

---

## El Problema Central

Glasify usa una formula parametrica para el costo del perfil:

```
ProfilePrice = (basePrice × colorMultiplier)
             + (costPerMmWidth × colorMultiplier × extraWidthMm)
             + (costPerMmHeight × colorMultiplier × extraHeightMm)

Donde:
  extraWidthMm  = max(0, widthMm - minWidthMm)
  extraHeightMm = max(0, heightMm - minHeightMm)
```

Juan tiene costos concretos por barra de 5.8m:

```
Barra Marco 2 vias = $45  (5.8m)
Barra Hoja = $35        (5.8m)
Barra Traslape = $15    (5.8m)
Barra Hoja malla = $22  (5.8m)
Ruedas hoja = $3 c/u
Felpa = $0.30/metro lineal
...
```

**El problema**: como pasar de precios por barra de 5.8m a los parametros abstractos de Glasify.

---

## Paso 1: Entender Que Incluyen los Parametros de Glasify

### La logica de "bundle por dimension"

Glasify no calcula cada perfil individualmente. En lugar de eso, agrupa (bundle) todos los perfiles que crecen en la misma direccion:

#### costPerMmWidth = Bundle de perfiles horizontales

Todos los perfiles cuyo largo crece cuando la ventana se hace **mas ancha**:

| Perfil | Como crece con el ancho |
|--------|----------------------|
| Marco superior | 2 × ancho total de la ventana |
| Marco inferior | 2 × ancho total de la ventana |
| Perfil hoja (anchos) | 4 × (ancho - descuento marcos) |
| Guia de traslape | 2 × ancho total |

El costo de TODOS estos perfiles combinados por cada mm adicional de ancho = `costPerMmWidth`.

#### costPerMmHeight = Bundle de perfiles verticales

Todos los perfiles cuyo largo crece cuando la ventana se hace **mas alta**:

| Perfil | Como crece con el alto |
|--------|----------------------|
| Marco izquierdo | 2 × alto total de la ventana |
| Marco derecho | 2 × alto total de la ventana |
| Perfil hoja (largos) | 4 × (alto - descuento marcos) |
| Perfil de cruce | 2 × (alto - descuento) en 3+ paños |

El costo de TODOS estos perfiles combinados por cada mm adicional de alto = `costPerMmHeight`.

#### basePrice = Bundle de componentes fixos

Todo lo que NO depende de las dimensiones:

| Componente | Notas |
|-----------|-------|
| Crucero / perfil de division central | Solo existe en 3 o mas paños |
| Tapas de perfil | 2-4 por ventana |
| Escuadras de ensamblaje | 8-12 por ventana |
| Calzos de vidrio | Segun tamanho del vidrio |
| Felpa perimetral | Todo el perimetro (crece con ambas dimensiones, pero se puede atribuir proporcionalmente) |

#### accessoryPrice = Bundle de componentes unitarios

Componentes contados por unidad, sin variacion dimensional:

| Accesorio | Cantidad tipica |
|-----------|----------------|
| Ruedas | 2 por hoja (4 para 2-panho OX) |
| Cerradura embutida | 1 por hoja |
| Tope | 2 por ventana |
| Escuadra de resorte | 4-8 por ventana |
| Escuadra de alineamiento | 4-8 por ventana |

### Resumen visual de la estructura de costos Glasify

```
Costo del Perfil
|
+-- basePrice (bundle fixo)
|      - Crucero
|      - Tapas
|      - Escuadras
|      - Calzos
|      - Felpa perimetral
|
+-- costPerMmWidth (bundle horizontal por mm extra de ancho)
|      - Marco superior + inferior
|      - Perfil hoja (anchos)
|      - Guia de traslape
|
+-- costPerMmHeight (bundle vertical por mm extra de alto)
|      - Marco izquierdo + derecho
|      - Perfil hoja (largos)
|      - Perfil de cruce (3+ paños)
|
accessoryPrice (bundle unitario)
       - Ruedas
       - Cerraduras
       - Topes
       - Escuadras
```

### Como funciona en la practica

Para una ventana VC Panama 2 Panos (OX) de 1500 x 1200mm:

```
basePrice:        $198.32  (lo que no crece con dimension)
costPerMmWidth:   $0.0287  (costo de TODOS los perfiles horizontales por cada mm extra de ancho)
extraWidth:                (1500 - 600) = 900mm
costPerMmHeight:  $0.0287  (costo de TODOS los perfiles verticales por cada mm extra de alto)
extraHeight:               (1200 - 400) = 800mm
accessoryPrice:   $23.00   (accesorios fijos)
```

El $0.0287/mm representa la SUMA de todos los perfiles horizontales (marco sup/inf + hojas anchos) por mm, no un perfil individual.

---

## Paso 2: Recopilar Datos Reales de Juan

### Grupo A — Lista de Precios del Proveedor (POR BARRA)

**Importante**: cada precio es por barra de 5.8m. Hay que confirmar esta longitud con Extralum.

|| Perfil | Precio por Barra | Longitud Barra | Costo por Metro ||
||--------|-----------------|----------------|-----------------|
|| Barra Marco 2 vias | $45.00 | 5.8m | $7.76/m |
|| Barra Hoja | $35.00 | 5.8m | $6.03/m |
|| Barra Traslape | $15.00 | 5.8m | $2.59/m |
|| Barra Hoja malla | $22.00 | 5.8m | $3.79/m |
|| Barra guia traslape | $0.50 | Por metro | - |
|| Barra felpa | $0.30 | Por metro | - |

|| Accesorios | Precio Unitario | Notas ||
||------------|-----------------|-------|
|| Ruedas hoja | $3.00 | 2 por hoja |
|| Cerradura embutida | $3.00 | 1 por hoja |
|| Tope | $0.30 | 2 por ventana |
|| Escuadra de resorte | $1.00 | 4-8 por ventana |
|| Escuadra de alineamiento | $0.10 | 4-8 por ventana |

|| Vidrio | Precio por m2 ||
||--------|---------------|
|| Vidrio 6mm simple | $25.00/m2 |
|| Vidrio laminado 33.1mm | $45.00/m2 |
|| Vidrio DVH | $65.00/m2 |

### Grupo B — Costos Operativos de Manufactura

|| Concepto | Valor | Notas ||
||---------|-------|-------|
|| Costo hora de trabajo (fabricacion) | $?/hora | Incluir prestaciones, paros, bonificaciones |
|| Tiempo fabricacion por ventana | $? horas | Medir con cronometro o estimar |
|| Costo hora instalacion | $?/hora | Puede ser otro operario |
|| Tiempo instalacion por ventana | $? horas | Depende de altura, acceso, cantidad |
|| Gastos mensuales del taller | $?/mes | Renta, luz, herramientas, seguro |
|| Ventanas producidas por mes promedio | $? | Para prorratear gastos fijos |

---

## Paso 3: Calculo de Costo Por Ventana (Logica Correcta Por Barra)

Para calcular el costo real de una ventana, el proceso es:

```
Para cada tipo de perfil:
  1. Calcular metros totales de ese perfil necesarios
  2. Dividir entre 5.8m para saber cuantas barras ocupa
  3. Redondear hacia arriba (no se puede comprar 0.3 de barra)
  4. Multiplicar por precio por barra
```

### Ejemplo: VC Panama 2 Panos (OX) — Ventana 900 x 900mm

```
Datos de perfil por ventana:
  - Marco horizontal: 2 × 900mm = 1800mm (marco sup + inf)
  - Marco vertical: 2 × 900mm = 1800mm (marco izq + der)
  - Hoja largos: 4 × (900 - 66)mm = 3336mm  (2 hojas × 2 perfiles cada una)
  - Hoja anchos: 4 × (900 - 66)mm = 3336mm  (2 hojas × 2 perfiles cada una)

Perfil Marco 2 vias:
  Total: 1800 + 1800 = 3600mm = 3.6m
  Barras: ceil(3.6 / 5.8) = ceil(0.62) = 1 barra
  Costo: 1 × $45 = $45.00

Perfil Hoja:
  Total: 3336 + 3336 = 6672mm = 6.67m
  Barras: ceil(6.67 / 5.8) = ceil(1.15) = 2 barras
  Costo: 2 × $35 = $70.00

Felpa (perimetro total):
  Perimetro: 2 × (900 + 900) = 3600mm = 3.6m
  Costo: 3.6m × $0.30/m = $1.08
```

### Factor de Desperdicio de Barra

Una forma mas simple que usan muchos talleres:

```
Rendimiento de barra = 85-90% (se pierde ~10-15% en recortes)
Costo efectivo por metro = precio por barra / (5.8m × 0.87)

Ejemplo Marco 2 vias:
  $45 / (5.8 × 0.87) = $45 / 5.046 = $8.92/m efectivo
```

Esto permite calcular costo directamente por metro sin redondear barras, con un factor de desperdicio incluido.

---

## Paso 4: Calcular los Bundles y Derivar Parametros

La clave del metodo: `costPerMmWidth` y `costPerMmHeight` son la **suma de todos los perfiles que crecen en esa direccion** por cada mm adicional.

### Modelo: VC Panama 2 Panos (OX)
- **minWidthMm** = 600mm
- **minHeightMm** = 400mm

### Precios del proveedor (por barra de 5.8m)

|| Perfil | Precio por Barra | Costo por Metro (sin desperdicio) ||
||--------|-----------------|--------------------------------|
|| Barra Marco 2 vias | $45.00 | $7.76/m ($45 / 5.8m) |
|| Barra Hoja | $35.00 | $6.03/m ($35 / 5.8m) |
|| Barra Guia traslape | $2.90 | $0.50/m |

### Paso 4a: Calcular costPerMmWidth (bundle de perfiles horizontales)

Todos los perfiles que crecen cuando aumenta el **ancho**:

| Perfil | Cantidad | mm extra por mm de ancho | Costo por mm |
|--------|----------|-------------------------|-------------|
| Marco superior | 1 | 1mm | 1mm × $7.76/m = $0.00776 |
| Marco inferior | 1 | 1mm | 1mm × $7.76/m = $0.00776 |
| Guia traslape | 1 | 1mm | 1mm × $0.50/m = $0.00050 |
| Hoja perfil (ancho) | 4 | 4mm | 4mm × $6.03/m = $0.02412 |

```
costPerMmWidth = $0.00776 + $0.00776 + $0.00050 + $0.02412
               = $0.04014/mm
```

**Interpretacion**: por cada mm extra de ancho, la ventana necesita 7mm extra de perfil horizontal (2mm marco + 4mm hojas + 1mm guia). A los precios actuales, eso cuesta $0.04014.

### Paso 4b: Calcular costPerMmHeight (bundle de perfiles verticales)

Todos los perfiles que crecen cuando aumenta el **alto**:

| Perfil | Cantidad | mm extra por mm de alto | Costo por mm |
|--------|----------|------------------------|-------------|
| Marco izquierdo | 1 | 1mm | 1mm × $7.76/m = $0.00776 |
| Marco derecho | 1 | 1mm | 1mm × $7.76/m = $0.00776 |
| Hoja perfil (largo) | 4 | 4mm | 4mm × $6.03/m = $0.02412 |

```
costPerMmHeight = $0.00776 + $0.00776 + $0.02412
               = $0.03964/mm
```

**Interpretacion**: por cada mm extra de alto, la ventana necesita 6mm extra de perfil vertical (2mm marco + 4mm hojas). A los precios actuales, eso cuesta $0.03964.

### Paso 4c: Calcular basePrice (bundle de costo fijo en dimensiones minimas)

Para las dimensiones minimas (600 x 400mm):

**Perfiles en dimension minima:**

```
Marco horiz (sup+inf):
  2 × 600mm = 1200mm = 1.2m
  Barra: ceil(1.2/5.8) = 1 → 1 × $45 = $45.00

Marco vert (izq+der):
  2 × 400mm = 800mm = 0.8m
  Barra: ceil(0.8/5.8) = 1 → 1 × $45 = $45.00

Hoja perfil (largo):
  4 × (400-66) = 1336mm = 1.34m
  Barra: ceil(1.34/5.8) = 1 → 1 × $35 = $35.00

Hoja perfil (ancho):
  4 × (600-66) = 2136mm = 2.14m
  Barra: ceil(2.14/5.8) = 1 → 1 × $35 = $35.00

Guia traslape:
  600mm = 0.6m × $0.50/m = $0.30

Felpa perimetro:
  2 × (600+400) = 2000mm = 2.0m × $0.30/m = $0.60

Subtotal perfiles en minimo: $45 + $45 + $35 + $35 + $0.30 + $0.60 = $160.90
```

**Accesorios fixos:**

```
Ruedas: 4 × $3.00 = $12.00
Cerraduras: 2 × $3.00 = $6.00
Escuadras: 8 × promedio $0.55 = $4.40
Tapas: 2 × $0.30 = $0.60
Total accesorios: $23.00
```

**MO y overhead (valores de ejemplo — Juan debe confirmar):**

```
MO fabricacion: $16.00 (2 horas × $8/hora)
MO instalacion: $12.00 (1.5 horas × $8/hora)
Overhead 15% sobre materiales: $160.90 × 0.15 = $24.14
```

```
basePrice = $160.90 + $23.00 + $16.00 + $12.00 + $24.14
          = $236.04
```

### Paso 4d: Verificar con dos ventanas reales

**Ventana A: 900 x 900mm** (extraWidth=300, extraHeight=500)

```
basePrice:              $236.04
+ costPerMmWidth×300:   300 × $0.04014 = $12.04
+ costPerMmHeight×500:  500 × $0.03964 = $19.82
= ProfilePrice_A:        $267.90

Vidrio: (834×834)/1,000,000 × $25 = 0.695 × $25 = $17.38
AccessoryPrice: $23.00
modelCost_A = $267.90 + $17.38 + $23.00 = $308.28
```

**Ventana B: 1500 x 1200mm** (extraWidth=900, extraHeight=800)

```
basePrice:              $236.04
+ costPerMmWidth×900:   900 × $0.04014 = $36.13
+ costPerMmHeight×800:  800 × $0.03964 = $31.71
= ProfilePrice_B:        $303.88

Vidrio: (1434×1134)/1,000,000 × $25 = 1.626 × $25 = $40.65
AccessoryPrice: $23.00
modelCost_B = $303.88 + $40.65 + $23.00 = $367.53
```

### Parametros Finales para Glasify

|| Parametro | Valor USD | Notas ||
||-----------|-----------|-------|
|| `basePrice` | $236.04 | Costo de todos los perfiles en dim. minimas + accesorios + MO + overhead ||
|| `costPerMmWidth` | $0.0401 | Bundle horiz: marco sup/inf + guia traslape + hoja anchos ||
|| `costPerMmHeight` | $0.0396 | Bundle vert: marco izq/der + hoja largos ||
|| `accessoryPrice` | $23.00 | Ruedas + cerraduras + escuadras + tapas ||

### Nota sobre el factor de desperdicio

Los calculos arriba usan el precio por metro sin factor de desperdicio. En la realidad, cada barra de 5.8m tiene recortes que se pierden. Para ser mas preciso, se puede usar:

```
Costo efectivo por metro = precio_barra / (5.8m × 0.87)
```

Esto implicitamente asume un rendimiento del 87% de la barra. El factor real depende de que tan bien se nesteen los cortes de todas las ventanas del pedido.

---

## Paso 5: Configurar en Glasify

Parametros para VC Panama 2 Panos (OX):

```
basePrice:        $236.04
costPerMmWidth:  $0.0401
costPerMmHeight: $0.0396
accessoryPrice:  $23.00
Vidrio 6mm:      $25.00/m2 (discountWidthMm = 66, discountHeightMm = 66)
```

Glasify calcula para una ventana 1500x1200mm:

```
ProfilePrice:
  basePrice:              $236.04
  + costPerMmWidth×900:  900 × $0.0401 = $36.09
  + costPerMmHeight×800:  800 × $0.0396 = $31.68
  = $303.81

GlassPrice:
  (1434 × 1134) / 1,000,000 × 25 = 1.626 × 25 = $40.65

AccessoryPrice: $23.00

modelCost = $303.81 + $40.65 + $23.00 = $367.46
```

---

## Paso 6: Validar Contra Cotizaciones Reales

Una vez configurado, Juan debe validar:

1. Tomar 3-5 cotizaciones reales que haya hecho recientemente
2. Comparar: lo que cobro al cliente vs lo que Glasify calcula
3. Si hay diferencia > 10%, revisar costos operativos y overhead

---

## Resumen del Proceso

```
1. Confirmar longitud de barra con Extralum (típicamente 5.8m)
2. Organizar precios del proveedor en formato por barra
3. Estimar costos operativos (MO fabricacion, instalacion, overhead taller)
4. Calcular costo real de 2 ventanas (usando logica de barras: metros/5.8m redondeado hacia arriba)
5. Resolver sistema de ecuaciones para costPerMmWidth y costPerMmHeight
6. Obtener basePrice como residuo
7. Configurar en Glasify
8. Validar con cotizaciones reales pasadas
9. Ajustar segun necesidad
```

---

## Concepto Clave: Rendimiento de Barra

Un taller puede optimizar el costo de barras de dos maneras:

**Sin optimizacion (lo que assumimos arriba)**: Cada ventana se corta de forma independiente. Se redondean las barras hacia arriba por ventana.

**Con optimizacion (nestear cortes)**: Si fabricas 10 ventanas iguales, puedes ordenar los cortes de todas en las mismas barras para minimizar desperdicio. Por ejemplo:

```
Barra de 5.8m:
  - 6 perfiles de 900mm = 5.4m (sobra 0.4m que se pierde)
  vs
  - 5 perfiles de 900mm + cortes de otra ventana = 4.5m + optimization
```

En la practica, el rendimiento real de una barra esta entre 80% y 95%, dependiendo de la variedad de tamanos en el pedido. Para calibrar parametros de Glasify, usar 85-90% es un buen punto de partida.

---

## Related pages

- [[30-clients/01-vitro-rojas/flujo-cotizacion]] — Flujo actual y como Glasify lo mejora
- [[calculo-precios-pymes-latam]] — Metodos de calculo en fabricas LATAM (contexto)
- [[pricing-formula]] — Formula implementada en Glasify (referencia tecnica)
