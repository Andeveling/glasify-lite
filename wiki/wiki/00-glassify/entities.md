# Entities — Core Data Entities

**Summary**: Entidades del sistema según `prisma/schema.prisma`. Fuente autoritativa — siempre consultar este archivo.

**Sources**: `(source: prisma/schema.prisma)`

**Last updated**: 2026-04-13

---

## Fuente de Verdad

> **⚠️ IMPORTANTE**: Este documento referencia el schema real. Para cambios, editar `prisma/schema.prisma`.

**Path**: `/home/andres/Proyectos/glasify-project/glasify-lite/prisma/schema.prisma`

**Provider**: SQLite (no PostgreSQL)

## Diagrama de Relaciones (Simplificado)

```
TenantConfig (singleton)
    ├── GlassSupplier[]
    ├── ProfileSupplier[] ──── Model[] ──── QuoteItem[] ──── Quote[] ──── Client
    │                              │
    │                         ModelColor[] ──── Color
    │
    ├── DesignTemplate[] ──── Model[]
    │
    └── GlassType[] ──── GlassTypeSolution[] ──── GlassSolution
                  ──── GlassTypeCharacteristic[] ──── GlassCharacteristic

Quote ──── QuoteItem[] ──── QuoteItemService[] ──── Service
       ──── Adjustment[]
       ──── ProjectAddress
```

## Entidades Principales

### User
- `id`, `name`, `email`, `role` (admin/seller)
- `accounts` [], `sessions` [], `quotes` [], `priceChanges` []

### Client
- `id`, `name`, `email`, `phone`, `company`, `notes`
- `quotes` []

### TenantConfig (Singleton: `id = "1"`)
- `businessName`, `currency` (ISO 4217), `locale` (BCP 47), `timezone` (IANA)
- `quoteValidityDays`, `contactEmail`, `contactPhone`, `businessAddress`
- Branding: `logoUrl`, `primaryColor`, `secondaryColor`
- Social: `facebookUrl`, `instagramUrl`, `linkedinUrl`
- WhatsApp: `whatsappNumber`, `whatsappEnabled`
- Tax: `taxEnabled`, `taxName`, `taxRate`, `taxDescription`
- Transport: `transportBaseRate`, `transportPerKmRate`
- Warehouse: `warehouseCity`, `warehouseLatitude`, `warehouseLongitude`

### Model
- `profileSupplierId` → ProfileSupplier
- `designTemplateId` → DesignTemplate
- `name`, `status` (draft/published)
- Límites: `minWidthMm`, `maxWidthMm`, `minHeightMm`, `maxHeightMm`
- Pricing: `basePrice`, `costPerMmWidth`, `costPerMmHeight`, `accessoryPrice`
- Glass discounts: `glassDiscountWidthMm`, `glassDiscountHeightMm`
- `compatibleGlassTypeIds` (JSON array)
- `profitMarginPercentage`, `costNotes`, `lastCostReviewDate`
- `imageUrl`

### DesignTemplate
- `name` (único, ej: "Corredera 2 hojas")
- `pattern` (ej: "XX", "XO", "OX", "XXO")
- `frameConfig` (JSON), `showArrows`, `showHandles`

### ProfileSupplier
- `name` (Rehau, Deceuninck, etc.), `materialType` (PVC/ALUMINUM/WOOD/MIXED)
- `isActive`, `notes`

### GlassType
- `name`, `code` (único, ej: "N70/38"), `manufacturer`
- `thicknessMm`, `pricePerSqm`
- `uValue`, `lightTransmission`, `solarFactor`
- `series`, `description`, `colorHex`
- `isActive`, `isSeeded`, `seedVersion`
- `characteristics` [], `solutions` [], `quoteItems` []

### GlassSolution
- `key` (único, ej: "security"), `slug`
- `name`, `nameEs` (español)
- `description`, `icon` (Lucide), `sortOrder`
- `isActive`, `isSeeded`, `seedVersion`
- `glassTypes` [] (Many-to-Many via GlassTypeSolution)

### GlassTypeSolution
- `glassTypeId`, `solutionId`
- `performanceRating` (basic/standard/good/very_good/excellent)
- `isPrimary`, `notes`

### GlassCharacteristic
- `key` (único, ej: "tempered"), `name`, `nameEs`
- `description`, `category` (safety/thermal/acoustic/coating)
- `isActive`, `isSeeded`, `seedVersion`, `sortOrder`

### GlassTypeCharacteristic
- `glassTypeId`, `characteristicId`
- `value` (ej: "6.38mm"), `certification` (ej: "EN 12150"), `notes`

### GlassSupplier
- `name` (único), `code`, `country`, `website`
- `contactEmail`, `contactPhone`, `isActive`, `notes`

### Service
- `name`, `type` (area/perimeter/fixed)
- `unit` (unit/sqm/ml), `rate`
- `isActive`, `minimumBillingUnit`

### Color
- `name`, `ralCode`, `hexCode`
- `isActive`
- `modelColors` [], `quoteItems` []

### ModelColor
- `modelId`, `colorId`
- `surchargePercentage`, `isDefault`

### Quote
- `userId` → User, `clientId` → Client
- `status` (draft/sent/accepted/rejected/canceled)
- `currency`, `total`, `validUntil`, `contactPhone`
- `sentAt`, tax snapshot fields
- `projectAddress` → ProjectAddress
- `items` [], `adjustments` []

### QuoteItem
- `quoteId` → Quote, `modelId` → Model, `glassTypeId` → GlassType
- `colorId` → Color
- `widthMm`, `heightMm`, `quantity`
- `name`, `accessoryApplied`, `subtotal`
- `colorHexCode`, `colorName`, `colorSurchargePercentage`
- `roomLocation`
- `services` [], `adjustments` []

### QuoteItemService
- `quoteItemId`, `serviceId`
- `unit`, `quantity`, `amount`

### Adjustment
- `scope` (item/quote), `concept`, `unit`, `value`, `sign` (positive/negative)
- `quoteId` / `quoteItemId`, `amount`

### ProjectAddress
- `quoteId` → Quote (unique)
- `label`, `country`, `region`, `city`, `district`
- `street`, `reference`, `postalCode`

### ModelCostBreakdown
- `modelId` → Model
- `component` (ej: "perfil_vertical"), `costType` (fixed/per_mm_width/per_mm_height/per_sqm)
- `unitCost`, `notes`

### ModelPriceHistory
- `modelId` → Model
- `basePrice`, `costPerMmWidth`, `costPerMmHeight`
- `reason`, `effectiveFrom`, `createdBy` → User

## Enums

| Enum | Valores |
|------|---------|
| `ModelStatus` | draft, published |
| `ServiceType` | area, perimeter, fixed |
| `ServiceUnit` | unit, sqm, ml |
| `QuoteStatus` | draft, sent, accepted, rejected, canceled |
| `AdjustmentScope` | item, quote |
| `AdjustmentSign` | positive, negative |
| `PerformanceRating` | basic, standard, good, very_good, excellent |
| `CostType` | fixed, per_mm_width, per_mm_height, per_sqm |
| `MaterialType` | PVC, ALUMINUM, WOOD, MIXED |
| `UserRole` | admin, seller |

## Relacionados

- [[prd]]
- [[pricing-formula]]
- [[routes]]
