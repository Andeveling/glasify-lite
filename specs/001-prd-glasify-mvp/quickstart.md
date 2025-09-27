# Quickstart — Validar el cotizador Glasify MVP

Esta guía te permite validar completamente el sistema de cotización de vidrios, siguiendo el flujo end-to-end desde la configuración hasta el envío de cotizaciones.

## 📋 Requisitos Previos

- Node.js 18+ y pnpm instalado
- PostgreSQL corriendo (local o Docker)
- Variables de entorno configuradas en `.env`

## 🚀 Configuración Inicial

### 1. Preparar la Base de Datos

```bash
# Iniciar PostgreSQL (si usas el script incluido)
./start-database.sh

# Ejecutar migraciones de Prisma
pnpm db:generate

# Opcional: Sembrar datos de ejemplo
pnpm db:seed
```

### 2. Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`

## 🏗️ Flujo Completo de Validación

### Paso 1: Admin - Publicar un Modelo de Vidrio

**Endpoint:** `admin.model-upsert`

```typescript
// Payload de ejemplo para crear/actualizar un modelo
const modelPayload = {
  manufacturerId: "cm1manufacturer123456789ab", // ID del fabricante
  name: "Ventana Premium 2024",
  status: "published", // "draft" | "published"
  minWidthMm: 300,
  maxWidthMm: 2000,
  minHeightMm: 400,
  maxHeightMm: 1800,
  basePrice: 150000, // Precio base en centavos (COP)
  costPerMmWidth: 60, // Costo por mm de ancho
  costPerMmHeight: 45, // Costo por mm de alto
  accessoryPrice: 20000, // Precio de accesorios (opcional)
  compatibleGlassTypeIds: [
    "cm1glasstype123456789abc1",
    "cm1glasstype123456789abc2"
  ]
};

// Respuesta esperada
{
  modelId: "cm1model123456789abcdef0",
  status: "published",
  message: "Modelo creado exitosamente"
}
```

**Validaciones esperadas:**
- ✅ `minWidthMm < maxWidthMm` y `minHeightMm < maxHeightMm`
- ✅ Precios y costos ≥ 0
- ✅ Al menos un tipo de vidrio compatible
- ✅ Mensajes de error en español

### Paso 2: Usuario - Calcular Precio de Item

**Endpoint:** `quote.calculate-item`

```typescript
// Cálculo de precio para un item específico
const calculatePayload = {
  modelId: "cm1model123456789abcdef0",
  widthMm: 1000, // Ancho en milímetros
  heightMm: 800,  // Alto en milímetros
  glassTypeId: "cm1glasstype123456789abc1",
  services: [
    {
      serviceId: "cm1service123456789abc",
      quantity: 1 // Opcional para servicios fijos
    }
  ],
  adjustments: [
    {
      concept: "Descuento cliente nuevo",
      unit: "unit", // "unit" | "sqm" | "ml"
      sign: "negative", // "positive" | "negative"
      value: 10000 // Valor en centavos
    }
  ]
};

// Respuesta esperada
{
  dimPrice: 182000,    // Precio por dimensiones
  accPrice: 20000,     // Precio de accesorios
  services: [
    {
      serviceId: "cm1service123456789abc",
      unit: "ml",
      quantity: 3.6,     // Calculado automáticamente
      amount: 9000       // Cantidad × rate del servicio
    }
  ],
  adjustments: [
    {
      concept: "Descuento cliente nuevo",
      amount: -10000     // Negativo para descuentos
    }
  ],
  subtotal: 201000     // Suma de todos los componentes
}
```

**Validaciones de Performance:**
- ✅ **Tiempo de cálculo < 200ms** (requerimiento crítico)
- ✅ Cálculos exactos con redondeo a 2 decimales
- ✅ Validación de dimensiones dentro de límites del modelo

### Paso 3: Usuario - Agregar Item a Cotización

**Endpoint:** `quote.add-item`

```typescript
// Usar el mismo payload del cálculo + quoteId opcional
const addItemPayload = {
  ...calculatePayload,
  quoteId: "cm1quote123456789abcdef" // Opcional: omitir para nueva cotización
};

// Respuesta esperada
{
  quoteId: "cm1quote123456789abcdef0", // Nuevo ID si no se proporcionó
  itemId: "cm1item123456789abcdef0",
  subtotal: 201000
}
```

**Validaciones:**
- ✅ Nueva cotización si no se proporciona `quoteId`
- ✅ Agregar a cotización existente si se proporciona `quoteId` válido
- ✅ `subtotal` debe coincidir con el cálculo previo

### Paso 4: Usuario - Agregar Items Adicionales (Opcional)

```typescript
// Agregar segundo item a la misma cotización
const secondItemPayload = {
  quoteId: "cm1quote123456789abcdef0", // Usar ID de cotización existente
  modelId: "cm1model123456789abcdef0",
  widthMm: 1200,
  heightMm: 1000,
  glassTypeId: "cm1glasstype123456789abc1",
  services: [],
  adjustments: []
};

// La cotización ahora tendrá múltiples items
```

### Paso 5: Usuario - Enviar Cotización

**Endpoint:** `quote.submit`

```typescript
const submitPayload = {
  quoteId: "cm1quote123456789abcdef0",
  contact: {
    phone: "+57 300 123 4567",        // Formatos válidos de teléfono
    address: "Calle 123 #45-67, Bogotá, Colombia"
  }
};

// Respuesta esperada
{
  quoteId: "cm1quote123456789abcdef0",
  status: "sent"
}
```

**Validaciones:**
- ✅ Formatos de teléfono colombianos aceptados
- ✅ Dirección requerida y no vacía
- ✅ Mock de email enviado (no email real en MVP)
- ✅ Estado de cotización cambia a "sent"

### Paso 6: Validar Catálogo Público

**Endpoint:** `catalog.list-models`

```typescript
const catalogPayload = {
  manufacturerId: "cm1manufacturer123456789ab"
};

// Respuesta esperada
[
  {
    id: "cm1model123456789abcdef0",
    name: "Ventana Premium 2024",
    status: "published",
    minWidthMm: 300,
    maxWidthMm: 2000,
    minHeightMm: 400,
    maxHeightMm: 1800,
    basePrice: 150000,
    costPerMmWidth: 60,
    costPerMmHeight: 45,
    accessoryPrice: 20000,
    compatibleGlassTypeIds: ["cm1glasstype123456789abc1"],
    createdAt: "2025-09-27T16:30:00.000Z",
    updatedAt: "2025-09-27T16:30:00.000Z"
  }
]
```

**Validaciones:**
- ✅ Solo modelos con status "published" son listados
- ✅ Datos completos del modelo disponibles
- ✅ Performance < 500ms para catálogos

## 🧪 Ejecutar Tests de Validación

### Tests de Contrato (API)
```bash
# Validar todos los contratos de API
pnpm test tests/contract/

# Tests específicos
pnpm test tests/contract/catalog.list-models.spec.ts
pnpm test tests/contract/quote.calculate-item.spec.ts
pnpm test tests/contract/quote.add-item.spec.ts
pnpm test tests/contract/quote.submit.spec.ts
pnpm test tests/contract/admin.model.upsert.spec.ts
```

### Tests de Integración E2E
```bash
# Ejecutar el flujo completo end-to-end
pnpm test tests/integration/quickstart.e2e.spec.ts
```

### Tests de Performance
```bash
# Validar requisitos de rendimiento
pnpm test tests/perf/price.bench.spec.ts
```

### Tests Unitarios
```bash
# Validar lógica de pricing
pnpm test tests/unit/price-item.spec.ts
```

## ✅ Criterios de Validación Exitosa

### 🚀 Performance
- [ ] Cálculo de items: **< 200ms** por operación
- [ ] Listado de catálogos: **< 500ms** por consulta
- [ ] 50 cálculos complejos: **< 200ms total** (benchmark actual: ~2.77ms)

### 📊 Funcionalidad
- [ ] Crear y publicar modelos de vidrio
- [ ] Calcular precios con servicios y ajustes
- [ ] Gestionar cotizaciones multi-ítem
- [ ] Enviar cotizaciones con validación de contacto
- [ ] Listar catálogo público de modelos

### 🌍 Localización
- [ ] Todas las validaciones de error en **español (es-LA)**
- [ ] Formatos de teléfono y direcciones colombianas
- [ ] Moneda en pesos colombianos (COP)

### 🔒 Validación de Datos
- [ ] Esquemas Zod funcionando correctamente
- [ ] Dimensiones dentro de límites de modelos
- [ ] Tipos de vidrio compatibles validados
- [ ] CUIDs válidos para todos los IDs

## 🛠️ Herramientas de Debug

### Prisma Studio
```bash
pnpm db:studio
```

### Logs del Sistema
Los logs se muestran en consola durante el desarrollo. Busca por:
- `INFO`: Operaciones exitosas
- `WARN`: Advertencias de validación
- `ERROR`: Errores de procesamiento

### Base de Datos
```bash
# Ver estructura de tablas
pnpm db:generate

# Reset completo (solo desarrollo)
pnpm db:reset
```

## 📈 Métricas de Éxito

Al completar esta guía, deberías tener:

1. **✅ Flujo E2E funcionando**: Desde creación de modelo hasta envío de cotización
2. **✅ Performance óptima**: Cálculos sub-200ms validados
3. **✅ Tests pasando**: 100% de tests de contrato e integración
4. **✅ UI en español**: Validaciones y mensajes localizados
5. **✅ Datos consistentes**: Todos los cálculos matemáticamente correctos

---

## 🚨 Solución de Problemas Comunes

### Error de Base de Datos
```bash
# Verificar que PostgreSQL esté corriendo
./start-database.sh

# Re-ejecutar migraciones
pnpm db:generate
```

### Tests Fallando
```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules
pnpm install

# Verificar tipos
pnpm typecheck
```

### Performance Lenta
- Verificar índices de base de datos en `prisma/schema.prisma`
- Revisar logs para consultas N+1
- Usar Prisma Studio para inspeccionar datos

¡El sistema Glasify MVP está listo para cotizaciones de vidrio! 🎉

