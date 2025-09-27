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

## Resumen ejecutivo

Glasify MVP permitirá a fabricantes publicar modelos de ventanas con reglas de precio por medidas y servicios, y a clientes generar cotizaciones precisas y enviarlas al fabricante. El MVP cubre catálogo, cálculo de precio dinámico, flujo multi-ítem, autenticación con Google y envío de cotizaciones. Está diseñado para desplegarse en ~6 semanas con un equipo pequeño y comenzar con un primer cliente (VitroRojas).

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

Sea un modelo con dimensiones mínimas (minWidthMm, minHeightMm) y precio base basePrice válido en esas mínimas; para una solicitud (widthMm, heightMm):

### Fórmula principal

- mm adicionales en ancho: deltaWidth = max(0, widthMm - minWidthMm)
- mm adicionales en alto: deltaHeight = max(0, heightMm - minHeightMm)
- Costo por mm en ancho: costPerMmWidth
- Costo por mm en alto: costPerMmHeight

Precio por dimensiones:

$$ P_{dim} = basePrice + costPerMmWidth \cdot deltaWidth + costPerMmHeight \cdot deltaHeight $$

Accesorios (kit fijo por modelo):

$$ P_{acc} = accessoryKitPrice $$

Servicios (definidos por fabricante) y seleccionados por el cliente:

- Por área (m²): $P_{service,area} = rate_{m2} \cdot (widthMm/1000) \cdot (heightMm/1000)$
- Por perímetro (ml): $P_{service,perimeter} = rate_{ml} \cdot 2\cdot((widthMm/1000)+(heightMm/1000))$
- Precio fijo por ítem: $P_{service,fixed} = \text{amount}$

Precio total por ítem (sin transporte):

$$ P_{item} = P_{dim} + P_{acc} + \sum P_{service} $$

Cotización (N ítems):

$$ P_{total} = \sum_{i=1}^{N} P_{item,i} + \sum_{adjustments} $$

Notas:

- Validar $minWidthMm \le widthMm \le maxWidthMm$ y $minHeightMm \le heightMm \le maxHeightMm$.
- Los vidrios disponibles por modelo definen opciones válidas (p. ej., 4/5/6/12 mm). Si el propósito de vidrio (DVH, low‑e, templado, simple) requiere espesores/armados específicos, limitar opciones.
- Redondeo configurable (2 decimales) y presentación con separador local.

## UI de referencia

La página de ejemplo muestra patrón de formulario con: selección de estilo, opciones de vidrio, campos de ancho/alto en mm, y total dinámico con “Add to basket”. Glasify tomará ese flujo como guía, adaptado a LATAM y a nuestro modelo de servicios y accesorios.

## Flujos principales

### Admin (fabricante)

1. Crea vidrios: nombre, propósito (DVH, low‑e, simple, templado), espesores en mm.
2. Crea modelo: nombre, serie, material, tipo de apertura (sliding, casement, etc.), descripción.
3. Define límites (minWidthMm, maxWidthMm, minHeightMm, maxHeightMm), basePrice, costPerMmWidth, costPerMmHeight.
4. Asigna vidrios soportados (espesores).
5. Define accesorios (kit fijo) y servicios (tipo, unidad, tarifa, visible por defecto sí/no).
6. Publica el item en el catálogo.

### Cliente

1. Selecciona fabricante > modelo.
2. Ingresa medidas (`widthMm`, `heightMm`) en mm dentro de rango; el sistema valida.
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
  - No se permite publicar si faltan basePrice, costPerMmWidth o costPerMmHeight o límites.

- Como Cliente quiero ver solo vidrios compatibles con el modelo y propósito seleccionado.
  - Dado un modelo, cuando elijo “DVH”, entonces solo veo combinaciones válidas (espesores soportados).

### Cotización

- Como Cliente quiero calcular precio dinámicamente al ingresar medidas y opciones.
  - Dado que ingreso `widthMm` y `heightMm` dentro de rango, cuando cambio dimensiones o servicios, entonces el total se actualiza en <200 ms.

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
- Model(id, manufacturerId, name, series, material, type, minWidthMm, maxWidthMm, minHeightMm, maxHeightMm, basePrice, costPerMmWidth, costPerMmHeight, accessoryKitPrice, status)
- GlassType(id, name, purpose: [DVH, low‑e, simple, templado], thicknessMm)
- ModelGlassSupport(modelId, glassTypeId, thicknessMm: number)
- Service(id, manufacturerId, name, type: [area, perimeter, fixed], unit: [unit, m2, ml], rate)
- Quote(id, manufacturerId, userId, status, total, createdAt)
- QuoteItem(id, quoteId, modelId, widthMm, heightMm, glassTypeId, glassThicknessMm, accessoryApplied:boolean, subtotal)
- QuoteItemService(id, quoteItemId, serviceId, qty, unit, amount)
- User(id, email, phone, googleId)
- Address(id, quoteId, line1, city, region, country, geo?:lat/long)

## API/Contrato (borrador)

Nota: ver la especificación detallada más abajo (rutas en /api/v1). Ejemplos rápidos:

- GET /api/v1/manufacturers/{id}/models?status=published → lista de modelos y límites.
- GET /api/v1/models/{id}/glasses → vidrios/espesores soportados.
- POST /api/v1/quotes (crea/borrador) → {quoteId}
- POST /api/v1/quotes/{id}/items (agrega ítem) → desglose calculado y subtotal.
- POST /api/v1/quotes/{id}/submit (requiere auth Google + contacto) → confirma envío.

## Cálculo — pseudocódigo

```
function priceItem({ widthMm, heightMm, minWidthMm, minHeightMm, basePrice, costPerMmWidth, costPerMmHeight, accessoryKitPrice, services }) {
  const deltaWidth = Math.max(0, widthMm - minWidthMm);
  const deltaHeight = Math.max(0, heightMm - minHeightMm);
  const dimPrice = basePrice + costPerMmWidth * deltaWidth + costPerMmHeight * deltaHeight;
  const accPrice = accessoryKitPrice ?? 0;
  const servicePrice = services.reduce((sum, s) => {
    if (s.type === 'area') return sum + s.rate * (widthMm / 1000) * (heightMm / 1000);
    if (s.type === 'perimeter') return sum + s.rate * 2 * ((widthMm / 1000) + (heightMm / 1000));
    if (s.type === 'fixed') return sum + s.amount;
    return sum;
  }, 0);
  return round2(dimPrice + accPrice + servicePrice);
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

- Modelo: Bella Sliding — minWidthMm=600, minHeightMm=400, basePrice=120 USD, costPerMmWidth=0.05 USD/mm, costPerMmHeight=0.04 USD/mm, accessoryKitPrice=20 USD.
- Medidas: widthMm=900, heightMm=700 → deltaWidth=300, deltaHeight=300.
- Servicios: instalación 15 USD/m²; sellado 2 USD/ml.
 
Cálculo:

- dimPrice = 120 + 0.05×300 + 0.04×300 = 120 + 15 + 12 = 147 USD.
- accPrice = 20 USD → 167 USD.
- Área = 0.9×0.7 = 0.63 m² → 9.45 USD.
- Perímetro = 2×(0.9+0.7)=3.2 ml → 6.4 USD.
- itemPrice ≈ 167 + 9.45 + 6.4 = 182.85 USD.

## Anexo B — UI de referencia

- Campos clave: ancho/alto (mm), opciones de vidrio, accesorios/servicios, total dinámico y botón para agregar.

## Anexo C — API/Contrato (especificación detallada)

Nota: todas las rutas devuelven JSON y usan autenticación basada en JWT para endpoints administrativos. Los endpoints públicos pueden usarse en modo lectura sin auth para catálogos "publicados".

- GET /api/v1/manufacturers
  - Query: none
  - Response: 200 [{ id, name, currency }]

- GET /api/v1/manufacturers/{id}/models
  - Query: ?status=published
  - Response: 200 [{ id, name, series, material, type, minWidthMm, maxWidthMm, minHeightMm, maxHeightMm, basePrice, costPerMmWidth, costPerMmHeight, accessoryKitPrice, status }]

- GET /api/v1/models/{id}/glasses
  - Response: 200 [{ glassTypeId, name, purpose, thicknessMm }]

- POST /api/v1/quotes
  - Auth: optional (creates draft tied to session); if authenticated attaches userId
  - Body: { manufacturerId, currency? }
  - Response: 201 { quoteId, status: 'draft', createdAt }

- POST /api/v1/quotes/{quoteId}/items
  - Body: { modelId, widthMm, heightMm, glassTypeId, glassThicknessMm, accessoryApplied:boolean, services: [{ serviceId, qty?, unit?, amount? }] }
  - Server: valida rangos (minWidthMm<=widthMm<=maxWidthMm, minHeightMm<=heightMm<=maxHeightMm) y compatibilidad de vidrio; calcula subtotal usando reglas de precio; retorna 200 { itemId, subtotal, breakdown }

- GET /api/v1/quotes/{quoteId}
  - Response: 200 { quoteId, items:[], subtotal, adjustments:[], total }

- POST /api/v1/quotes/{quoteId}/submit
  - Auth: required (Google OAuth or local JWT)
  - Body: { user: { email, phone }, address: { line1, city, region, country, lat?, lng? } }
  - Server: valida contacto, marca quote como 'submitted', notifica al fabricante por canales configurados; retorna 200 { quoteId, status: 'submitted', sentAt }

- POST /api/v1/admin/models (admin only)
  - Body: payload completo del modelo (ver DDL/JSON schema)
  - Response: 201 { modelId }

### Payloads de ejemplo

Crear cotización (draft):

POST /api/v1/quotes
Body:
{
  "manufacturerId": "11111111-1111-1111-1111-111111111111",
  "currency": "USD"
}

Agregar ítem:

POST /api/v1/quotes/{quoteId}/items
Body:
{
  "modelId": "22222222-2222-2222-2222-222222222222",
  "widthMm": 900,
  "heightMm": 700,
  "glassTypeId": "33333333-3333-3333-3333-333333333333",
  "glassThicknessMm": 6,
  "accessoryApplied": true,
  "services": [
    { "serviceId": "44444444-4444-4444-4444-444444444444" }
  ]
}

Respuesta (server calcula subtotal):
{
  "itemId": "55555555-5555-5555-5555-555555555555",
  "subtotal": 182.85,
  "breakdown": {
    "basePrice": 120,
    "deltaWidth": 300,
    "deltaHeight": 300,
    "dimPrice": 147,
    "accPrice": 20,
    "servicePrice": 15.85
  }
}

Enviar cotización:

POST /api/v1/quotes/{quoteId}/submit
Body:
{
  "user": { "email": "cliente@ejemplo.com", "phone": "+5491123456789" },
  "address": { "line1": "Av. Siempre Viva 123", "city": "CABA", "region": "Buenos Aires", "country": "AR" }
}

Respuesta:
{
  "quoteId": "...",
  "status": "submitted",
  "sentAt": "2025-09-27T12:34:56Z"
}

## Anexo D — Esquema de base de datos (DDL) — Postgres (borrador)

-- Tables principales (DDL simplificado)

CREATE TABLE manufacturers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE glass_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL, -- enum: DVH, low-e, simple, templado
  thickness_mm INTEGER NOT NULL
);

CREATE TABLE models (
  id UUID PRIMARY KEY,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  series TEXT,
  material TEXT,
  type TEXT,
  min_width_mm INTEGER NOT NULL,
  max_width_mm INTEGER NOT NULL,
  min_height_mm INTEGER NOT NULL,
  max_height_mm INTEGER NOT NULL,
  base_price NUMERIC(12,2) NOT NULL,
  cost_per_mm_width NUMERIC(12,6) NOT NULL,
  cost_per_mm_height NUMERIC(12,6) NOT NULL,
  accessory_kit_price NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- draft|published
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE model_glass_support (
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  glass_type_id UUID REFERENCES glass_types(id) ON DELETE CASCADE,
  thickness_mm INTEGER NOT NULL,
  PRIMARY KEY (model_id, glass_type_id, thickness_mm)
);

CREATE TABLE services (
  id UUID PRIMARY KEY,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- area|perimeter|fixed
  unit TEXT NOT NULL, -- unit|m2|ml
  rate NUMERIC(12,4) NOT NULL,
  visible BOOLEAN DEFAULT TRUE
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  google_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft|submitted|cancelled
  currency TEXT NOT NULL,
  total NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE quote_items (
  id UUID PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id),
  width_mm INTEGER NOT NULL,
  height_mm INTEGER NOT NULL,
  glass_type_id UUID,
  glass_thickness_mm INTEGER,
  accessory_applied BOOLEAN DEFAULT FALSE,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE quote_item_services (
  id UUID PRIMARY KEY,
  quote_item_id UUID REFERENCES quote_items(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  qty NUMERIC(12,4) DEFAULT 1,
  unit TEXT,
  amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  line1 TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7)
);

-- Indexes y constraints adicionales se definirán en implementaciones posteriores.

## Anexo E — Notas operativas

### Unidades y redondeo

- Dimensiones en mm. Conversión: m = mm/1000; m² = (widthMm/1000) * (heightMm/1000); ml = 2*((widthMm/1000)+(heightMm/1000)).
- Redondeo configurable a 2 decimales (half-up) para subtotales y totales.
- Mostrar números con formato local es-LA.

### Validez (TTL) e idempotencia

- Validez sugerida de la cotización: 15 días (configurable por fabricante).
- Para REST, soportar Idempotency-Key en creación de quotes y items para evitar duplicados en reintentos.

### Snapshot de precios

- Al agregar un ítem, guardar en quote_items un snapshot de reglas relevantes (basePrice, costPerMmWidth, costPerMmHeight, accessoryKitPrice) y tarifas de servicios usadas, para auditoría y consistencia.

## Criterios de aceptación extendidos y QA checklist

 - Validaciones de modelo:
  - No se puede publicar un modelo sin basePrice, costPerMmWidth, costPerMmHeight y límites completos.
  - Al crear/modificar modelos, los campos minWidthMm/maxWidthMm/minHeightMm/maxHeightMm deben ser enteros y minWidthMm<=maxWidthMm, minHeightMm<=maxHeightMm.

 - Validaciones en ítems de cotización:
  - `widthMm` y `heightMm` deben ser enteros dentro de los rangos del modelo (`minWidthMm`..`maxWidthMm`, `minHeightMm`..`maxHeightMm`).
  - El `glassTypeId` debe ser compatible con el modelo (existir en `model_glass_support`).
  - El cálculo del subtotal debe ser reproducible por una función pura en el servidor (`priceItem`) y devolver `breakdown`.

- Performance y tolerancias:
  - Cálculo por ítem < 200 ms en promedio bajo carga normal (simulación local).
  - Respuesta de endpoints de catálogo < 500 ms.

- Seguridad:
  - Endpoints de administración requieren JWT con rol admin.
  - Datos personales enviados con /submit deben ser validados y sanitizados.

- Tests automáticos mínimos (sugeridos):
  - Unit tests para priceItem con casos: medidas en mínimos, en máximos, fuera de rango (error), combinaciones de servicios.
  - Integration test: flujo crear quote -> agregar item -> obtener quote -> submit (mock de notificaciones).

### Casos de prueba unitarios (detallados)

Usar la función pura priceItem(inputs) que reciba:
{ widthMm, heightMm, minWidthMm, maxWidthMm, minHeightMm, maxHeightMm, basePrice, costPerMmWidth, costPerMmHeight, accessoryKitPrice, services }

1) Caso: medidas en mínimos
 - Input: widthMm=600, heightMm=400, minWidthMm=600, minHeightMm=400, basePrice=120, costPerMmWidth=0.05, costPerMmHeight=0.04, accessoryKitPrice=20, services=[]
 - Esperado: dimPrice=120, accPrice=20, servicePrice=0, subtotal=140.00

2) Caso: ejemplo Anexo A (happy path)
 - Input: widthMm=900, heightMm=700, minWidthMm=600, minHeightMm=400, basePrice=120, costPerMmWidth=0.05, costPerMmHeight=0.04, accessoryKitPrice=20, services=[{type:'area', rate:15}]
 - Cálculo: deltaWidth=300, deltaHeight=300, dimPrice=147, accPrice=20, servicePrice=15*(0.9)*(0.7)=9.45 → subtotal ≈ 176.45 (redondear a 2 decimales según configuración)

3) Caso: perímetro + área
 - Input: services=[{type:'area', rate:15},{type:'perimeter', rate:2}]
 - Esperado: servicePrice=9.45 + 6.4 = 15.85 → subtotal ≈ 182.85 (coincide con Anexo A)

4) Caso: fuera de rango (error)
 - Input: widthMm=500 (< minWidthMm)
 - Esperado: lanzar error / devolver 400 con mensaje 'width out of range'

5) Caso: sin kit
 - accessoryApplied=false → accPrice=0

6) Caso: servicios fijos
 - service { type:'fixed', amount: 50 } → servicePrice añade 50

7) Caso: validaciones de formato
 - Inputs no numéricos o null deben devolver 400 con campo inválido

Implementar tests parametrizados que cubran estas combinaciones y que verifiquen el desglose devuelto.

### Tests de integración (flujo)

- Crear fabricante y publicar un modelo con límites y vidrios.
- Crear cotización (POST /quotes) → obtener quoteId.
- Agregar ítem válido (POST /quotes/{id}/items) → comprobar subtotal y breakdown coinciden con la función priceItem.
- Obtener quote (GET /quotes/{id}) → verificar totals y que item aparece en la lista.
- Enviar cotización (POST /quotes/{id}/submit) con user y address válidos → verificar estado 'submitted' y que el fabricante recibió notificación (mock).

### Pruebas de performance

- Script de carga simulado (k6 o Artillery): 100 concurrent users realizando request de cálculo de ítem durante 1 minuto; medir P95 < 200 ms.
- Smoke test en CI: ejecutar 10 requests secuenciales de cálculo y comprobar tiempo medio < 200 ms.

### Matriz de aceptación (resumen)

- Catálogo y modelos: PASS si CRUD de modelos funciona y publicación bloquea modelos incompletos.
- Cálculo: PASS si priceItem devuelve subtotales reproducibles y tests unitarios pasan.
- Validaciones: PASS si inputs fuera de rango devuelven 400 y mensajes claros.
- Envío: PASS si submit requiere auth y cambia estado a 'submitted' y genera notificación.


## Checklist para release MVP

- Documentación del API publicada en /docs/api.md
- Migraciones DDL revisadas y probadas en staging
- Pruebas unitarias e integraciones cubriendo cálculos y validaciones
- Google OAuth configurado en entorno de staging
- Monitoreo básico (errores + métricas de latencia)

## Siguientes pasos (próximas tareas)

1. Implementar la función priceItem en el servicio de quotes y cubrirla con unit tests.
2. Crear migraciones SQL basadas en el DDL propuesto y ejecutar en staging.
3. Implementar endpoints: POST /quotes, POST /quotes/{id}/items, POST /quotes/{id}/submit.
4. Construir UI de formulario de cotización con validaciones cliente y cálculo local (para UX instantánea) y verificación en servidor al agregar.

## Roadmap y plan de implementación (MVP)

Objetivo: entregar un MVP funcional que permita a VitroRojas publicar modelos y a clientes generar y enviar cotizaciones.

Milestone 1 — Fundamentos (2 semanas)
- Tareas:
  - Implementar DDL y migraciones.
  - Implementar modelo server: fabricantes, modelos, vidrios, servicios CRUD (admin).
  - Implementar priceItem y tests unitarios.
- Entregables: migraciones ejecutadas en staging, colección de tests unitarios.

Milestone 2 — Cotización básica e integración (2 semanas)
- Tareas:
  - Endpoints: POST /quotes, POST /quotes/{id}/items, GET /quotes/{id}.
  - Validaciones servidor-side y cálculo de ítems.
  - UI: formulario de cotización (cliente) con cálculo local y botón "Agregar".
- Entregables: flujo completo crear quote -> agregar ítems -> ver resumen.

Milestone 3 — Envío y autenticación (1 semana)
- Tareas:
  - Integrar Google OAuth para submit.
  - Endpoint POST /quotes/{id}/submit: validar contacto y notificar fabricante (email/mocks para MVP).
  - Guardar dirección y telefono.
- Entregables: cotizaciones enviadas con status 'submitted' y notificaciones.

Milestone 4 — Harden, QA y despliegue (1 semana)
- Tareas:
  - Pruebas de integración y performance (smoke + carga ligera).
  - Revisión de seguridad y roles admin.
  - Documentación API mínima (/docs/api.md) y migraciones.
- Entregables: build estable, tests en CI, deploy a staging.

Estimaciones (equipo pequeño: 2 devs fullstack + 0.5 QA):
- Total aproximado: 6 semanas calendario (incluye buffer y QA).

Dependencias críticas:
- Acceso a credenciales de Google OAuth para staging.
- Base de datos Postgres en staging para migraciones.
- Cuenta de correo o servicio de notificaciones para pruebas de envío (puede ser mock SMTP o un webhook).

Riesgos y mitigaciones (técnicos):
- Riesgo: falta de datos del fabricante (modelos/vidrios) → Mitigación: script de seed para VitroRojas.
- Riesgo: cálculos inconsistentes cliente/servidor → Mitigación: mantener priceItem como librería compartida (isomórfica) o tests e2e que verifiquen ambos lados.


---

Fin del PRD extendido.

## Entregables (al cierre del MVP)

- Repositorio con migraciones y modelo de datos aplicado en staging.
- Endpoints documentados en /docs/api.md y Postman collection (opcional).
- Implementación de priceItem con tests unitarios y cobertura básica.
- UI mínima para crear cotizaciones y enviar (responsive).
- Configuración de Google OAuth en staging y pruebas de envío.

