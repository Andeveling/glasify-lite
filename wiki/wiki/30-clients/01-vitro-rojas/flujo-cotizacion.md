# Flujo de Cotización — Vitro Rojas (Estado Actual)

**Summary**: Documentacion del flujo de cotizacion actual de Vitro Rojas — proceso manual con despiece en papel, calculo a ciegas, y como Glasify permite transitar del Metodo 1 al Metodo 2.

**Sources**: (source: dominio-vitro-rojas)

**Last updated**: 2026-04-13

---

## El Problema: Cotizar con Metodo 1 a ciegas

Juan (Vitro Rojas) recibe solicitudes de clientes a traves de tres canales digitales:

- Instagram
- Facebook
- WhatsApp

El proceso actual es completamente manual:

1. El cliente contacta por pauta digital
2. Juan toma requerimientos y medidas a papel y lapiz
3. Juan hace un **despiece** item por item
4. Juan busca precios en listas de proveedores y calcula a mano
5. Juan aplica el Metodo 1 (precio por m2) por flexibilidad
6. **No sabe con certeza si el precio cubre sus costos reales**

El resultado: cotizaciones lentas y margen de error alto sobre la rentabilidad real de cada trabajo.

---

## Despiece — Como Juan Calcula las Partes

Cuando Juan recibe un pedido, desglosa cada ventana en sus componentes fisicos. Este es el nivel de detalle que maneja:

### Despiece de Ventana Corrediza Tipica

| Componente | Cantidad | Medida |
|------------|----------|--------|
| Perfil marco horizontal | 2 | 1140mm c/u |
| Perfil marco vertical | 2 | 1140mm c/u |
| Perfil hoja (largos) | 4 | 986mm c/u |
| Perfil hoja (anchos) | 4 | 500mm c/u |
| Perfil de cruce | 2 | 986mm c/u |
| Ruedas | 4 | 2 por hoja |
| Cierres embutidos | 2 | - |
| Contracierres | 2 | - |
| Escuadras de ensamblaje | 8-12 | - |
| Escuadras de alineacion | 4-8 | - |
| Felpa (todos los perfiles) | - | Segun largo total |
| Cortavientos sup/inf | 2 | - |
| Tapas de cruce | 2 | - |
| Calzos C1 y C2 | - | Segun vidrio |
| Vidrio 10 o 22mm | 1 | 1000x500mm aprox |

Este desglose es la base para el **Metodo 2**, pero Juan lo usa solo como referencia, no como calculo de costo real.

---

## Lista de Precios de Proveedor (Referencia)

Juan tiene esta lista de precios de Extralum para calcular costos de material:

### Perfiles (por unidad de 5.8 m)

| Perfil | Precio USD |
|--------|------------|
| Hoja ventana | $35.00 |
| Marco 2 vias | $45.00 |
| Traslape | $15.00 |
| Hoja malla | $22.00 |
| Cerradura | $3.00 |
| Tope | $0.30 |
| Ruedas malla | $1.00 |
| Ruedas hoja | $3.00 |
| Escuadras de resorte | $1.00 |
| Escuadras de alineamiento | $0.10 |

### Por Metro Lineal

| Item | Precio USD/m |
|------|--------------|
| Metro lineal perfil | $0.30 |
| Metro felpa | $0.30 |
| Guia traslape | $0.50 |
| Escuadras malla | $0.40 |

---

## Donde Falla el Proceso Actual

### Dolor 1: Tiempo

Hacer el despiece a mano para cada ventana toma entre 15 y 30 minutos por item. Un proyecto con 10 ventanas = 3-5 horas solo en calculo de partes.

### Dolor 2: Error humano

Con tantos items y precios pequenos, es facil olvidar un componente, escribir mal una medida, o duplicar un costo.

### Dolor 3: Ceguera de Margen

Con el Metodo 1 (precio por m2), Juan aplica un margen "que le parece bien" pero **no sabe si cubre el costo real de materiales + MO + gastos**. Un precio puede verse rentable por m2 pero ser un fracaso en costo real de fabricacion.

### Dolor 4: Imposibilidad de Comparar

Sin desglose de costo real, Juan no puede responder rapido preguntas como:
- "Si cambio vidrio simple por laminado, cuanto sube el precio?"
- "Cual es mi costo real si el cliente quiere 3 paños en vez de 2?"

---

## Como Glasify Resuelve Esto

Glasify permite a Juan moverse del Metodo 1 al **Metodo 2 (costeo por componentes)** sin perder velocidad.

### El Flujo Ideal con Glasify

```
Cliente contacta por WhatsApp
        |
        v
Juan ingresa dimensiones y modelo en Glasify
        |
        v
Glasify genera despiece automaticamente
(perfil + vidrio + accesorios + MO)
        |
        v
Glasify calcula costo real con precios de proveedor
        |
        v
Juan aplica margen y envia cotizacion
(15 segundos en vez de 15-30 minutos)
```

### Lo que Glasify Calcula Automaticamente

#### 1. Perfil (desglose por metro lineal)

Glasify conoce la geometria de cada modelo (marco, hoja, cruiser) y calcula:

```
Perimetro total por perfil (mm)
Metros lineales por tipo de perfil
Costo = metros lineales x precio proveedor por metro
```

Ejemplo para VC Panama 2 Panos (1140 x 1140mm):

```
Marco horizontal: 2 x 1140mm
Marco vertical: 2 x 1140mm
Hoja largos: 4 x 986mm
Hoja anchos: 4 x 500mm
Crucero: 2 x 986mm

Perfiles tomados de la geometria del modelo en [[entities]]
Precios de proveedor configurable en TenantConfig
```

#### 2. Vidrio (area efectiva)

Glasify aplica descuentos de fabrication (dimensiones del vidrio = dimensiones de abertura menos marcos) y calcula:

```
Area vidrio (m2) = (ancho - descuento) x (alto - descuento)
Costo = area x precio por m2 del tipo de vidrio
```

#### 3. Accesorios (fijos por modelo)

Glasify usa `accessoryPrice` que ya esta configurado por modelo:

| Modelo | accessoryPrice USD |
|--------|--------------------|
| VC Panama 2 Paños | $45 |
| VC Panama 3 Paños | $65 |
| Europa Clasica 2 Paños | $55 |
| Europa Clasica 3 Paños | $75 |

#### 4. Servicios adicionales

Instalacion, transporte, demolicion — configurados como servicios en la cotizacion.

---

## Comparacion: Sin Glasify vs Con Glasify

| Aspecto | Sin Glasify (Actual) | Con Glasify |
|---------|---------------------|-------------|
| Tiempo por cotizacion | 15-30 min | 15-30 seg |
| Metodo de calculo | Metodo 1 (m2 a ciegas) | Metodo 2 (desglose real) |
| Sabe costo real? | No | Si |
| Puede ajustar vidrio/herrajes rapidamente? | No | Si |
| Error en despiece | Alto | Minimo |
| Margen de ganancia | Incierto | Calculado |

---

## Configuracion Necesaria en Glasify

Para que Juan pueda usar el Metodo 2, necesita en Glasify:

### 1. Precios de proveedor por perfil

En la configuracion del modelo o del tenant:

```
perfil-marco: { precioPorMetroLineal: 0.30, unidad: "USD/m" }
perfil-hoja: { precioPorMetroLineal: 0.30, unidad: "USD/m" }
felpa: { precioPorMetroLineal: 0.30, unidad: "USD/m" }
rueda-hoja: { precioUnitario: 3.00, unidad: "USD" }
cierre-embutido: { precioUnitario: 3.00, unidad: "USD" }
escuadra-ensamblaje: { precioUnitario: 0.10, unidad: "USD" }
...
```

### 2. Precio de vidrio por m2

```
vidrio-simple-6mm: { precioPorM2: 25.00, unidad: "USD/m2" }
vidrio-laminado-33.1mm: { precioPorM2: 45.00, unidad: "USD/m2" }
vidrio-dvh-12.5mm: { precioPorM2: 65.00, unidad: "USD/m2" }
```

### 3. Margen objetivo por modelo

Ya esta configurado en la tabla de modelos. Juan lo ajusta segun proyecto.

---

## Related pages

- [[30-clients/01-vitro-rojas/profile]] — Perfil completo de Vitro Rojas
- [[30-clients/01-vitro-rojas/presets]] — Configuracion de seeding en Glasify
- [[calculo-precios-pymes-latam]] — Los tres metodos de calculo en fabricas LATAM
- [[pricing-formula]] — Formula de calculo implementada en Glasify
- [[entities]] — Modelo de datos (GlassModel, GlassType, ProfileConfig)
