# Data Model — UI/UX Glasify MVP

Derived from functional specification. Physical model is maintained in Prisma; here we list relevant UI/service entities and rules. Code in English only, UI and feedback in Spanish.

## Entities

### Model
- id: string (UUID)
- name: string
- manufacturerId: string
- widthRange: { min: number; max: number } // mm
- heightRange: { min: number; max: number } // mm
- basePrice: decimal(12,2)
- glassCompatibilities: GlassType[] // by thickness, usage

Validations:
- min <= max on both axes
- basePrice >= 0

### GlassType
- id: string
- name: string
- type: 'tempered' | 'laminated' | 'float' | 'low-e' | 'dvh' | 'triple'
- thicknessMm: number
- attributes: { thermal?: boolean; acoustic?: boolean; security?: boolean }

### Service
- id: string
- name: string
- type: 'area' | 'perimeter' | 'fixed'
- unitPrice: decimal(12,2)

### Quote
- id: string
- status: 'draft' | 'sent' | 'confirmed'
- clientId?: string
- items: QuoteItem[]
- adjustments: { percentage?: number; fixed?: number }
- total: decimal(12,2)

### QuoteItem
- id: string
- modelId: string
- widthMm: number
- heightMm: number
- glassId: string
- services: Array<{ serviceId: string; quantity: number }>
- quantity: number
- subtotal: decimal(12,2)

Validations:
- width/height within Model range
- glass compatible with Model
- quantity >= 1

## Calculation Rules

P_item = basePrice + costPerMmWidth × deltaWidth + costPerMmHeight × deltaHeight + sum(services) + accessories
- All amounts in DECIMAL(12,2)
- Target times: <200ms

## Relationships
- Manufacturer 1..N Models
- Model N..N GlassType (compatibility)
- Quote 1..N QuoteItem