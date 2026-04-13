# Calculo de Precios en PYMES — LATAM

**Summary**: Metodos que usan talleres y fabricas de ventanas en LATAM para calcular precios. Incluye formulas por m2, desglose por componentes, y variables clave.

**Sources**: (source: dominio-pymes-ventanas-latam)

**Last updated**: 2026-04-13

---

## Metodo 1: Precio por m2 (el mas comun)

Formula basica:

```
Precio = (Area m2 x precio base por m2) + adicionales
```

El costo depende directamente del material (aluminio + vidrio), que crece con el tamano.

### Rangos tipicos

| Nivel | USD/m2 |
|-------|--------|
| Basico | 40 - 100 |
| Medio | 100 - 200 |
| Alto | 200 - 350 |

### Ejemplo

Ventana corredera 1.20 x 1.20 m:

```
Area = 1.44 m2
Precio base = 120 USD/m2
Precio base = 1.44 x 120 = 172.8 USD

Extras:
  Vidrio doble: +40 USD
  Herrajes: +20 USD
  Instalacion: +50 USD

Precio final = 280 USD
```

---

## Metodo 2: Desglose por componentes (fabricantes mas tecnicos)

Formula:

```
Precio = Perfil + Vidrio + Accesorios + Mano de obra + Margen
```

### 1. Perfil de aluminio

Se calcula por **metro lineal**. Depende de la serie (economica vs alta prestacion).

```
Perimetro ventana = 5 m
Costo perfil = 8 USD/m
Costo perfil = 5 x 8 = 40 USD
```

### 2. Vidrio

Se calcula por m2. Simple, doble, laminado, etc.

```
Vidrio 1.44 m2 x 25 USD = 36 USD
```

### 3. Accesorios

Ruedas, cerraduras, felpas, sellos. Fijo o porcentaje del costo.

```
Accesorios = 15 USD
```

### 4. Mano de obra

Fabricacion + instalacion. Por unidad, por m2, o porcentaje (20%-40%).

### 5. Margen del fabricante

Normal: 20% - 50% en LATAM.

### Ejemplo completo

```
Perfil = 40 USD
Vidrio = 36 USD
Accesorios = 15 USD
Mano de obra = 30 USD
Subtotal = 121 USD

Margen 30% = 36 USD
Precio final = 157 USD
```

---

## Metodo 3: Tablas de precio unitario estandar

Empresas constructoras usan tablas tipo:

| Tipo de ventana | USD/m2 |
|-----------------|--------|
| Corredera basica | 90 - 150 |
| Abatible | 150 - 250 |
| Alta eficiencia | 250 - 400 |

Simplifica cotizaciones rapidas en proyectos grandes.

---

## Variables clave que siempre afectan el precio

### Tamano

Mas grande = mas material. Es el factor mas importante.

### Tipo de apertura

- Corredera: mas barata
- Abatible / oscilobatiente: mas cara

### Tipo de vidrio

- Simple: barato
- Doble / acustico: caro

### Aislamiento (RPT)

Incrementa bastante el costo.

### Acabados

- Blanco estandar: barato
- Negro, madera, anodizado: mas caro

---

## Flujo tipico en talleres LATAM

Los fabricantes NO usan una sola formula. Usan una mezcla de:

1. Calculan m2
2. Aplican tarifa base
3. Ajustan por serie de aluminio, tipo de vidrio, dificultad
4. Anaden margen

### Ejemplo realista

Cliente pide: Ventana 1.50 x 1.20, corredera, vidrio simple

```
Area = 1.8 m2
Tarifa base = 90 USD/m2
Subtotal = 162 USD

Extras:
  Transporte: 20 USD
  Instalacion: 40 USD

Total = 220 USD
```

---

## Relevancia para Glasify

El sistema Glasify implementa el **Metodo 2 (desglose por componentes)** con formulas parametricas:

- `ProfilePrice` = perfil por metro lineal (equivalente a costo de perfil)
- `GlassPrice` = vidrio por m2
- `AccessoryPrice` = accesorios
- `ServicesPrice` = mano de obra y servicios adicionales

El **Metodo 1 (precio por m2)** funciona como aproximacion rapida cuando no se tiene desglose detallado. Glasify puede ofrecer ambos modos.

Las variables clave (tamano, tipo apertura, vidrio, aislamiento, acabados) corresponden directamente a los campos del modelo en [[entities]].

## Related pages

- [[pricing-formula]] — Formula implementada en el sistema Glasify
- [[ecosistema-participantes]] — Participantes del ecosistema de fabricantes
- [[entities]] — Entidades del dominio (modelos, vidrio, perfiles)
- [[prd]] — Requerimientos del producto
