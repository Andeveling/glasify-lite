# Data Model — Glasify MVP

Basado en la sección Key Entities de la spec.

## Manufacturer
- id (string cuid)
- name (string)
- currency (string, ISO 4217)
- quoteValidityDays (int, default 15)
- createdAt, updatedAt

## Model
- id, manufacturerId (FK Manufacturer)
- name (string)
- status (enum: draft|published)
- minWidthMm, maxWidthMm, minHeightMm, maxHeightMm (int mm)
- basePrice (decimal(12,2))
- costPerMmWidth (decimal(12,4))
- costPerMmHeight (decimal(12,4))
- accessoryPrice (decimal(12,2)) optional
- compatibleGlassTypeIds (string[])
- createdAt, updatedAt

## GlassType
- id, manufacturerId
- name (string)
- purpose (enum)
- thicknessMm (int)

## Service
- id, manufacturerId
- name (string)
- type (enum: area|perimeter|fixed)
- unit (enum: unit|sqm|ml)
- rate (decimal(12,4))

## Quote
- id, manufacturerId, userId (nullable)
- status (enum: draft|sent|canceled)
- currency (string)
- total (decimal(12,2))
- validUntil (date)
- createdAt, updatedAt

## QuoteItem
- id, quoteId, modelId, glassTypeId
- widthMm, heightMm (int)
- accessoryApplied (bool)
- subtotal (decimal(12,2)) // suma de componentes redondeados (FR-020)

## QuoteItemService
- id, quoteItemId, serviceId
- unit (enum: unit|sqm|ml)
- quantity (decimal(12,4))
- amount (decimal(12,2))

## Adjustment
- id
- scope (enum: item|quote)
- concept (string)
- unit (enum: unit|sqm|ml)
- value (decimal(12,4)) // multiplicador por unit quantity
- sign (enum: positive|negative)
- targetId (QuoteItem.id si item; Quote.id si quote)
- amount (decimal(12,2)) // monto aplicado post-cálculo

## Reglas y validaciones
- width/height dentro de [min,max] inclusivo.
- Compatibilidad de GlassType por Model.
- Cantidad derivada servicios:
  - area (sqm) = roundHalfUp((widthMm/1000)*(heightMm/1000), 2)
  - perimeter (ml) = roundHalfUp(2*((widthMm+heightMm)/1000), 2)
- Redondeo: cada componente a 2 decimales (FR-020) antes de sumar.
- Ajustes: aplicar por alcance tras subtotal(es); permitir negativos.
