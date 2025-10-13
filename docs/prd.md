---
post_title: "PRD — Glasify Lite v1.5 (Cotizador de ventanas en aluminio y PVC)"
author1: "Andrés"
post_slug: "prd-glasify-lite-v1-5"
microsoft_alias: "n/a"
featured_image: "/images/glasify-prd-mvp.png"
categories: ["product", "requirements"]
tags: ["PRD", "cotizador", "ventanas", "aluminio", "PVC", "Next.js"]
ai_note: "yes"
summary: "Especificación actualizada de Glasify Lite v1.5 con arquitectura multi-tenant, sistema de soluciones de vidrio basado en estándares, y funcionalidades de cotización y presupuesto."
post_date: "2025-10-12"
version: "1.5.0"
last_updated: "2025-10-12"
---

# PRD: Glasify Lite v1.5

## Estado del Documento

| Propiedad                | Valor                                 |
| ------------------------ | ------------------------------------- |
| **Versión**              | 1.5.0                                 |
| **Última actualización** | 2025-10-12                            |
| **Estado**               | ✅ En producción (funcionalidades MVP) |
| **Próxima versión**      | v2.0 (Q2 2026)                        |

## Historial de Versiones

- **v1.5.0** (2025-10-12): Arquitectura multi-tenant completa, sistema de soluciones de vidrio, cart/budget workflow, My Quotes UX redesign
- **v1.4.0** (2025-10-10): Refactorización Manufacturer → TenantConfig + ProfileSupplier
- **v1.3.0** (2025-10-09): Sistema Many-to-Many de soluciones de vidrio basado en estándares EN/ISO
- **v1.2.0** (2025-10-08): Budget Cart workflow con sessionStorage
- **v1.0.0** (2025-09-26): Documentación inicial del MVP

## Objetivo

Definir la especificación completa de Glasify Lite v1.5, una aplicación SaaS multi-tenant para cotización y presupuestación de ventanas y puertas en aluminio y PVC. El sistema permite configurar catálogos de productos con proveedores de perfiles, gestionar soluciones de vidrio basadas en estándares internacionales (EN/ISO), crear presupuestos multi-ítem con carrito de compras, y generar cotizaciones profesionales con exportación PDF/Excel.

## Resumen ejecutivo

### El Problema que Resolvemos

**La fricción en el primer contacto destruye oportunidades de negocio.**

Tradicionalmente, un cliente interesado en ventanas/puertas debe:
1. Contactar a un comercial (teléfono, WhatsApp, visita)
2. Esperar horas o días para que lo atiendan
3. Describir sus necesidades sin conocer terminología técnica
4. Recibir un presupuesto genérico o incompleto
5. **Resultado**: Frustración, abandono, o decisiones desinformadas

**Este proceso puede tomar días u horas. Nosotros lo reducimos a minutos.**

### Nuestra Propuesta de Valor

**Glasify Lite democratiza el acceso a presupuestos profesionales**, permitiendo que cualquier persona obtenga un **primer acercamiento rápido y efectivo** a los costos de su proyecto, **sin esperar a un comercial**.

#### Para el Cliente (Homeowner/Builder)

✅ **Presupuesto en minutos, no días**
- Explora el catálogo, configura dimensiones, selecciona vidrios
- Ve el precio actualizado en tiempo real (<200ms)
- Crea múltiples variantes y compara

✅ **Sin tecnicismos, basado en soluciones**
- NO: "DVH 4+9+4 low-e con U=1.8 W/m²K"
- SÍ: "Vidrio de aislamiento térmico - Rendimiento Excelente"
- Sistema de ratings claros (básico → excelente)

✅ **Planificación desde el primer día**
- Tiene un número concreto para planear su presupuesto
- Puede explorar opciones sin compromiso
- Llega preparado a la negociación con el comercial

✅ **Sin fricción, sin esperas**
- No necesita crear cuenta para cotizar
- Carrito persiste mientras navega
- Exporta PDF profesional cuando esté listo

#### Para el Negocio (Fabricante/Distribuidor)

✅ **Leads más calificados**
- Cliente ya exploró el catálogo y conoce rangos de precio
- Brief automático de necesidades (dimensiones, vidrios, servicios)
- Comercial recibe contexto completo antes de contactar

✅ **Reducción de carga operativa**
- Sistema atiende consultas básicas 24/7
- Comercial se enfoca en asesoría de valor, no cotizaciones genéricas
- Menos tiempo en explicar conceptos básicos

✅ **Primer contacto rápido y efectivo**
- Cliente siente atención inmediata (no abandonos)
- Sistema genera expectativas realistas de precios
- Negociación inicia con información compartida

✅ **Escalabilidad sin contratar**
- 100 clientes simultáneos cotizando sin saturar comerciales
- Presupuestos automáticos con marca profesional
- Métricas de conversión (productos más vistos, abandono)

### Filosofía del Producto

> **"No buscamos vender, buscamos servir de primer contacto rápido y efectivo para que después lo aborde un comercial y ejecute el proceso completo de asesorar mejor."**

**Glasify Lite es el puente entre el interés y la asesoría profesional**, eliminando la fricción del primer acercamiento.

- **Minutos vs Días**: Presupuesto instantáneo en lugar de esperar turno
- **Soluciones vs Tecnicismos**: Lenguaje de beneficios, no de especificaciones
- **Autonomía vs Dependencia**: Cliente explora libremente, comercial asesora mejor
- **Contexto vs Desconocimiento**: Comercial recibe brief completo, no empieza de cero

### Arquitectura de la Solución (v1.5)

**Glasify Lite v1.5** es una aplicación SaaS multi-tenant que implementa esta visión con tecnología de punta:

#### Stack Tecnológico
- **Frontend**: Next.js 15 (App Router + React Server Components), TailwindCSS 4
- **Backend**: tRPC 11 (type-safe APIs), Prisma 6 + PostgreSQL
- **Auth**: NextAuth.js v5 (Google OAuth)
- **Export**: PDF (@react-pdf/renderer) + Excel (exceljs)

#### Componentes Principales

1. **Catálogo Inteligente**
   - Modelos con límites técnicos y precios dinámicos
   - Validaciones en tiempo real (dimensiones, compatibilidad)
   - Búsqueda, filtros, ordenamiento

2. **Sistema de Vidrios Basado en Soluciones** (NO Tecnicismos)
   - Many-to-Many: GlassType ↔ GlassSolution
   - Ratings de performance (térmica, acústica, seguridad, solar)
   - Estándares EN/ISO traducidos a lenguaje simple
   - 7 tipos: DVH, triple vidriado, templado, laminado, low-e, combinado, básico

3. **Budget Cart (Sin Fricción)**
   - Presupuesto sin necesidad de cuenta
   - Persistencia en sessionStorage
   - Operaciones CRUD (add, update, remove, clear)
   - Conversión directa a Quote formal

4. **My Quotes (Gestión Post-Contacto)**
   - Estados claros (En edición / Enviada / Cancelada)
   - Filtros avanzados, búsqueda, ordenamiento
   - Exportación PDF/Excel profesional
   - URL-synced filters (links compartibles)

5. **Pricing Engine Transparente**
   - Cálculo en tiempo real (<200ms)
   - Desglose visible (perfil + vidrio + accesorios + servicios)
   - Sin sorpresas, sin letra chica

### Estado Actual

✅ **v1.5 en Producción** (Octubre 2025)
- 60/60 tareas completadas (My Quotes UX Redesign)
- 193 tests pasando
- Performance 25-75% mejor que targets
- WCAG 2.1 AA compliant
- Export success rate: 95%

🚀 **v2.0 Planeado** (Q2 2026)
- Multi-tenancy real (subdomain-based)
- Inventario y stock management
- Logística y transporte
- Pasarela de pagos (Stripe, Mercado Pago)
- Cálculos estructurales avanzados

## Alcance de la Versión Actual (v1.5)

### ✅ Funcionalidades Implementadas

#### Arquitectura y Configuración
- ✅ **Multi-Tenant con Singleton**: TenantConfig (un único registro con id="1") para configuración del negocio
- ✅ **Proveedores de Perfiles**: ProfileSupplier para fabricantes (Rehau, Deceuninck, Azembla, etc.)
- ✅ **Configuración Regional**: Moneda (ISO 4217), locale (BCP 47), timezone (IANA), validez de cotizaciones

#### Sistema de Catálogo
- ✅ **Modelos de Ventanas/Puertas**: Con límites técnicos (min/max width/height en mm)
- ✅ **Precios Dinámicos**: Base price + costo por mm adicional (ancho + alto)
- ✅ **Descuentos de Vidrio**: Reducción de área facturable (glassDiscountWidthMm/HeightMm)
- ✅ **Márgenes de Ganancia**: Tracking de márgenes y estructura de costos (ModelCostBreakdown)
- ✅ **Estados de Publicación**: draft/published con control de visibilidad

#### Sistema de Vidrios (Glass Solutions)
- ✅ **Clasificación Moderna**: Many-to-Many GlassType ↔ GlassSolution
- ✅ **Estándares Internacionales**: Basado en EN 673 (térmica), EN 12758 (solar), EN 12600 (seguridad)
- ✅ **Performance Ratings**: 5 niveles (basic → excellent) por categoría
  - Aislamiento térmico (thermal_performance)
  - Aislamiento acústico (acoustic_performance)
  - Control solar (solar_performance)
  - Seguridad (security_performance)
- ✅ **Tipos de Solución**: DVH (double), Triple vidriado, Templado, Laminado, Low-E, etc.
- ✅ **Backward Compatibility**: Campo `purpose` deprecado pero funcional (será removido en v2.0)

#### Presupuesto y Carrito (Budget Cart)
- ✅ **SessionStorage Persistence**: Carrito persiste sin necesidad de cuenta
- ✅ **Operaciones CRUD**: Add, update, remove, clear items
- ✅ **Validaciones**: Límites técnicos, vidrios compatibles, cálculos automáticos
- ✅ **Preview en Tiempo Real**: Subtotales, servicios, total general
- ✅ **Conversión a Cotización**: Transformación directa a Quote con un clic

#### Gestión de Cotizaciones (My Quotes UX Redesign)
- ✅ **Estados Claros**: "En edición", "Enviada al cliente", "Cancelada" (reemplaza confuso "Borrador")
- ✅ **Imágenes de Productos**: Thumbnails + 22 diagramas SVG de tipos de ventanas
- ✅ **Filtros Avanzados**: Status filter, búsqueda (debounced 300ms), ordenamiento
- ✅ **Exportación Profesional**: PDF y Excel con branding personalizable
- ✅ **Sincronización URL**: Filtros persisten en URL para compartir links
- ✅ **Performance**: <2s carga (50 quotes), <10s exportación (50 items)
- ✅ **Accesibilidad**: WCAG 2.1 AA compliant (contraste 6.8:1 a 16.1:1)

#### Datos de Proyecto
- ✅ **Campos Estructurados**: projectName, projectAddress, projectCity, projectRegion
- ✅ **Validaciones**: Zod schemas end-to-end con mensajes en español
- ✅ **Depreciaciones Progresivas**: Campo contactAddress deprecado a favor de project fields

#### Autenticación y Usuarios
- ✅ **Google OAuth**: NextAuth.js v5 (beta.29)
- ✅ **Gestión de Sesión**: Session management con JWT
- ✅ **Roles**: User roles con sistema extensible

#### Servicios Adicionales
- ✅ **Tipos de Servicio**: Por área (m²), perímetro (ml), o precio fijo
- ✅ **Cálculo Automático**: Basado en dimensiones del ítem
- ✅ **Configurabilidad**: Definidos por tenant con rates personalizables

### 🚧 En Desarrollo / Planificado para v2.0

#### Gestión de Inventario
- ⏳ **Stock Tracking**: Inventario de perfiles y vidrios
- ⏳ **Alertas de Stock Bajo**: Notificaciones automáticas
- ⏳ **Proveedores**: Gestión de múltiples proveedores por material

#### Logística y Transporte
- ⏳ **Cálculo de Rutas**: Integración con APIs de mapas
- ⏳ **Costos de Transporte**: Por distancia o zonas
- ⏳ **Programación de Entregas**: Calendar scheduling

#### Finanzas y Pagos
- ⏳ **Pasarela de Pagos**: Stripe/PayPal integration
- ⏳ **Órdenes de Compra**: Purchase order workflow
- ⏳ **Facturación**: Invoice generation system
- ⏳ **Multi-Moneda**: Soporte para múltiples monedas con conversión

#### Avanzado
- ⏳ **Cálculos Estructurales**: Validación de ingeniería para perfiles
- ⏳ **Diseño de Perfiles**: Configurador visual de perfiles térmicos
- ⏳ **Multi-Tenant Real**: Múltiples tenants por instancia (vs singleton actual)
- ⏳ **Impuestos Multi-País**: Configuración de impuestos por región

### ❌ Explícitamente Fuera del Alcance (Todas las Versiones)

- ❌ CRM completo (usar integraciones con Pipedrive, HubSpot, etc.)
- ❌ ERP completo (integrar con SAP, Odoo, etc.)
- ❌ Manufactura/Producción (scheduler, machine control)
- ❌ Renders 3D/AR (usar herramientas especializadas externas)

## Stakeholders y roles

- Fabricante/Admin (VitroRojas): configura catálogo, modelos, vidrios, servicios, precios y publica.
- Cliente final: arma cotización seleccionando modelos y parámetros; registra datos y envía solicitud.
- Operador comercial (opcional): exporta, envía cotización, hace seguimiento.

## Arquitectura Tecnológica (Stack)

### Frontend
- **Framework**: Next.js 15.5.4 (App Router con React Server Components)
- **React**: 19.2.0 (Server Components first, Client Components cuando sea necesario)
- **TypeScript**: 5.9.3 (strict mode habilitado)
- **Styling**: TailwindCSS 4.1.14 + shadcn/ui + Radix UI primitives
- **Forms**: React Hook Form 7.64.0 + Zod resolver
- **State Management**: 
  - Server State: TanStack Query 5.90.2 (React Query)
  - Client State: React hooks + Context API
  - Cart State: sessionStorage con custom hooks
- **Icons**: Lucide React 0.545.0

### Backend
- **API Layer**: tRPC 11.6.0 (type-safe end-to-end)
- **Database ORM**: Prisma 6.17.0
- **Database**: PostgreSQL 14+ (required)
- **Authentication**: NextAuth.js 5.0.0-beta.29
- **Validation**: Zod 4.1.12 (schemas compartidos cliente/servidor)
- **Logging**: Winston 3.18.3 (structured logging, server-side only)

### PDF/Excel Generation
- **PDF**: @react-pdf/renderer 4.3.1 (server-side rendering)
- **Excel**: exceljs 4.4.0 (server-side workbook generation)

### Development Tools
- **Linting/Formatting**: Ultracite 5.6.1 (Biome 2.2.5 wrapper)
- **Testing**:
  - Unit/Integration: Vitest 3.2.4 + jsdom 27.0.0
  - E2E: Playwright 1.56.0
  - Testing Library: @testing-library/react 16.3.0
- **Git Hooks**: Lefthook 1.13.6
- **Package Manager**: pnpm 10.17.1

### Deployment
- **Hosting**: Vercel (recommended) o cualquier Node.js host
- **Database**: PostgreSQL (Railway, Supabase, Neon, etc.)
- **Environment**: Node.js 20.x+

### Architectural Patterns

#### Server-First Architecture (Constitution Rule)
```typescript
// ✅ CORRECTO: Page como Server Component
export const metadata: Metadata = { title: 'Catálogo' };
export default async function CatalogPage() {
  const data = await api.catalog['list-models']();
  return <CatalogPageContent initialData={data} />;
}

// ✅ CORRECTO: Client Component solo para interactividad
'use client';
export function CatalogPageContent({ initialData }: Props) {
  const [filters, setFilters] = useState({});
  return <div>...</div>;
}

// ❌ INCORRECTO: Page como Client Component
'use client'; // ❌ Nunca uses 'use client' en page.tsx
export default function CatalogPage() { ... }
```

#### Winston Logger (Server-Only Rule)
```typescript
// ✅ PERMITIDO: Server Component, Server Action, API Route, tRPC
import logger from '@/lib/logger';
export async function exportQuotePDF(quoteId: string) {
  logger.info('Generating PDF', { quoteId });
  // ...
}

// ❌ PROHIBIDO: Client Component
'use client';
import logger from '@/lib/logger'; // ❌ Build error
export function ClientComponent() {
  logger.info('...'); // ❌ Winston usa Node.js modules
}
```

### Key Dependencies Matrix

| Dependency          | Version | Server | Client | Notes                   |
| ------------------- | ------- | ------ | ------ | ----------------------- |
| Next.js             | 15.5.4  | ✅      | ✅      | App Router + RSC        |
| React               | 19.2.0  | ✅      | ✅      | Server Components first |
| tRPC                | 11.6.0  | ✅      | ✅      | Type-safe APIs          |
| Prisma              | 6.17.0  | ✅      | ❌      | Server-side only        |
| Zod                 | 4.1.12  | ✅      | ✅      | Shared validation       |
| Winston             | 3.18.3  | ✅      | ❌      | Server logging only     |
| @react-pdf/renderer | 4.3.1   | ✅      | ❌      | PDF generation          |
| exceljs             | 4.4.0   | ✅      | ❌      | Excel generation        |
| shadcn/ui           | 3.4.0   | ❌      | ✅      | UI components           |
| TanStack Query      | 5.90.2  | ❌      | ✅      | Client state            |


## Reglas de negocio — Cálculo de Precios

### Fórmula de Precio por Ítem

Dado un modelo con:
- Dimensiones mínimas: `minWidthMm`, `minHeightMm`
- Precio base: `basePrice` (válido en dimensiones mínimas)
- Costos por mm: `costPerMmWidth`, `costPerMmHeight`
- Descuentos de vidrio: `glassDiscountWidthMm`, `glassDiscountHeightMm`

Para una solicitud con dimensiones `widthMm`, `heightMm`:

#### 1. Precio por Dimensiones del Perfil

```typescript
deltaWidth = max(0, widthMm - minWidthMm)
deltaHeight = max(0, heightMm - minHeightMm)
```

$$P_{profile} = basePrice + (costPerMmWidth \cdot deltaWidth) + (costPerMmHeight \cdot deltaHeight)$$

#### 2. Precio del Vidrio (con Descuento)

```typescript
effectiveWidthMm = widthMm - glassDiscountWidthMm
effectiveHeightMm = heightMm - glassDiscountHeightMm
glassAreaM2 = (effectiveWidthMm / 1000) * (effectiveHeightMm / 1000)
```

$$P_{glass} = pricePerSqm_{glassType} \cdot glassAreaM2$$

**Validación**: `effectiveWidthMm > 0` y `effectiveHeightMm > 0`

#### 3. Accesorios (Opcional)

$$P_{accessory} = accessoryPrice \text{ (si aplica)}$$

#### 4. Servicios Adicionales

Los servicios se calculan según su tipo:

**Por área (m²)** (ej: instalación):
```typescript
areaM2 = (widthMm / 1000) * (heightMm / 1000)
```
$$P_{service,area} = rate_{m2} \cdot areaM2$$

**Por perímetro (ml)** (ej: sellado):
```typescript
perimeterM = 2 * ((widthMm / 1000) + (heightMm / 1000))
```
$$P_{service,perimeter} = rate_{ml} \cdot perimeterM$$

**Precio fijo** (ej: transporte):
$$P_{service,fixed} = amount$$

#### 5. Subtotal del Ítem

$$subtotal = P_{profile} + P_{glass} + P_{accessory} + \sum_{i=1}^{n} P_{service,i}$$

#### 6. Total de la Cotización

$$total = \sum_{j=1}^{m} subtotal_j + \sum_{k=1}^{p} adjustment_k$$

Donde:
- `m` = número de ítems en la cotización
- `p` = número de ajustes (descuentos/recargos)

### Validaciones

#### Dimensiones
```typescript
// Validación estricta de rangos
if (widthMm < minWidthMm || widthMm > maxWidthMm) {
  throw new Error('Ancho fuera del rango permitido');
}
if (heightMm < minHeightMm || heightMm > maxHeightMm) {
  throw new Error('Alto fuera del rango permitido');
}
```

#### Compatibilidad de Vidrio
```typescript
// El vidrio debe estar en la lista de compatibles del modelo
if (!model.compatibleGlassTypeIds.includes(glassTypeId)) {
  throw new Error('Tipo de vidrio no compatible con este modelo');
}

// El espesor debe existir en el GlassType
if (glassThicknessMm !== glassType.thicknessMm) {
  throw new Error('Espesor de vidrio inválido');
}
```

#### Área Efectiva de Vidrio
```typescript
const effectiveWidth = widthMm - glassDiscountWidthMm;
const effectiveHeight = heightMm - glassDiscountHeightMm;

if (effectiveWidth <= 0 || effectiveHeight <= 0) {
  throw new Error('Área de vidrio resultante inválida después de descuentos');
}
```

### Redondeo y Formato

```typescript
// Redondeo a 2 decimales (half-up)
const roundPrice = (value: number): number => {
  return Math.round(value * 100) / 100;
};

// Formato de moneda según locale del tenant
const formatCurrency = (value: number, currency: string, locale: string): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
```

### Ejemplo Numérico Completo

**Modelo**: Bella Sliding PVC (Rehau)
- `minWidthMm = 600`, `maxWidthMm = 2000`
- `minHeightMm = 400`, `maxHeightMm = 2400`
- `basePrice = 120 USD`
- `costPerMmWidth = 0.05 USD/mm`
- `costPerMmHeight = 0.04 USD/mm`
- `glassDiscountWidthMm = 30`, `glassDiscountHeightMm = 30`
- `accessoryPrice = 20 USD`

**GlassType**: DVH 6mm Guardian
- `pricePerSqm = 35 USD/m²`
- `thicknessMm = 6`

**Dimensiones solicitadas**: 
- `widthMm = 900`, `heightMm = 700`

**Servicios**:
- Instalación: `15 USD/m²`
- Sellado: `2 USD/ml`

#### Cálculo Paso a Paso

1. **Perfil**:
   - `deltaWidth = 900 - 600 = 300 mm`
   - `deltaHeight = 700 - 400 = 300 mm`
   - `P_profile = 120 + (0.05 × 300) + (0.04 × 300) = 120 + 15 + 12 = 147 USD`

2. **Vidrio**:
   - `effectiveWidth = 900 - 30 = 870 mm`
   - `effectiveHeight = 700 - 30 = 670 mm`
   - `areaM2 = (870/1000) × (670/1000) = 0.5829 m²`
   - `P_glass = 35 × 0.5829 = 20.40 USD`

3. **Accesorios**:
   - `P_accessory = 20 USD`

4. **Servicios**:
   - Instalación: `15 × 0.63 = 9.45 USD` (área total: 0.9 × 0.7)
   - Sellado: `2 × 3.2 = 6.40 USD` (perímetro: 2×(0.9+0.7))
   - `P_services = 15.85 USD`

5. **Subtotal**:
   - `subtotal = 147 + 20.40 + 20 + 15.85 = 203.25 USD`

**Nota**: Este ejemplo muestra cómo el descuento de vidrio reduce el área facturable del vidrio, mientras que los servicios se calculan sobre las dimensiones totales del ítem.

## UI de referencia

La página de ejemplo muestra patrón de formulario con: selección de estilo, opciones de vidrio, campos de ancho/alto en mm, y total dinámico con “Add to basket”. Glasify tomará ese flujo como guía, adaptado a LATAM y a nuestro modelo de servicios y accesorios.

## Flujos principales

### Flujo 1: Budget Cart (Presupuesto sin Cuenta)

**Usuario**: Cliente visitante (sin autenticación)  
**Objetivo**: Crear presupuesto multi-ítem con preview instantáneo

1. **Navegación al catálogo**
   - Accede a `/catalog`
   - Ve modelos organizados por proveedor de perfiles (Rehau, Deceuninck, etc.)
   - Puede filtrar por proveedor, buscar por nombre, ordenar por precio

2. **Configuración de ítem**
   - Selecciona un modelo → `/catalog/[modelId]`
   - Ingresa dimensiones (widthMm, heightMm) con validación en tiempo real
   - Selecciona tipo de vidrio (solo compatibles con el modelo)
   - Selecciona espesor de vidrio (según thicknessMm disponibles)
   - Opcional: Agrega servicios (instalación, sellado, etc.)
   - Ve cálculo de precio dinámico (<200ms actualización)

3. **Gestión del carrito**
   - Click "Agregar al Carrito" → Ítem guardado en sessionStorage
   - Notificación toast: "Producto agregado al carrito"
   - Ícono de carrito muestra contador (e.g., "3 ítems")
   - Puede continuar comprando o ir al carrito

4. **Revisión de carrito**
   - Accede a `/cart` desde header o notificación
   - Ve lista de ítems con:
     - Thumbnail del modelo + nombre
     - Dimensiones y especificaciones
     - Precio unitario y subtotal
     - Controles: editar, eliminar
   - Ve total general actualizado
   - Puede:
     - Modificar cantidades/dimensiones
     - Eliminar ítems
     - Vaciar carrito
     - Crear cotización

5. **Conversión a cotización**
   - Click "Crear Cotización" en `/cart`
   - Si no autenticado → Redirect a `/signin?callbackUrl=/cart`
   - Login con Google OAuth
   - Redirect de vuelta a `/cart`
   - Quote creada automáticamente con estado `draft`
   - Carrito vacío (ítems transferidos)
   - Redirect a `/quotes/[quoteId]` para completar datos

**Persistencia**: El carrito persiste en sessionStorage hasta crear la cotización o cerrar navegador

### Flujo 2: My Quotes (Gestión de Cotizaciones)

**Usuario**: Cliente autenticado  
**Objetivo**: Gestionar cotizaciones propias con filtros, búsqueda y exportación

1. **Lista de cotizaciones**
   - Accede a `/my-quotes`
   - Ve tabla con columnas:
     - Estado visual (badge con color)
     - Cliente (contactPhone)
     - Proyecto (projectName)
     - Total (con moneda)
     - Fecha de creación
     - Acciones (Ver, Editar, Exportar)
   - Herramientas disponibles:
     - **Búsqueda**: Input debounced (300ms) en cliente/proyecto
     - **Filtro por estado**: All / En edición / Enviada / Cancelada
     - **Ordenamiento**: Fecha (asc/desc), Total (asc/desc)
     - **Paginación**: 10 ítems por página

2. **Filtros en acción**
   - Cambio de filtro → Actualiza URL query params
   - URL sharable: `/my-quotes?status=draft&q=proyecto&sort=total-desc`
   - Filtros persisten en navegación (back/forward)
   - Badges activos muestran filtros aplicados con opción "x" para remover

3. **Detalle de cotización**
   - Click "Ver" → `/quotes/[quoteId]`
   - Vista en 2 secciones:
     - **Header**: Estado, total, validez, acciones (Exportar PDF/Excel)
     - **Datos del proyecto**: Formulario editable (si `draft` o `sent`)
       - projectName, projectAddress, projectCity, projectRegion
       - contactPhone
     - **Items Grid**: Cards visuales con:
       - Imagen del modelo (SVG diagram)
       - Especificaciones (dimensiones, vidrio, servicios)
       - Subtotal desglosado
       - Acciones: Editar, Eliminar

4. **Edición de cotización**
   - Si estado = `draft` o `sent`: Todos los campos editables
   - Si estado = `canceled`: Solo lectura
   - Cambios guardados automáticamente (debounced)
   - Validaciones en tiempo real (Zod schemas)

5. **Envío de cotización**
   - Click "Enviar Cotización" (solo si `draft`)
   - Validación: Requiere datos de proyecto completos
   - Confirmación modal
   - Estado actualiza a `sent`
   - Email/WhatsApp/Telegram notification (según TenantConfig)

6. **Exportación**
   - Botones "Exportar PDF" / "Exportar Excel"
   - Server Action genera archivo (<10s para 50 ítems)
   - Download automático
   - Formato profesional con branding (logo, colores de TenantConfig)

**Performance**: <2s carga lista (50 quotes), <1.5s detalle (30 ítems)

### Flujo 3: Admin (Configuración y Catálogo)

**Usuario**: Administrador autenticado  
**Objetivo**: Configurar sistema y gestionar catálogo de productos

1. **Configuración global (TenantConfig)**
   - Accede a `/admin/tenant-config`
   - Edita datos del negocio:
     - businessName, contactEmail, contactPhone
     - currency (MXN, ARS, COP, etc.)
     - locale (es-MX, es-AR, es-CO)
     - timezone (America/Mexico_City, etc.)
     - quoteValidityDays (default: 30)
     - Branding: logo, primaryColor, secondaryColor
   - Guarda cambios → Aplica a todo el sistema

2. **Gestión de proveedores (ProfileSuppliers)**
   - Accede a `/admin/profile-suppliers`
   - Ve lista de proveedores (Rehau, Deceuninck, Veka, etc.)
   - CRUD operations:
     - Create: Nombre, materialType (PVC/ALUMINUM/WOOD/MIXED)
     - Read: Lista con filtros por material
     - Update: Editar nombre, tipo, estado activo
     - Delete: Soft delete (isActive = false)

3. **Gestión de modelos**
   - Accede a `/admin/models`
   - Create modelo:
     - Selecciona proveedor de perfiles
     - Ingresa nombre, descripción
     - Define límites de dimensiones (min/max WidthMm, HeightMm)
     - Configura pricing:
       - basePrice (precio base)
       - costPerMmWidth, costPerMmHeight (precio incremental)
       - glassDiscountWidthMm/HeightMm (reduce área facturable de vidrio)
       - accessoryPrice (kit de accesorios fijo)
       - profitMarginPercentage
     - Asigna vidrios compatibles (multiselect)
     - Adjunta imagen (SVG diagram)
   - Publica modelo → Visible en catálogo

4. **Gestión de vidrios y soluciones**
   - Accede a `/admin/glass-types`
   - Create tipo de vidrio:
     - Nombre, espesor (mm), precio por m²
     - Propiedades: isTempered, isLaminated, isLowE, etc.
     - uValue (transmitancia térmica)
   - Asignar soluciones (Many-to-Many):
     - Selecciona soluciones pre-configuradas (DVH, triple vidriado, etc.)
     - Cada solución tiene ratings EN/ISO (thermal, acoustic, solar, security)

5. **Gestión de servicios**
   - Accede a `/admin/services`
   - CRUD servicios adicionales:
     - Nombre, descripción
     - Tipo: area (m²), perimeter (ml), fixed (unidad)
     - Rate (tarifa)
     - isActive, showByDefault

**Validaciones**: Todos los formularios usan Zod schemas end-to-end (cliente y servidor)

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

## Modelo de datos (Arquitectura Actual v1.5)

### Diagrama Conceptual

```
TenantConfig (Singleton)
    ├── businessName, currency, locale, timezone
    ├── quoteValidityDays
    └── contact info

ProfileSupplier (Manufacturers)
    ├── name, materialType (PVC/ALUMINUM/WOOD/MIXED)
    ├── isActive
    └── models [] ──→ Model

Model (Window/Door Products)
    ├── profileSupplierId (FK → ProfileSupplier)
    ├── name, status (draft/published)
    ├── dimensions: min/max WidthMm, HeightMm
    ├── pricing: basePrice, costPerMmWidth, costPerMmHeight
    ├── glassDiscountWidthMm/HeightMm
    ├── accessoryPrice
    ├── compatibleGlassTypeIds []
    ├── profitMarginPercentage
    └── quoteItems [], costBreakdown [], priceHistory []

GlassType (Glass Products)
    ├── name, purpose (deprecated), thicknessMm
    ├── pricePerSqm
    ├── properties: isTempered, isLaminated, isLowE, isTripleGlazed
    ├── uValue (thermal transmittance)
    └── solutions [] ──→ GlassTypeSolution ──→ GlassSolution

GlassSolution (Glass Classifications - Standards Based)
    ├── name, description
    ├── type: DVH, triple_glazed, tempered, laminated, low_e
    ├── Performance Ratings (basic/standard/good/very_good/excellent):
    │   ├── thermalPerformance (EN 673)
    │   ├── acousticPerformance (EN 12758)
    │   ├── solarPerformance (EN 410)
    │   └── securityPerformance (EN 12600)
    └── glassTypes [] ←─ GlassTypeSolution

Service (Additional Services)
    ├── name, type (area/perimeter/fixed)
    ├── unit (sqm/ml/unit)
    └── rate

Quote (Customer Quotations)
    ├── userId (FK → User, optional)
    ├── status (draft/sent/canceled)
    ├── currency, total, validUntil
    ├── Project fields: projectName, projectAddress, projectCity, projectRegion
    ├── contactPhone
    ├── items [] ──→ QuoteItem
    └── adjustments [] ──→ Adjustment

QuoteItem (Individual Items in Quote)
    ├── quoteId (FK → Quote)
    ├── modelId (FK → Model)
    ├── widthMm, heightMm
    ├── glassTypeId (FK → GlassType)
    ├── glassThicknessMm
    ├── subtotal (calculated)
    ├── itemName (snapshot for history)
    └── services [] ──→ QuoteItemService

User (Authentication)
    ├── email, name, image
    ├── googleId (OAuth)
    └── quotes []
```

### Entidades Principales

#### TenantConfig (Singleton)
Configuración global del negocio. **Singleton**: solo un registro con `id = "1"`.

```prisma
model TenantConfig {
  id String @id @default("1")
  businessName String
  currency String @db.Char(3)  // ISO 4217: USD, EUR, COP
  quoteValidityDays Int @default(15)
  locale String @default("es-CO")  // BCP 47
  timezone String @default("America/Bogota")  // IANA
  contactEmail String?
  contactPhone String?
  businessAddress String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### ProfileSupplier
Proveedores de perfiles (antes Manufacturer).

```prisma
model ProfileSupplier {
  id String @id @default(cuid())
  name String @unique  // Rehau, Deceuninck, etc.
  materialType MaterialType  // PVC, ALUMINUM, WOOD, MIXED
  isActive Boolean @default(true)
  notes String?
  models Model[]
}

enum MaterialType {
  PVC
  ALUMINUM
  WOOD
  MIXED
}
```

#### Model
Modelos de ventanas/puertas con pricing dinámico.

```prisma
model Model {
  id String @id @default(cuid())
  profileSupplierId String?
  profileSupplier ProfileSupplier? @relation(...)
  name String
  status ModelStatus @default(draft)  // draft | published
  
  // Límites técnicos
  minWidthMm Int
  maxWidthMm Int
  minHeightMm Int
  maxHeightMm Int
  
  // Pricing
  basePrice Decimal @db.Decimal(12, 2)
  costPerMmWidth Decimal @db.Decimal(12, 4)
  costPerMmHeight Decimal @db.Decimal(12, 4)
  accessoryPrice Decimal? @db.Decimal(12, 2)
  
  // Glass discounts (reduce billable area)
  glassDiscountWidthMm Int @default(0)
  glassDiscountHeightMm Int @default(0)
  
  // Business
  compatibleGlassTypeIds String[]
  profitMarginPercentage Decimal? @db.Decimal(5, 2)
  lastCostReviewDate DateTime?
  costNotes String?
  
  quoteItems QuoteItem[]
  costBreakdown ModelCostBreakdown[]
  priceHistory ModelPriceHistory[]
}
```

#### GlassType
Tipos de vidrio con pricing por m².

```prisma
model GlassType {
  id String @id @default(cuid())
  name String
  purpose GlassPurpose  // @deprecated - usar solutions
  thicknessMm Int
  pricePerSqm Decimal @db.Decimal(12, 2)
  uValue Decimal? @db.Decimal(5, 2)  // W/m²·K
  
  // Properties
  isTempered Boolean @default(false)
  isLaminated Boolean @default(false)
  isLowE Boolean @default(false)
  isTripleGlazed Boolean @default(false)
  
  // Many-to-Many with GlassSolution
  solutions GlassTypeSolution[]
  quoteItems QuoteItem[]
}
```

#### GlassSolution (Standards-Based)
Soluciones de vidrio con ratings de performance basados en EN/ISO.

```prisma
model GlassSolution {
  id String @id @default(cuid())
  name String @unique  // "Doble Vidriado Hermético (DVH)"
  type String  // DVH, triple_glazed, tempered, laminated, low_e
  description String?
  icon String?  // Lucide icon name
  
  // Performance Ratings (EN/ISO Standards)
  thermalPerformance PerformanceRating  // EN 673
  acousticPerformance PerformanceRating  // EN 12758
  solarPerformance PerformanceRating  // EN 410
  securityPerformance PerformanceRating  // EN 12600
  
  // Many-to-Many with GlassType
  glassTypes GlassTypeSolution[]
}

model GlassTypeSolution {
  glassTypeId String
  glassType GlassType @relation(...)
  solutionId String
  solution GlassSolution @relation(...)
  
  @@id([glassTypeId, solutionId])
}

enum PerformanceRating {
  basic      // ★☆☆☆☆
  standard   // ★★☆☆☆
  good       // ★★★☆☆
  very_good  // ★★★★☆
  excellent  // ★★★★★
}
```

#### Quote
Cotizaciones con datos de proyecto estructurados.

```prisma
model Quote {
  id String @id @default(cuid())
  userId String?
  user User? @relation(...)
  status QuoteStatus @default(draft)  // draft | sent | canceled
  currency String @db.Char(3)
  total Decimal @default(0) @db.Decimal(12, 2)
  validUntil DateTime?
  contactPhone String?
  
  // Structured project fields (v1.2+)
  projectName String?
  projectAddress String?
  projectCity String?
  projectRegion String?
  projectCountry String?
  projectZipCode String?
  
  // @deprecated - use projectAddress
  contactAddress String?
  
  items QuoteItem[]
  adjustments Adjustment[]
}

enum QuoteStatus {
  draft
  sent
  canceled
}
```

#### QuoteItem
Items individuales en cotización con servicios opcionales.

```prisma
model QuoteItem {
  id String @id @default(cuid())
  quoteId String
  quote Quote @relation(...)
  modelId String
  model Model? @relation(...)
  
  // Dimensions
  widthMm Int
  heightMm Int
  
  // Glass selection
  glassTypeId String
  glassType GlassType? @relation(...)
  glassThicknessMm Int
  
  // Pricing
  subtotal Decimal @db.Decimal(12, 2)
  
  // Snapshot for history (v1.3+)
  itemName String?
  
  // Services
  services QuoteItemService[]
}

model QuoteItemService {
  id String @id @default(cuid())
  quoteItemId String
  quoteItem QuoteItem @relation(...)
  serviceId String
  service Service? @relation(...)
  qty Decimal @default(1) @db.Decimal(12, 4)
  unit ServiceUnit
  amount Decimal @db.Decimal(12, 2)
}
```

### Modelos Deprecados (Remover en v2.0)

```prisma
/// @deprecated Migrado a TenantConfig + ProfileSupplier
model Manufacturer {
  id String @id @default(cuid())
  name String
  currency String @db.Char(3)
  quoteValidityDays Int @default(15)
  // ... relaciones deprecadas
}
```

**Nota**: El campo `purpose` en GlassType también está deprecado a favor de la relación `solutions`.

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

### Arquitectura de API

Glasify Lite v1.5 utiliza una arquitectura híbrida moderna:

- **tRPC**: Type-safe APIs para operaciones CRUD de catálogo y administración
- **Server Actions**: Mutaciones de datos en páginas (crear quotes, agregar items al carrito)
- **NextAuth.js**: Autenticación con Google OAuth (JWT sessions)

**Nota**: No hay endpoints REST tradicionales. tRPC proporciona type-safety end-to-end con inferencia automática de tipos.

### tRPC Routers

#### 1. Catalog Router (`/server/api/routers/catalog.ts`)

**Procedures públicos** (no requieren autenticación):

```typescript
// list-manufacturers
catalog['list-manufacturers'].query()
Input: void
Output: ProfileSupplier[] // { id, name, materialType, isActive }

// list-models
catalog['list-models'].query({ 
  profileSupplierId?: string,
  search?: string,
  status?: 'draft' | 'published',
  page?: number,
  limit?: number 
})
Output: { 
  items: Model[], 
  total: number, 
  page: number, 
  totalPages: number 
}

// get-model
catalog['get-model'].query({ id: string })
Output: Model & { 
  profileSupplier: ProfileSupplier,
  compatibleGlassTypes: GlassType[] 
}

// list-glass-types
catalog['list-glass-types'].query({ 
  modelId?: string, // Solo compatibles con este modelo
  purpose?: GlassPurpose // Deprecated, usa solutions
})
Output: GlassType[] & { solutions: GlassSolution[] }

// list-glass-solutions
catalog['list-glass-solutions'].query({
  type?: GlassSolutionType,
  minThermalRating?: PerformanceRating,
  minAcousticRating?: PerformanceRating
})
Output: GlassSolution[]
```

#### 2. Quote Router (`/server/api/routers/quote.ts`)

**Procedures protegidos** (requieren autenticación):

```typescript
// list-my-quotes
quote['list-my-quotes'].query({
  status?: QuoteStatus,
  search?: string, // Busca en projectName, contactPhone
  sortBy?: 'createdAt' | 'total',
  sortOrder?: 'asc' | 'desc',
  page?: number,
  limit?: number
})
Output: {
  items: Quote[] & { _count: { items: number } },
  total: number,
  page: number,
  totalPages: number
}

// get-quote
quote['get-quote'].query({ id: string })
Output: Quote & {
  items: QuoteItem[] & {
    model: Model,
    glassType: GlassType,
    services: QuoteItemService[]
  },
  user: User
}

// calculate-item-price
quote['calculate-item-price'].query({
  modelId: string,
  widthMm: number,
  heightMm: number,
  glassTypeId: string,
  glassThicknessMm: number,
  serviceIds?: string[]
})
Output: {
  profilePrice: number,
  glassPrice: number,
  accessoryPrice: number,
  servicesPrice: number,
  subtotal: number,
  breakdown: PriceBreakdown
}

// update-quote
quote['update-quote'].mutation({
  id: string,
  projectName?: string,
  projectAddress?: string,
  projectCity?: string,
  projectRegion?: string,
  projectCountry?: string,
  projectZipCode?: string,
  contactPhone?: string
})
Output: Quote

// send-quote
quote['send-quote'].mutation({ id: string })
Output: Quote // status cambia a 'sent', validUntil calculado

// cancel-quote
quote['cancel-quote'].mutation({ id: string })
Output: Quote // status cambia a 'canceled'
```

#### 3. Admin Router (`/server/api/routers/admin.ts`)

**Procedures protegidos** (requieren rol admin):

```typescript
// tenant-config-get
admin['tenant-config-get'].query()
Output: TenantConfig // Singleton (id = "1")

// tenant-config-update
admin['tenant-config-update'].mutation({
  businessName?: string,
  currency?: string,
  locale?: string,
  timezone?: string,
  quoteValidityDays?: number,
  contactEmail?: string,
  contactPhone?: string,
  primaryColor?: string,
  secondaryColor?: string
})
Output: TenantConfig

// profile-supplier-create
admin['profile-supplier-create'].mutation({
  name: string,
  materialType: 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED'
})
Output: ProfileSupplier

// model-create
admin['model-create'].mutation({
  profileSupplierId: string,
  name: string,
  description?: string,
  minWidthMm: number,
  maxWidthMm: number,
  minHeightMm: number,
  maxHeightMm: number,
  basePrice: number,
  costPerMmWidth: number,
  costPerMmHeight: number,
  glassDiscountWidthMm?: number,
  glassDiscountHeightMm?: number,
  accessoryPrice?: number,
  profitMarginPercentage?: number,
  compatibleGlassTypeIds: string[],
  status: 'draft' | 'published'
})
Output: Model

// glass-type-create
admin['glass-type-create'].mutation({
  name: string,
  thicknessMm: number,
  pricePerSqm: number,
  isTempered?: boolean,
  isLaminated?: boolean,
  isLowE?: boolean,
  isTripleGlazed?: boolean,
  uValue?: number,
  solutionIds: string[] // Many-to-Many
})
Output: GlassType

// service-create
admin['service-create'].mutation({
  name: string,
  type: 'area' | 'perimeter' | 'fixed',
  unit: 'sqm' | 'ml' | 'unit',
  rate: number,
  isActive?: boolean,
  showByDefault?: boolean
})
Output: Service
```

### Server Actions

#### Cart Actions (`/app/_actions/cart.actions.ts`)

```typescript
'use server';

// addToCart - Agrega ítem al carrito (sessionStorage, client-side)
// Nota: Validación de dimensiones/compatibilidad en cliente

// createQuoteFromCart
createQuoteFromCart(cartItems: CartItem[])
Input: CartItem[] // { modelId, widthMm, heightMm, glassTypeId, ... }
Output: { success: true, quoteId: string } | { success: false, error: string }
```

#### Quote Actions (`/app/_actions/quote.actions.ts`)

```typescript
'use server';

// addQuoteItem
addQuoteItem({
  quoteId: string,
  modelId: string,
  widthMm: number,
  heightMm: number,
  glassTypeId: string,
  glassThicknessMm: number,
  serviceIds?: string[]
})
Output: { success: true, itemId: string } | { success: false, error: string }

// removeQuoteItem
removeQuoteItem({ itemId: string })
Output: { success: true } | { success: false, error: string }

// updateQuoteItem
updateQuoteItem({
  itemId: string,
  widthMm?: number,
  heightMm?: number,
  glassThicknessMm?: number
})
Output: { success: true, subtotal: number } | { success: false, error: string }
```

#### Export Actions (`/app/_actions/quote-export.actions.ts`)

```typescript
'use server';

// exportQuoteToPDF
exportQuoteToPDF(quoteId: string)
Input: z.string().cuid('Invalid quote ID format') // ⚠️ CUID, NOT UUID
Output: ReadableStream (PDF binary)

// exportQuoteToExcel
exportQuoteToExcel(quoteId: string)
Input: z.string().cuid('Invalid quote ID format')
Output: ReadableStream (Excel binary)
```

### Validaciones Zod (Shared)

Todos los inputs/outputs usan schemas Zod compartidos entre cliente y servidor:

```typescript
// src/lib/validators/quote.validators.ts
export const createQuoteItemSchema = z.object({
  modelId: z.string().cuid(),
  widthMm: z.number().min(100).max(5000),
  heightMm: z.number().min(100).max(5000),
  glassTypeId: z.string().cuid(),
  glassThicknessMm: z.number().min(3).max(50),
  serviceIds: z.array(z.string().cuid()).optional()
});

export const updateQuoteSchema = z.object({
  id: z.string().cuid(),
  projectName: z.string().min(1).max(200).optional(),
  projectAddress: z.string().min(1).max(500).optional(),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional()
});
```

### Ejemplos de Uso (Cliente)

#### Fetch con tRPC

```typescript
'use client';
import { api } from '@/trpc/react';

function CatalogPage() {
  const { data, isLoading } = api.catalog['list-models'].useQuery({
    profileSupplierId: 'cm...',
    status: 'published',
    page: 1,
    limit: 20
  });

  return <CatalogGrid models={data?.items ?? []} />;
}
```

#### Mutación con Server Action

```typescript
'use client';
import { createQuoteFromCart } from '@/app/_actions/cart.actions';

async function handleCreateQuote() {
  const result = await createQuoteFromCart(cartItems);
  if (result.success) {
    router.push(`/quotes/${result.quoteId}`);
  }
}
```

### Performance Targets

| Operación                        | Target | v1.5 Actual   |
| -------------------------------- | ------ | ------------- |
| `list-models` (20 items)         | <500ms | ~200-300ms ✅  |
| `get-model`                      | <200ms | ~100-150ms ✅  |
| `calculate-item-price`           | <200ms | ~50-100ms ✅   |
| `list-my-quotes` (50 items)      | <1s    | ~400-600ms ✅  |
| `exportQuoteToPDF` (50 items)    | <10s   | ~4-6s ✅       |
| `createQuoteFromCart` (10 items) | <2s    | ~800-1200ms ✅ |

### Autenticación

- **Google OAuth**: `/api/auth/signin/google`
- **Session Check**: `await auth()` en Server Components/Actions
- **Protected Routes**: Middleware redirige a `/signin` si no autenticado
- **Role-Based**: Admin procedures verifican `session.user.role === 'admin'`

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

## Anexo E — Notas operativas (v1.5)

### Unidades y Redondeo

- **Dimensiones**: Milímetros (mm) para entrada/almacenamiento, conversión automática para cálculos
  - Metros: `m = mm / 1000`
  - Metros cuadrados: `m² = (widthMm / 1000) × (heightMm / 1000)`
  - Metros lineales: `ml = 2 × ((widthMm / 1000) + (heightMm / 1000))`
  
- **Redondeo**: 2 decimales (half-up) para precios y totales
  ```typescript
  Math.round(value * 100) / 100
  ```

- **Formateo**: Localización según TenantConfig
  ```typescript
  new Intl.NumberFormat(tenantConfig.locale, {
    style: 'currency',
    currency: tenantConfig.currency
  }).format(amount)
  ```

### Validez de Cotizaciones (TTL)

- **Duración**: Configurable en TenantConfig (`quoteValidityDays`, default: 30)
- **Cálculo**: `validUntil = createdAt + quoteValidityDays`
- **Enforcement**: Client-side warning si validUntil < now

### Snapshot de Precios (Auditoría)

**Problema**: Precios de modelos/vidrios pueden cambiar después de crear cotización

**Solución v1.5**:

1. **QuoteItem.itemName**: Snapshot del nombre del modelo (para historial)
   ```typescript
   itemName: `${model.profileSupplier.name} - ${model.name}`
   ```

2. **QuoteItem.subtotal**: Valor calculado al momento de creación (no recalcula)

3. **CostBreakdown** (tabla separada): Guarda desglose completo
   ```prisma
   model CostBreakdown {
     id            String @id @default(cuid())
     quoteItemId   String @unique
     basePrice     Decimal
     profilePrice  Decimal
     glassPrice    Decimal
     accessoryPrice Decimal
     servicesPrice Decimal
     createdAt     DateTime @default(now())
   }
   ```

4. **PriceHistory** (tabla de auditoría): Registra cambios de precio
   ```prisma
   model PriceHistory {
     id            String @id @default(cuid())
     modelId       String
     changeType    String // 'basePrice' | 'costPerMm' | 'glassDiscount'
     oldValue      Decimal
     newValue      Decimal
     changedAt     DateTime @default(now())
     changedBy     String // userId
   }
   ```

### Idempotencia (tRPC Procedures)

**No aplicable**: tRPC no soporta Idempotency-Key headers (concepto REST/HTTP)

**Mitigación**:

1. **Optimistic UI Updates**: React Query maneja reintentos
2. **Deduplicación**: tRPC batchea requests automáticamente
3. **User Feedback**: Loading states + toast notifications previenen múltiples clicks

### Logging y Observabilidad

**Winston Logger** (server-side only):

```typescript
// Correlation ID por request
logger.info('Quote created', {
  quoteId,
  userId,
  itemCount,
  total,
  correlationId: headers().get('x-request-id')
});

logger.error('Export failed', {
  quoteId,
  error: error.message,
  stack: error.stack
});
```

**Métricas clave**:

- tRPC procedure durations (via middleware)
- Export generation times (PDF/Excel)
- Cart → Quote conversion rate
- Error rates por endpoint

### Multi-Tenant Isolation

**TenantConfig Singleton** (id = "1"):

- NO multi-tenancy real (una instancia = un negocio)
- Para multi-tenant real → Requiere v2.0 refactoring:
  - `tenantId` en todas las tablas
  - Row-level security (RLS) en Prisma middleware
  - Subdomain/path-based routing

### Deprecated Features (Remover en v2.0)

#### 1. Campo `purpose` (GlassType)

```prisma
// DEPRECATED: Usar GlassSolution Many-to-Many
purpose GlassPurpose? // basic, tempered, laminated, dvh, low_e, triple_glazed, combined
```

**Migración**:

```typescript
// Fallback utility (eliminar en v2.0)
export function getPurposeFromSolutions(solutions: GlassSolution[]): GlassPurpose {
  if (solutions.some(s => s.type === 'DVH')) return 'dvh';
  if (solutions.some(s => s.type === 'triple_glazed')) return 'triple_glazed';
  // ... más casos
  return 'basic';
}
```

#### 2. Modelo `Manufacturer`

**Reemplazado por**: TenantConfig + ProfileSupplier  
**Estado**: Migración completa, modelo eliminado  
**Documentación**: `docs/migrations/manufacturer-to-tenant-migration.md`

#### 3. Campo `contactAddress` (Quote)

```prisma
// DEPRECATED: Usar project* fields
contactAddress String? @db.Text
```

**Migración**:

```typescript
// Una sola vez al iniciar v2.0
await prisma.quote.updateMany({
  where: { contactAddress: { not: null } },
  data: {
    projectAddress: { $set: '$contactAddress' }, // PostgreSQL syntax
    contactAddress: null
  }
});
```

### Seguridad

#### Autenticación

- **Google OAuth**: NextAuth.js v5 con JWT sessions
- **Session Validation**: Middleware en rutas protegidas
- **CSRF Protection**: Built-in en Next.js Server Actions

#### Autorización

```typescript
// Protección de admin procedures
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});
```

#### Validación de Inputs

- **Zod schemas**: Validación end-to-end (cliente + servidor)
- **Sanitización**: Prisma ORM previene SQL injection
- **Rate Limiting**: TODO v2.0 (usar Upstash Redis)

### Performance Optimizations

#### Database

```typescript
// Indexes críticos (ya aplicados en migrations)
@@index([profileSupplierId])
@@index([userId])
@@index([status])
@@index([createdAt])

// Eager loading para evitar N+1
const quotes = await prisma.quote.findMany({
  include: {
    items: {
      include: { model: true, glassType: true, services: true }
    }
  }
});
```

#### Caching

```typescript
// ISR para catálogo (Next.js)
export const revalidate = 3600; // 1 hora

// React Query cache (cliente)
const { data } = api.catalog['list-models'].useQuery(
  { ... },
  { staleTime: 5 * 60 * 1000 } // 5 minutos
);
```

#### Bundle Optimization

- Server Components por defecto (menos JS en cliente)
- Dynamic imports para export libraries (code splitting)
- SVG diagrams optimizados (<2KB cada uno)

### Backup y Recovery

**Recomendaciones** (no implementado en v1.5):

1. **Automated Backups**: Postgres WAL archiving
2. **Point-in-Time Recovery**: WAL retention 7 días
3. **Disaster Recovery**: Réplica en región secundaria
4. **Snapshot Frequency**: Diario + incremental cada 6 horas

### Monitoring Checklist

- [ ] Winston logs centralizados (e.g., CloudWatch, Datadog)
- [ ] Error tracking (Sentry integration)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database slow query logs
- [ ] Disk space alerts (Prisma migrations folder)
- [ ] Export generation failure alerts

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


## Roadmap y Plan de Implementación

### v1.5 (ACTUAL - Octubre 2025) ✅ COMPLETADO

**Estado**: En producción  
**Funcionalidades**: Multi-tenant singleton, Glass Solutions Many-to-Many, Budget Cart, My Quotes UX Redesign  
**Métricas**: 60/60 tareas completadas, 193 tests pasando, 95% export success rate

#### Características Implementadas

1. **TenantConfig Singleton**
   - Configuración global del negocio (id="1")
   - Regional settings (currency, locale, timezone)
   - Branding (logo, colors)
   - Quote validity configuration

2. **ProfileSupplier System**
   - Gestión de proveedores de perfiles (Rehau, Deceuninck, Veka, etc.)
   - Material types (PVC, ALUMINUM, WOOD, MIXED)
   - Active/inactive status

3. **Glass Solutions Standards-Based**
   - Many-to-Many GlassType ↔ GlassSolution
   - Performance ratings (EN/ISO standards)
   - 7 solution types with detailed specifications

4. **Budget Cart Workflow**
   - SessionStorage persistence (sin cuenta)
   - CRUD operations (add, update, remove, clear)
   - Real-time validations
   - Direct conversion to Quote

5. **My Quotes UX Redesign**
   - Advanced filtering (status, search, sort)
   - Visual product images (22 SVG diagrams)
   - Professional PDF/Excel export
   - URL-synced filters (shareable links)
   - Clear status labels vs confusing "Borrador"

6. **Project Data Structured**
   - projectName, projectAddress, projectCity, projectRegion, projectCountry, projectZipCode
   - Deprecation of contactAddress field

7. **Performance Optimizations**
   - ISR (Incremental Static Regeneration)
   - React Query caching
   - Debounced search (300ms)
   - Server Components first

### v2.0 (Q2 2026) 🚀 PLANIFICADO

**Objetivo**: Eliminar código deprecado, agregar multi-tenancy real, y nuevas funcionalidades empresariales

#### Fase 1: Technical Debt Cleanup (Sprint 1-2)

**Remover Deprecations**:

1. **Modelo Manufacturer** ✅ YA ELIMINADO
   - Migration completa a TenantConfig + ProfileSupplier
   - No action required

2. **Campo `purpose` (GlassType)**
   - Remover columna, enum `GlassPurpose`, utilities fallback
   - 100% cobertura con GlassSolution Many-to-Many
   - Estimación: 2 días (migration + tests)

3. **Campo `contactAddress` (Quote)**
   - Data migration a project* fields
   - Remover columna y validadores
   - Estimación: 1 día

**Testing de Regresión**:
- 3 días de QA intensivo
- Coverage target: 95%+ (actual: ~90%)
- Performance benchmarks: Mantener v1.5 levels

#### Fase 2: Multi-Tenancy Real (Sprint 3-4)

**Objetivo**: Una instancia → Múltiples negocios independientes

**Cambios Arquitectónicos**:

```prisma
model Tenant {
  id          String @id @default(cuid())
  subdomain   String @unique // e.g., 'vitroglasslite' → vitroglasslite.glasify.app
  domain      String? @unique // Custom domain
  
  // Config anteriormente en TenantConfig
  businessName String
  currency     String
  locale       String
  // ... todos los campos de TenantConfig
  
  // Relaciones
  profileSuppliers ProfileSupplier[]
  models           Model[]
  glassTypes       GlassType[]
  services         Service[]
  users            User[]
  quotes           Quote[]
}

// Middleware para row-level security
prisma.$use(async (params, next) => {
  const tenantId = await getTenantIdFromRequest();
  params.args.where = { ...params.args.where, tenantId };
  return next(params);
});
```

**Routing**:
- Subdomain-based: `[tenant].glasify.app`
- Path-based fallback: `glasify.app/t/[tenant]`

**Estimación**: 3 semanas (alto riesgo arquitectónico)

#### Fase 3: Nuevas Funcionalidades (Sprint 5-8)

**1. Inventario y Stock Management** (Sprint 5-6)

```prisma
model Inventory {
  id             String @id @default(cuid())
  tenantId       String
  modelId        String
  location       String // Warehouse/Store
  quantityInStock Int
  reservedQuantity Int // Allocated to quotes
  reorderPoint   Int
  lastRestocked  DateTime?
}

model StockMovement {
  id          String @id @default(cuid())
  inventoryId String
  type        String // 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVED'
  quantity    Int
  reason      String
  userId      String
  createdAt   DateTime @default(now())
}
```

**Features**:
- Auto-reserve stock al crear Quote (status='sent')
- Release stock al cancelar Quote
- Low stock alerts (email/SMS)
- Stock movements audit trail

**Estimación**: 2 semanas

**2. Logística y Transporte** (Sprint 7)

```prisma
model DeliveryZone {
  id          String @id @default(cuid())
  tenantId    String
  name        String
  polygon     Json // GeoJSON polygon
  baseRate    Decimal
  ratePerKm   Decimal
}

model Shipment {
  id            String @id @default(cuid())
  quoteId       String @unique
  deliveryZoneId String?
  address       String
  scheduledDate DateTime
  status        String // 'pending' | 'in_transit' | 'delivered'
  driver        String?
  trackingUrl   String?
}
```

**Features**:
- Automatic delivery cost calculation
- Zone-based pricing
- Delivery scheduling
- Real-time tracking (integración con APIs externas)

**Estimación**: 1.5 semanas

**3. Pasarela de Pagos** (Sprint 8)

**Integraciones**:
- Stripe (global)
- Mercado Pago (LATAM)
- PayPal (fallback)

```prisma
model Payment {
  id              String @id @default(cuid())
  quoteId         String
  provider        String // 'stripe' | 'mercadopago' | 'paypal'
  providerPaymentId String
  amount          Decimal
  currency        String
  status          String // 'pending' | 'completed' | 'failed' | 'refunded'
  paidAt          DateTime?
  metadata        Json
}
```

**Features**:
- Partial payments (deposits)
- Payment links (send via email/WhatsApp)
- Automatic invoice generation
- Refund management

**Estimación**: 2 semanas

**4. Cálculos Estructurales Avanzados** (Sprint 9-10)

**Objetivo**: Validar capacidad estructural de ventanas según normas

```prisma
model StructuralCalc {
  id                String @id @default(cuid())
  quoteItemId       String @unique
  windLoad          Decimal // kN/m²
  snowLoad          Decimal // kN/m²
  seismicZone       String
  deflectionLimit   Decimal // mm
  safetyFactor      Decimal
  isApproved        Boolean
  calculatedBy      String
  calculatedAt      DateTime
  certificationUrl  String?
}
```

**Features**:
- Wind load calculations (ASCE 7, Eurocode 1)
- Deflection analysis
- Safety factor verification
- PDF certification generation
- Integration with engineering software (e.g., SAP2000 API)

**Estimación**: 3 semanas (requiere validación con ingeniero estructural)

#### Fase 4: Polish & Release (Sprint 11)

**Actividades**:
- Security audit (penetration testing)
- Performance optimization (target: <100ms P50 for all procedures)
- Documentation update (PRD, API docs, user guides)
- Migration guides for v1.5 → v2.0
- Beta testing con 5 clientes piloto
- Production deployment

**Estimación**: 2 semanas

### Timeline Estimado v2.0

| Fase             | Sprints       | Semanas        | Inicio      | Fin         |
| ---------------- | ------------- | -------------- | ----------- | ----------- |
| 1. Cleanup       | 1-2           | 4              | 2026-04-01  | 2026-04-28  |
| 2. Multi-Tenancy | 3-4           | 4              | 2026-04-29  | 2026-05-26  |
| 3. Features      | 5-8           | 8              | 2026-05-27  | 2026-07-21  |
| 4. Release       | 9             | 2              | 2026-07-22  | 2026-08-04  |
| **TOTAL**        | **9 sprints** | **18 semanas** | **Q2 2026** | **Q3 2026** |

**Team Size**: 3 devs fullstack + 1 QA + 0.5 PM

### v3.0 (Q1 2027) 🔮 VISIÓN

**Features Exploradas**:

1. **Machine Learning**
   - Predicción de precios basada en histórico
   - Recomendaciones de productos similares
   - Detección de fraude en cotizaciones

2. **Mobile Apps**
   - React Native (iOS/Android)
   - Offline-first con sync
   - Barcode scanning para inventario

3. **Advanced Analytics**
   - Dashboard de ventas (Charts, KPIs)
   - Conversion funnel analysis
   - Customer segmentation

4. **Internationalization**
   - Multi-language UI (EN, PT, FR)
   - Multi-currency real-time conversion
   - Localized compliance (EU, USA, LATAM)

---

## Conclusión

**Glasify Lite v1.5** es una aplicación completa de gestión de cotizaciones para fabricantes/distribuidores de ventanas y puertas, con arquitectura moderna basada en Next.js 15, tRPC, y Prisma.

### Logros v1.5

✅ **60/60 tareas completadas** (My Quotes UX Redesign)  
✅ **193 tests pasando** (unit, integration, contract)  
✅ **Performance**: 25-75% más rápido que targets  
✅ **Accesibilidad**: WCAG 2.1 AA compliant  
✅ **Multi-tenant**: Arquitectura singleton funcional  
✅ **Glass Solutions**: Sistema basado en estándares EN/ISO  
✅ **Export**: PDF/Excel profesional con branding  

### Estado de Producción

- **Funcional**: Listo para uso productivo
- **Estable**: Sin bugs críticos conocidos
- **Documentado**: PRD, architecture docs, migration guides
- **Testeado**: Alta cobertura de tests
- **Performance**: Cumple/excede todos los targets

### Próximos Pasos

1. **Corto Plazo** (Q4 2025): Monitoreo en producción, bugfixes menores
2. **Medio Plazo** (Q1 2026): Planificación detallada v2.0
3. **Largo Plazo** (Q2-Q3 2026): Desarrollo y release v2.0

### Contacto

**Proyecto**: glasify-lite  
**Owner**: Andeveling  
**Documentación**: `/docs/` (PRD, architecture, migrations)  
**Constitution**: `/.specify/memory/constitution.md`  

Para contribuciones, seguir [Development Guidelines](../.serena/memories/development_guidelines.md)

---

**Fin del PRD v1.5**  
**Última actualización**: 2025-10-12  
**Versión del documento**: 1.5.0

