# Quickstart Guide: Client Quote Wizard

**Feature**: Client Quote Wizard  
**Branch**: `015-client-quote-wizard`  
**Date**: 2025-10-28  
**Phase**: 1 - Design & Contracts

---

## Overview

This guide provides step-by-step instructions to implement the Client Quote Wizard feature. Follow phases in order for a systematic, testable approach.

---

## Prerequisites

- [x] Branch `015-client-quote-wizard` checked out
- [x] Dependencies installed (`pnpm install`)
- [x] Development server running (`pnpm dev`)
- [x] Database seeded with models, glass solutions, colors, and services

---

## Phase 0: Setup & Verify Existing APIs

### Step 1: Verify Existing tRPC Procedures

**Goal**: Ensure all required API endpoints exist or identify gaps

```bash
# Check catalog router
grep -r "get-model-by-id" src/server/api/routers/catalog.ts

# Check quote/budget routers
grep -r "calculate.*price" src/server/api/routers/
grep -r "add-item" src/server/api/routers/budget.ts
```

**Expected**:
- ✅ `catalog.get-model-by-id` exists
- ⚠️ `quote.calculate-item-price` may need `serviceIds` parameter
- ⚠️ `budget.add-item` may need `roomLocation` parameter (US-008)

**Action**: Update procedures if parameters missing (see `contracts/wizard-api.md`)

---

### Step 2: Verify Database Schema

**Goal**: Confirm QuoteItem has roomLocation field (US-008)

```bash
# Check Prisma schema
grep -A 10 "model QuoteItem" prisma/schema.prisma | grep roomLocation
```

**If missing**:
```prisma
model QuoteItem {
  // ... existing fields
  roomLocation  String?  @db.VarChar(100)  // Add this line
}
```

**Run migration**:
```bash
pnpm prisma migrate dev --name add-room-location-to-quote-item
```

---

## Phase 1: File Structure & Constants

### Step 1: Create Directory Structure

```bash
cd src/app/\(public\)/catalog/\[modelId\]/

# Create wizard component directories
mkdir -p _components/quote-wizard/steps
mkdir -p _hooks
mkdir -p _schemas
mkdir -p _utils
mkdir -p _constants
```

---

### Step 2: Create Constants Files

**File**: `_constants/room-locations.constants.ts`
```typescript
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

export type RoomLocationOption = typeof ROOM_LOCATIONS[number];
```

**File**: `_constants/wizard-config.constants.ts`
```typescript
export const MIN_DIMENSION = 500; // millimeters
export const MAX_DIMENSION = 3000; // millimeters
export const DEBOUNCE_DELAY = 300; // milliseconds
export const LOCALSTORAGE_KEY_PREFIX = 'wizard-progress';
export const WIZARD_TOTAL_STEPS = 4;
```

**File**: `_constants/glass-solution-icons.constants.ts`
```typescript
import { Flame, Volume2, Sun, Shield } from 'lucide-react';

export const GLASS_SOLUTION_ICONS = {
  thermal: { icon: Flame, label: 'Térmico', color: 'text-orange-500' },
  acoustic: { icon: Volume2, label: 'Acústico', color: 'text-blue-500' },
  solar: { icon: Sun, label: 'Solar', color: 'text-yellow-500' },
  security: { icon: Shield, label: 'Seguridad', color: 'text-green-500' }
} as const;
```

---

## Phase 2: Types & Schemas

### Step 1: Define Types

**File**: `_utils/wizard-form.utils.ts`
```typescript
export interface WizardFormData {
  roomLocation: string;
  width: number;
  height: number;
  colorId: string | null;
  glassSolutionId: string | null;
  selectedServices: string[];
  modelId: string;
  currentStep: number;
  lastUpdated: string;
}

export function getWizardDefaults(modelId: string): WizardFormData {
  return {
    roomLocation: '',
    width: 0,
    height: 0,
    colorId: null,
    glassSolutionId: null,
    selectedServices: [],
    modelId,
    currentStep: 1,
    lastUpdated: new Date().toISOString()
  };
}

export function transformWizardToQuoteItem(data: WizardFormData) {
  return {
    modelId: data.modelId,
    roomLocation: data.roomLocation,
    width: data.width,
    height: data.height,
    colorId: data.colorId || undefined,
    glassSolutionId: data.glassSolutionId || undefined,
    serviceIds: data.selectedServices,
    quantity: 1
  };
}
```

---

### Step 2: Create Validation Schemas

**File**: `_schemas/wizard-steps.schema.ts`
```typescript
import { z } from 'zod';
import { MIN_DIMENSION, MAX_DIMENSION } from '../_constants/wizard-config.constants';

export const locationStepSchema = z.object({
  roomLocation: z.string()
    .min(1, 'Selecciona una ubicación')
    .max(100, 'Ubicación muy larga (máx. 100 caracteres)')
});

export const dimensionsStepSchema = z.object({
  width: z.number()
    .min(MIN_DIMENSION, `Ancho mínimo: ${MIN_DIMENSION}mm`)
    .max(MAX_DIMENSION, `Ancho máximo: ${MAX_DIMENSION}mm`)
    .int('Ingresa un número entero'),
  height: z.number()
    .min(MIN_DIMENSION, `Alto mínimo: ${MIN_DIMENSION}mm`)
    .max(MAX_DIMENSION, `Alto máximo: ${MAX_DIMENSION}mm`)
    .int('Ingresa un número entero'),
  colorId: z.string().nullable()
});

export const glassStepSchema = z.object({
  glassSolutionId: z.string()
    .min(1, 'Selecciona una solución de vidrio')
});

export const servicesStepSchema = z.object({
  selectedServices: z.array(z.string()).default([])
});
```

**File**: `_schemas/wizard-form.schema.ts`
```typescript
import { z } from 'zod';
import {
  locationStepSchema,
  dimensionsStepSchema,
  glassStepSchema,
  servicesStepSchema
} from './wizard-steps.schema';

export const wizardFormSchema = z.object({
  ...locationStepSchema.shape,
  ...dimensionsStepSchema.shape,
  ...glassStepSchema.shape,
  ...servicesStepSchema.shape,
  modelId: z.string(),
  currentStep: z.number().min(1).max(5),
  lastUpdated: z.string().datetime()
});

export type WizardFormData = z.infer<typeof wizardFormSchema>;
```

---

## Phase 3: Custom Hooks

### Step 1: localStorage Persistence Hook

**File**: `_hooks/use-wizard-persistence.ts`
```typescript
import { useCallback } from 'react';
import { LOCALSTORAGE_KEY_PREFIX } from '../_constants/wizard-config.constants';
import type { WizardFormData } from '../_schemas/wizard-form.schema';

export function useWizardPersistence(modelId: string) {
  const storageKey = `${LOCALSTORAGE_KEY_PREFIX}-${modelId}`;
  
  const saveProgress = useCallback((data: WizardFormData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }
  }, [storageKey]);
  
  const restoreProgress = useCallback((): WizardFormData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, [storageKey]);
  
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      // Ignore
    }
  }, [storageKey]);
  
  return { saveProgress, restoreProgress, clearProgress };
}
```

---

### Step 2: Wizard Navigation Hook

**File**: `_hooks/use-wizard-navigation.ts`
```typescript
import { useState, useCallback } from 'react';
import { WIZARD_TOTAL_STEPS } from '../_constants/wizard-config.constants';

export function useWizardNavigation(initialStep = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const goToNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_TOTAL_STEPS + 1)); // +1 for summary
  }, []);
  
  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= WIZARD_TOTAL_STEPS + 1) {
      setCurrentStep(step);
    }
  }, []);
  
  const canGoNext = currentStep < WIZARD_TOTAL_STEPS + 1;
  const canGoBack = currentStep > 1;
  
  return { currentStep, goToNext, goBack, goToStep, canGoNext, canGoBack };
}
```

---

### Step 3: Add to Budget Mutation Hook

**File**: `_hooks/use-add-to-budget.ts`
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // or your toast library
import { api } from '@/trpc/client';
import type { WizardFormData } from '../_schemas/wizard-form.schema';
import { transformWizardToQuoteItem } from '../_utils/wizard-form.utils';

export function useAddToBudget() {
  const utils = api.useUtils();
  const router = useRouter();
  
  const mutation = api.budget['add-item'].useMutation({
    onSuccess: (data) => {
      toast.success(data.message || 'Ítem agregado al presupuesto');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al agregar ítem');
      console.error('Add to budget failed:', error);
    },
    onSettled: () => {
      void utils.budget.invalidate();
      router.refresh();
    }
  });
  
  const addToBudget = (wizardData: WizardFormData) => {
    const input = transformWizardToQuoteItem(wizardData);
    mutation.mutate(input);
  };
  
  return { addToBudget, isLoading: mutation.isPending };
}
```

---

## Phase 4: Step Components

### Step 1: Location Step

**File**: `_components/quote-wizard/steps/location-step.tsx`
```typescript
'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox'; // Or custom implementation
import { ROOM_LOCATIONS } from '../../../_constants/room-locations.constants';

export function LocationStep() {
  const { register, setValue, watch } = useFormContext();
  const roomLocation = watch('roomLocation');
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="roomLocation">¿Dónde irá la ventana?</Label>
        <Combobox
          value={roomLocation}
          onChange={(value) => setValue('roomLocation', value)}
          options={ROOM_LOCATIONS.map(loc => ({ value: loc, label: loc }))}
          placeholder="Selecciona una ubicación"
          allowCustom
        />
      </div>
    </div>
  );
}
```

**Test**:
```bash
# Run unit test
pnpm test src/app/\(public\)/catalog/\[modelId\]/_components/quote-wizard/steps/location-step.test.tsx
```

---

### Step 2-4: Similar Pattern

Follow same pattern for:
- `dimensions-step.tsx` - Width/height inputs + color selector
- `glass-step.tsx` - Glass solution cards with icons
- `services-step.tsx` - Optional service checkboxes

---

## Phase 5: Main Wizard Component

**File**: `_components/quote-wizard/quote-wizard.tsx`
```typescript
'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardNavigation } from '../../_hooks/use-wizard-navigation';
import { useWizardPersistence } from '../../_hooks/use-wizard-persistence';
import { useAddToBudget } from '../../_hooks/use-add-to-budget';
import { wizardFormSchema } from '../../_schemas/wizard-form.schema';
import { getWizardDefaults } from '../../_utils/wizard-form.utils';
import { LocationStep } from './steps/location-step';
import { DimensionsStep } from './steps/dimensions-step';
import { GlassStep } from './steps/glass-step';
import { ServicesStep } from './steps/services-step';
import { SummaryStep } from './steps/summary-step';
import { WizardProgress } from './wizard-progress';
import { Button } from '@/components/ui/button';

interface QuoteWizardProps {
  modelId: string;
  // ... other props from server
}

export function QuoteWizard({ modelId }: QuoteWizardProps) {
  const { currentStep, goToNext, goBack, canGoNext, canGoBack } = useWizardNavigation();
  const { saveProgress, restoreProgress, clearProgress } = useWizardPersistence(modelId);
  const { addToBudget, isLoading } = useAddToBudget();
  
  const methods = useForm({
    defaultValues: restoreProgress() || getWizardDefaults(modelId),
    resolver: zodResolver(wizardFormSchema),
    mode: 'onChange'
  });
  
  // Auto-save on change
  const formData = methods.watch();
  useEffect(() => {
    saveProgress({ ...formData, currentStep });
  }, [formData, currentStep, saveProgress]);
  
  const handleNext = async () => {
    const isValid = await methods.trigger(); // Validate current step
    if (isValid) goToNext();
  };
  
  const handleSubmit = methods.handleSubmit((data) => {
    addToBudget(data);
    clearProgress();
  });
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <LocationStep />;
      case 2: return <DimensionsStep />;
      case 3: return <GlassStep />;
      case 4: return <ServicesStep />;
      case 5: return <SummaryStep />;
      default: return null;
    }
  };
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <WizardProgress currentStep={currentStep} totalSteps={5} />
        
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            variant="outline"
          >
            Atrás
          </Button>
          
          {currentStep < 5 ? (
            <Button type="button" onClick={handleNext} disabled={!canGoNext}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Agregando...' : 'Agregar al Presupuesto'}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
```

---

## Phase 6: Integration with Page

**File**: `src/app/(public)/catalog/[modelId]/page.tsx`

Add conditional rendering:

```typescript
import { QuoteWizard } from './_components/quote-wizard/quote-wizard';

export default async function Page({ params }: PageProps) {
  const { modelId } = await params;
  const serverModel = await api.catalog["get-model-by-id"]({ modelId });
  
  if (!serverModel) notFound();
  
  // TODO: Add logic to determine when to show wizard vs technical form
  // For now, show wizard by default
  const showWizard = true;
  
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-7xl px-3 py-4">
        {showWizard ? (
          <QuoteWizard modelId={modelId} serverModel={serverModel} />
        ) : (
          <ModelFormWrapper serverModel={serverModel} />
        )}
      </div>
    </div>
  );
}
```

---

## Phase 7: Testing

### Unit Tests
```bash
pnpm test src/app/\(public\)/catalog/\[modelId\]/_hooks/
pnpm test src/app/\(public\)/catalog/\[modelId\]/_utils/
```

### Integration Tests
```bash
pnpm test src/app/\(public\)/catalog/\[modelId\]/_components/quote-wizard/
```

### E2E Tests
```bash
pnpm test:e2e tests/e2e/wizard/
```

---

## Phase 8: Commit & PR

```bash
git add .
git commit -m "feat(wizard): implement client quote wizard with 4-step flow

- Add wizard component structure with SOLID architecture
- Implement localStorage persistence with graceful degradation
- Add responsive mobile design with touch-friendly controls
- Integrate with existing budget API
- Add comprehensive tests (unit/integration/E2E)

Closes #XXX (US-007)"

git push origin 015-client-quote-wizard
```

Create PR with:
- Screenshots/GIFs of wizard flow
- Mobile responsive tests
- Checklist from constitution check
- Link to spec and plan docs

---

## Success Criteria Checklist

Before marking as complete:

- [ ] All 4 wizard steps render correctly
- [ ] Step validation prevents progression with invalid data
- [ ] localStorage auto-save works (test browser refresh)
- [ ] Price updates within 200ms of dimension changes
- [ ] Mobile layout adapts correctly (<768px)
- [ ] Touch targets meet WCAG 2.1 AA (≥44x44px)
- [ ] Add to budget mutation succeeds and refreshes cache
- [ ] All tests pass (unit + integration + E2E)
- [ ] No Winston logger used in Client Components
- [ ] All UI text in Spanish, code/comments in English

---

## Troubleshooting

**Issue**: localStorage not working
- **Fix**: Check browser privacy settings, verify graceful degradation (wizard still works)

**Issue**: Price calculation slow
- **Fix**: Verify 300ms debounce, check TanStack Query cache config

**Issue**: Router refresh not updating UI
- **Fix**: Ensure two-step invalidation: `utils.invalidate()` + `router.refresh()`

**Issue**: Mobile touch targets too small
- **Fix**: Add `min-h-[44px] min-w-[44px]` to interactive elements

---

## Next Steps

After implementation complete:
1. Run `/speckit.tasks` to generate task breakdown
2. Conduct user testing with 5-10 end customers
3. Monitor wizard abandonment rate and time-to-completion metrics
4. Iterate based on feedback before full rollout
