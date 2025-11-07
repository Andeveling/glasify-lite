# Data Model: Client Quote Wizard

**Feature**: Client Quote Wizard  
**Branch**: `015-client-quote-wizard`  
**Date**: 2025-10-28  
**Phase**: 1 - Design & Contracts

---

## Overview

This document defines the data structures and relationships for the Client Quote Wizard feature. The wizard uses existing database models (no migrations required) and introduces client-side TypeScript types for state management.

---

## Database Models (Existing - No Changes)

### Model
```prisma
model Model {
  id          String   @id @default(cuid())
  name        String
  description String?
  imageUrl    String?
  // ... other fields
  
  // Relations
  quoteItems  QuoteItem[]
  colors      ModelColor[]
  // ... other relations
}
```

**Used by**: Wizard fetches model data server-side (already done in page.tsx)

---

### GlassSolution
```prisma
model GlassSolution {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String   // e.g., 'thermal', 'acoustic', 'solar', 'security'
  priceModifier Decimal @default(0) // Price multiplier or addition
  // ... other fields
  
  // Relations
  quoteItems  QuoteItem[]
}
```

**Used by**: Step 3 displays glass solutions as visual cards with category-based icons

---

### Service
```prisma
model Service {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal
  isOptional  Boolean  @default(true)
  // ... other fields
  
  // Relations
  quoteItems  QuoteItem[]
}
```

**Used by**: Step 4 displays optional services as checkboxes

---

### Color (via ModelColor relationship)
```prisma
model Color {
  id          String   @id @default(cuid())
  name        String
  hexCode     String
  priceModifier Decimal @default(0) // Percentage (e.g., 15 for +15%)
  // ... other fields
  
  // Relations
  models      ModelColor[]
}
```

**Used by**: Step 2 displays available colors for the selected model

---

### QuoteItem (Target Output)
```prisma
model QuoteItem {
  id              String   @id @default(cuid())
  quoteId         String?  // Null for budget items
  modelId         String
  roomLocation    String?  // NEW FIELD from US-008 (already exists or will be added)
  width           Int      // millimeters
  height          Int      // millimeters
  colorId         String?
  glassSolutionId String?
  quantity        Int      @default(1)
  // ... other fields
  
  // Relations
  model           Model        @relation(fields: [modelId], references: [id])
  color           Color?       @relation(fields: [colorId], references: [id])
  glassSolution   GlassSolution? @relation(fields: [glassSolutionId], references: [id])
  services        Service[]    // Many-to-many via join table
}
```

**Transformation**: Wizard formData → QuoteItem on final submission

---

## Client-Side Types (New)

### WizardFormData
```typescript
/**
 * Complete wizard state - persisted to localStorage
 */
export interface WizardFormData {
  // Step 1: Location
  roomLocation: string; // Selected from ROOM_LOCATIONS or custom input
  
  // Step 2: Dimensions + Color
  width: number;  // millimeters (500-3000)
  height: number; // millimeters (500-3000)
  colorId: string | null; // Optional color selection
  
  // Step 3: Glass Solution
  glassSolutionId: string | null; // Required before proceeding
  
  // Step 4: Services
  selectedServices: string[]; // Array of Service IDs
  
  // Metadata
  modelId: string; // From route params
  currentStep: number; // 1-4 (summary is step 5 but not in formData)
  lastUpdated: string; // ISO timestamp for cache validation
}
```

**Validation**:
```typescript
// wizard-form.schema.ts
export const wizardFormSchema = z.object({
  roomLocation: z.string().min(1, 'Selecciona una ubicación').max(100),
  width: z.number().min(500, 'Ancho mínimo: 500mm').max(3000, 'Ancho máximo: 3000mm'),
  height: z.number().min(500, 'Alto mínimo: 500mm').max(3000, 'Alto máximo: 3000mm'),
  colorId: z.string().nullable(),
  glassSolutionId: z.string().nullable(),
  selectedServices: z.array(z.string()),
  modelId: z.string().cuid(),
  currentStep: z.number().min(1).max(5),
  lastUpdated: z.string().datetime()
});
```

---

### WizardStep Configuration
```typescript
/**
 * Step metadata for navigation and rendering
 */
export interface WizardStepConfig {
  stepNumber: number; // 1-4
  title: string; // Spanish UI text
  description?: string; // Optional helper text
  validationSchema: z.ZodSchema; // Zod schema for this step only
  isComplete: (formData: WizardFormData) => boolean; // Can proceed?
}

// Example
const WIZARD_STEPS: WizardStepConfig[] = [
  {
    stepNumber: 1,
    title: '¿Dónde irá la ventana?',
    validationSchema: locationStepSchema,
    isComplete: (data) => !!data.roomLocation
  },
  {
    stepNumber: 2,
    title: 'Dimensiones',
    validationSchema: dimensionsStepSchema,
    isComplete: (data) => data.width > 0 && data.height > 0
  },
  // ... steps 3-4
];
```

---

### RoomLocationOption
```typescript
/**
 * Predefined room locations (from US-008)
 */
export type RoomLocationOption = typeof ROOM_LOCATIONS[number];

export const ROOM_LOCATIONS = [
  'Alcoba principal',
  'Alcoba secundaria',
  'Sala / Comedor',
  'Cocina',
  'Baño principal',
  'Baño secundario',
  'Oficina / Estudio',
  'Balcón / Terraza',
  'Escalera / Pasillo',
] as const;
```

---

### GlassSolutionCategory
```typescript
/**
 * Glass solution categories for icon mapping
 */
export type GlassSolutionCategory = 'thermal' | 'acoustic' | 'solar' | 'security';

export interface GlassSolutionWithIcon {
  id: string;
  name: string;
  description: string;
  category: GlassSolutionCategory;
  priceModifier: number;
  icon: LucideIcon; // From lucide-react
  iconColor: string; // Tailwind class
}
```

---

### PriceCalculation (Transient)
```typescript
/**
 * Real-time price calculation result
 * NOT persisted, recalculated on demand
 */
export interface PriceCalculation {
  basePrice: number; // Model base price
  dimensionPrice: number; // Based on area (width × height)
  colorModifier: number; // Percentage or flat fee
  glassSolutionModifier: number; // From GlassSolution.priceModifier
  servicesTotal: number; // Sum of selected services
  subtotal: number; // Before services
  total: number; // Final price
  currency: string; // e.g., 'USD', 'PAB'
}
```

**Calculation**: Handled by existing tRPC procedure `quote.calculate-item-price`

---

## State Transitions

### Wizard Flow
```
┌─────────────┐
│   START     │ User navigates to /catalog/[modelId]
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Step 1     │ Select roomLocation
│  Location   │ → Validate: required, max 100 chars
└──────┬──────┘
       │ NEXT
       ▼
┌─────────────┐
│  Step 2     │ Enter width, height, select colorId (optional)
│  Dimensions │ → Validate: 500 ≤ width/height ≤ 3000
└──────┬──────┘ → Calculate price (debounced 300ms)
       │ NEXT
       ▼
┌─────────────┐
│  Step 3     │ Select glassSolutionId
│  Glass      │ → Validate: required
└──────┬──────┘ → Update price
       │ NEXT
       ▼
┌─────────────┐
│  Step 4     │ Check selectedServices (array)
│  Services   │ → Validate: optional
└──────┬──────┘ → Update total price
       │ VER RESUMEN
       ▼
┌─────────────┐
│  Step 5     │ Review all selections + final price
│  Summary    │ → Display readonly summary
└──────┬──────┘
       │ AGREGAR AL PRESUPUESTO
       ▼
┌─────────────┐
│   SUBMIT    │ Transform WizardFormData → CreateQuoteItemInput
└──────┬──────┘ Call budget.add-item mutation
       │
       ▼
┌─────────────┐
│  SUCCESS    │ Clear localStorage
│  Redirect   │ Show toast, refresh budget cache
└─────────────┘
```

**Back Navigation**: Any step can go BACK to previous step without losing data

**Auto-save**: After each step change, save to localStorage (key: `wizard-progress-${modelId}`)

---

## Validation Rules

### Step 1: Location
```typescript
const locationStepSchema = z.object({
  roomLocation: z.string()
    .min(1, 'Selecciona una ubicación')
    .max(100, 'Ubicación muy larga (máx. 100 caracteres)')
});
```

---

### Step 2: Dimensions
```typescript
const dimensionsStepSchema = z.object({
  width: z.number()
    .min(500, 'Ancho mínimo: 500mm')
    .max(3000, 'Ancho máximo: 3000mm')
    .int('Ingresa un número entero'),
  height: z.number()
    .min(500, 'Alto mínimo: 500mm')
    .max(3000, 'Alto máximo: 3000mm')
    .int('Ingresa un número entero'),
  colorId: z.string().cuid().nullable()
});
```

---

### Step 3: Glass Solution
```typescript
const glassStepSchema = z.object({
  glassSolutionId: z.string()
    .cuid('Solución de vidrio inválida')
    .min(1, 'Selecciona una solución de vidrio')
});
```

---

### Step 4: Services
```typescript
const servicesStepSchema = z.object({
  selectedServices: z.array(z.string().cuid())
    .default([]) // Empty array if none selected
});
```

---

## Data Transformations

### Wizard → QuoteItem
```typescript
export function transformWizardToQuoteItem(
  wizardData: WizardFormData
): CreateQuoteItemInput {
  return {
    modelId: wizardData.modelId,
    roomLocation: wizardData.roomLocation,
    width: wizardData.width,
    height: wizardData.height,
    colorId: wizardData.colorId || undefined, // null → undefined for Prisma
    glassSolutionId: wizardData.glassSolutionId || undefined,
    serviceIds: wizardData.selectedServices,
    quantity: 1, // Always 1 for wizard-created items
  };
}
```

**Validation**: Apply Zod schema before transformation to ensure data integrity

---

### localStorage → WizardFormData
```typescript
export function parseStoredWizardData(
  stored: string,
  modelId: string
): WizardFormData | null {
  try {
    const parsed = JSON.parse(stored);
    
    // Validate schema
    const validated = wizardFormSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('Invalid stored wizard data:', validated.error);
      return null;
    }
    
    // Ensure modelId matches (prevent cross-model pollution)
    if (validated.data.modelId !== modelId) {
      return null;
    }
    
    return validated.data;
  } catch (e) {
    console.error('Failed to parse wizard data:', e);
    return null;
  }
}
```

---

## Summary

**Database Changes**: None required (uses existing models)

**New Types**: 
- `WizardFormData` (wizard state)
- `WizardStepConfig` (step metadata)
- `GlassSolutionWithIcon` (enriched glass solution)
- `PriceCalculation` (transient calculation result)

**Validation**: Zod schemas for each step + combined schema

**Transformations**: 
- `transformWizardToQuoteItem()` for submission
- `parseStoredWizardData()` for localStorage restoration

**Next**: Generate API contracts in `contracts/` directory
