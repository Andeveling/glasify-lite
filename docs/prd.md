---
post_title: "PRD — Glasify MVP (Cotizador de ventanas en aluminio y PVC)"
author1: "Andrés"
post_slug: "prd-glasify-mvp"
microsoft_alias: "n/a"
featured_image: "/images/glasify-prd-mvp.png"
categories: ["product", "requirements"]
tags: ["PRD", "MVP", "cotizador", "ventanas", "aluminio", "PVC"]
ai_note: "yes"
summary: "Especificación del MVP de Glasify para cotización de ventanas en aluminio y PVC con catálogo por fabricante, reglas de precio por medidas y servicios, y autenticación con Google."
post_date: "2025-09-26"
---

## Objetivo

Definir el MVP de Glasify, una aplicación para que fabricantes/comercios (ej. VitroRojas) publiquen su catálogo de ventanas (aluminio/PVC) con límites técnicos y reglas de precio, y que los usuarios finales generen cotizaciones precisas seleccionando modelo, medidas, vidrio y servicios.

## Alcance del MVP

### Incluye

- Catálogo por fabricante (multi‑tenant, primer cliente: VitroRojas).
- Modelos/series con medidas mínimas y máximas (ancho/alto en mm) y vidrios soportados (p. ej., 4, 5, 6, 12 mm).
- Precio: base por medidas mínimas + costo por mm adicional en ancho + costo por mm adicional en alto.
- Accesorios: valor fijo por modelo (p. ej., kit = 20 USD).
- Servicios opcionales definidos por el fabricante (sin transporte por ahora):
  - Por área (m²), p. ej., instalación.
  - Por perímetro (ml), p. ej., sellos.
  - Precio fijo por ítem.
- Línea adicional configurable (concepto + unidad de medida: unidad, m², ml) para ajustes.
- Flujo de cotización multi‑ítem (varias ventanas), registro de cliente y autenticación con Google + teléfono y dirección/ubicación del proyecto.

### Excluye (MVP)

- Logística/transporte y cálculo de rutas.
- Pasarela de pago y órdenes de compra.
- Gestión avanzada de impuestos multi‑país.
- Diseño de perfiles térmicos/estructurales (cálculo de ingeniería).

## Stakeholders y roles

- Fabricante/Admin (VitroRojas): configura catálogo, modelos, vidrios, servicios, precios y publica.
- Cliente final: arma cotización seleccionando modelos y parámetros; registra datos y envía solicitud.
- Operador comercial (opcional): exporta, envía cotización, hace seguimiento.

## Supuestos y restricciones

- Unidades de medida: mm para dimensiones. Conversión a m y m² según corresponda.
- Moneda configurada por fabricante (USD en el primer cliente). Sin impuestos automáticos; se permite campo de ajuste manual si se requiere.
- Idioma: español (es‑LA). Formato numérico local.
- Compatibilidad con móviles y desktop (responsive).

## Reglas de negocio — precio

Sea un modelo con dimensiones mínimas (Amin, Hmin) y precio base Pbase válido en esas mínimas; para una solicitud (A, H):

### Fórmula principal

- mm adicionales en ancho: ΔA = max(0, A − Amin)
- mm adicionales en alto: ΔH = max(0, H − Hmin)
- Costo por mm en ancho: Ca
- Costo por mm en alto: Ch

Precio por dimensiones:

$$ P_{dim} = P_{base} + C_a \cdot \Delta A + C_h \cdot \Delta H $$

Accesorios (kit fijo por modelo):

$$ P_{acc} = \text{valor\_kit} $$

Servicios (definidos por fabricante) y seleccionados por el cliente:

- Por área (m²): $P_{serv,area} = tarifa\_{m2} \cdot (A/1000) \cdot (H/1000)$
- Por perímetro (ml): $P_{serv,peri} = tarifa\_{ml} \cdot 2\cdot((A/1000)+(H/1000))$
- Precio fijo por ítem: $P_{serv,fijo} = \text{monto}$

Precio total por ítem (sin transporte):

$$ P_{item} = P_{dim} + P_{acc} + \sum P_{servicio} $$

Cotización (N ítems):

$$ P_{total} = \sum_{i=1}^{N} P_{item,i} + \sum_{ajustes\_adicionales} $$

Notas:

- Validar $Amin \le A \le Amax$ y $Hmin \le H \le Hmax$.
- Los vidrios disponibles por modelo definen opciones válidas (p. ej., 4/5/6/12 mm). Si el propósito de vidrio (DVH, low‑e, templado, simple) requiere espesores/armados específicos, limitar opciones.
- Redondeo configurable (2 decimales) y presentación con separador local.

## UI de referencia

La página de ejemplo muestra patrón de formulario con: selección de estilo, opciones de vidrio, campos de ancho/alto en mm, y total dinámico con “Add to basket”. Glasify tomará ese flujo como guía, adaptado a LATAM y a nuestro modelo de servicios y accesorios.

## Flujos principales

### Admin (fabricante)

1. Crea vidrios: nombre, propósito (DVH, low‑e, simple, templado), espesores en mm.
2. Crea modelo: nombre, serie, material, tipo de apertura (sliding, casement, etc.), descripción.
3. Define límites (Amin, Amax, Hmin, Hmax), Pbase, Ca, Ch.
4. Asigna vidrios soportados (espesores).
5. Define accesorios (kit fijo) y servicios (tipo, unidad, tarifa, visible por defecto sí/no).
6. Publica el item en el catálogo.

### Cliente

1. Selecciona fabricante > modelo.
2. Ingresa medidas (A, H) en mm dentro de rango; el sistema valida.
3. Selecciona vidrio (propósito + espesor permitido por modelo).
4. Opcional: marca servicios (instalación por m², sellado por ml, etc.).
5. Agrega ítem a la cotización; repite para más ventanas.
6. Revisa resumen (subtotal por ítem, desglose servicios y accesorios, total general).
7. Autenticación con Google; completa teléfono y dirección/ubicación del proyecto.
8. Envía cotización descrita al admin; recibe confirmación, por el canal o canales Correo, telegram, Whatsapp.

## Requisitos funcionales (user stories + criterios de aceptación)

### Catálogo y modelos

- Como Admin quiero crear modelos con rangos de medidas y reglas de precio para publicarlos.
  - Dado un formulario completo y válido, cuando guardo, entonces el modelo queda en estado “Borrador/Publicado”.
  - No se permite publicar si faltan Pbase, Ca o Ch o límites.

- Como Cliente quiero ver solo vidrios compatibles con el modelo y propósito seleccionado.
  - Dado un modelo, cuando elijo “DVH”, entonces solo veo combinaciones válidas (espesores soportados).

### Cotización

- Como Cliente quiero calcular precio dinámicamente al ingresar medidas y opciones.
  - Dado que ingreso A y H dentro de rango, cuando cambio A/H o servicios, entonces el total se actualiza en <200 ms.

- Como Cliente quiero agregar múltiples ventanas a la cotización.
  - Dado un ítem válido, cuando presiono “Agregar”, entonces se suma con su desglose.

### Registro y envío

- Como Cliente quiero autenticarme con Google y registrar teléfono + dirección del proyecto para enviar la cotización.
  - Dado que ingreso teléfono y dirección válidos, cuando envío, entonces recibo confirmación con ID de cotización.

## Requisitos no funcionales

- Performance: cálculo <200 ms; render <2 s en 4G.
- A11y: navegación por teclado, contraste, labels asociadas.
- i18n/l10n: español LATAM; formatos numéricos/locales.
- Seguridad: autenticación Google OAuth; datos personales cifrados en tránsito.
- Observabilidad: logs de errores en servidor; métricas básicas de uso.

## Modelo de datos (borrador)

- Manufacturer(id, name, currency)
- Model(id, manufacturerId, name, series, material, type, amin, amax, hmin, hmax, pbase, ca, ch, accessoryKitPrice, status)
- GlassType(id, name, purpose: [DVH, low‑e, simple, templado], thicknessMm)
- ModelGlassSupport(modelId, glassTypeId, thicknessMm: number)
- Service(id, manufacturerId, name, type: [area, perimeter, fixed], unit: [unit, m2, ml], rate)
- Quote(id, manufacturerId, userId, status, total, createdAt)
- QuoteItem(id, quoteId, modelId, widthMm, heightMm, glassTypeId, glassThicknessMm, accessoryApplied:boolean, subtotal)
- QuoteItemService(id, quoteItemId, serviceId, qty, unit, amount)
- User(id, email, phone, googleId)
- Address(id, quoteId, line1, city, region, country, geo?:lat/long)

## API/Contrato (borrador)

- GET /api/models?manufacturerId=… → lista de modelos y límites.
- GET /api/models/{id}/glasses → vidrios/espesores soportados.
- POST /api/quotes (crea/borrador) → {quoteId}
- POST /api/quotes/{id}/items (agrega ítem) → desglose calculado y subtotal.
- POST /api/quotes/{id}/submit (requiere auth Google + contacto) → confirma envío.

## Cálculo — pseudocódigo

```
function priceItem({ A, H, Amin, Hmin, Pbase, Ca, Ch, kit, services }) {
  const dA = Math.max(0, A - Amin);
  const dH = Math.max(0, H - Hmin);
  const Pdim = Pbase + Ca * dA + Ch * dH;
  const Pacc = kit ?? 0;
  const Pserv = services.reduce((sum, s) => {
    if (s.type === 'area') return sum + s.rate * (A / 1000) * (H / 1000);
    if (s.type === 'perimeter') return sum + s.rate * 2 * ((A / 1000) + (H / 1000));
    if (s.type === 'fixed') return sum + s.amount;
    return sum;
  }, 0);
  return round2(Pdim + Pacc + Pserv);
}
```

## Métricas de éxito (KPIs)

- Tiempo medio para crear una cotización < 3 min.
- ≥ 80% de cotizaciones con medidas válidas a la primera (sin error de rangos).
- ≥ 50% de usuarios completan registro/Google al enviar cotización.

## Roadmap (MVP → MVP+)

- MVP: catálogo, cálculo, cotización, auth Google, datos de contacto, exportación PDF/Email (simple).
- MVP+: transporte, impuestos/regiones, duplicar cotizaciones, multi‑moneda, plantillas de márgenes comerciales.

## Riesgos y mitigación

- Confusión de unidades (mm vs cm): UI y placeholders claros; validaciones en tiempo real.
- Variabilidad de vidrio DVH/templado: catálogo bien acotado por modelo; warnings si no disponible.
- Precios no actualizados: controles de publicación y estados de vigencia por modelo.

## Anexo A — Ejemplo numérico

- Modelo: Bella Sliding — Amin=600, Hmin=400, Pbase=120 USD, Ca=0.05 USD/mm, Ch=0.04 USD/mm, kit=20 USD.
- Medidas: A=900 mm, H=700 mm → ΔA=300, ΔH=300.
- Servicios: instalación 15 USD/m²; sellado 2 USD/ml.

Calculo:

- Pdim = 120 + 0.05×300 + 0.04×300 = 120 + 15 + 12 = 147 USD.
- Pacc = 20 USD → 167 USD.
- Área = 0.9×0.7 = 0.63 m² → 9.45 USD.
- Perímetro = 2×(0.9+0.7)=3.2 ml → 6.4 USD.
- Pitem ≈ 167 + 9.45 + 6.4 = 182.85 USD.

## Anexo B — UI de referencia

- Campos clave: ancho/alto (mm), opciones de vidrio, accesorios/servicios, total dinámico y botón para agregar.
