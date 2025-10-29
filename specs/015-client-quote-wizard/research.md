# Research & Technical Decisions: Client Quote Wizard

**Feature**: Client Quote Wizard  
**Branch**: `015-client-quote-wizard`  
**Date**: 2025-10-28  
**Phase**: 0 - Outline & Research

---

## Research Tasks

This document consolidates research findings to resolve technical unknowns and establish best practices for implementation.

---

## 1. Multi-Step Form State Management

### Decision: Custom hook with React Hook Form + Zustand/Context

**Rationale**:
- React Hook Form 7.63.0 already in project, proven for complex forms
- Multi-step requires state persistence across unmounts (step transitions)
- Zustand or React Context can hold wizard-level state (currentStep, formData)
- RHF handles individual step validation and field-level state

**Implementation Pattern**:
```typescript
// use-wizard-form.ts
export function useWizardForm() {
  const { register, handleSubmit, formState, getValues, setValue } = useForm({
    mode: 'onChange',
    resolver: zodResolver(wizardStepSchemas[currentStep])
  });
  
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    formData: getWizardDefaults(),
    errors: {}
  });
  
  return { register, handleSubmit, formState, wizardState, ... };
}
```

**Alternatives Considered**:
- **Formik Multi-Step**: Not in project stack, would add dependency
- **Pure useState**: Requires manual validation, no Zod integration
- **TanStack Form**: Not yet stable, requires learning curve

**Best Practices**:
- Store step-level data separately, merge on final submit
- Validate each step before allowing navigation
- Debounce expensive validations (dimension price updates)
- Use `getValues()` for navigation without triggering validation

---

## 2. localStorage Persistence Strategy

### Decision: Progressive enhancement with graceful degradation

**Rationale**:
- 95%+ browser support for localStorage (spec assumption)
- 5% without it should still complete wizard (just no persistence)
- Key format: `wizard-progress-${modelId}` allows multiple models
- Clear on successful submit to avoid stale data

**Implementation Pattern**:
```typescript
// use-wizard-persistence.ts
export function useWizardPersistence(modelId: string) {
  const storageKey = `wizard-progress-${modelId}`;
  
  const saveProgress = useCallback((data: WizardFormData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      // Quota exceeded or disabled - fail silently
      console.warn('localStorage unavailable:', e);
    }
  }, [storageKey]);
  
  const restoreProgress = useCallback((): WizardFormData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null; // Invalid JSON or unavailable
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

**Alternatives Considered**:
- **SessionStorage**: Lost on browser close (worse UX than localStorage)
- **IndexedDB**: Overkill for simple key-value storage
- **Cookies**: Size limits (4KB), sent with every request (overhead)

**Best Practices**:
- Auto-save on every step change (debounced)
- Prompt user on wizard mount if progress exists: "Continue where you left off?"
- Clear immediately after successful budget addition
- Handle quota exceeded gracefully (don't break wizard)
- Validate restored data against current schema (handle version changes)

---

## 3. Debounced Price Calculation

### Decision: 300ms debounce with AbortController for cancellation

**Rationale**:
- Spec requires <200ms price updates, but 300ms debounce prevents excessive calls
- User typing dimensions triggers many rapid changes
- AbortController cancels in-flight requests if user continues typing
- TanStack Query provides built-in caching for identical queries

**Implementation Pattern**:
```typescript
// use-calculate-price.ts
export function useCalculatePrice() {
  const utils = api.useUtils();
  
  const debouncedCalculate = useMemo(
    () => debounce((params: CalculatePriceParams) => {
      void utils.quote['calculate-item-price'].fetch(params);
    }, 300),
    [utils]
  );
  
  return { debouncedCalculate };
}
```

**Alternatives Considered**:
- **No debounce**: Too many API calls, poor performance
- **500ms debounce**: Feels sluggish to user
- **150ms debounce**: Still too many calls for rapid typing

**Best Practices**:
- Use lodash debounce or custom implementation
- Show loading indicator during calculation
- Display last known price until update completes
- Cancel pending requests on step navigation
- Cache results by dimension+color+glass combination

---

## 4. Mobile Touch Targets & Responsive Design

### Decision: Mobile-first with TailwindCSS breakpoints + Radix UI primitives

**Rationale**:
- TailwindCSS already in stack (sm:, md:, lg: breakpoints)
- Mobile users are 40-60% of traffic (spec assumption)
- Radix UI provides accessible primitives with touch support
- WCAG 2.1 AA requires min 44x44px touch targets

**Implementation Pattern**:
```tsx
// Button sizing
<Button
  className="h-12 min-h-[48px] w-full touch-manipulation sm:h-10 sm:w-auto"
>
  Siguiente
</Button>

// Card touch targets
<Card
  className="cursor-pointer p-4 touch-manipulation hover:bg-accent min-h-[44px]"
  role="button"
  tabIndex={0}
  onClick={handleSelect}
>
  ...
</Card>

// Responsive layout
<div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
  {/* Vertical on mobile, horizontal on desktop */}
</div>
```

**Breakpoints**:
- Mobile: `<768px` (default, no prefix)
- Tablet: `768-1024px` (`md:`)
- Desktop: `>1024px` (`lg:`)

**Alternatives Considered**:
- **Desktop-first**: Would require more overrides for mobile
- **Custom breakpoints**: TailwindCSS defaults match common devices
- **CSS-in-JS**: Not in project stack, TailwindCSS is standard

**Best Practices**:
- Design mobile layout first, enhance for larger screens
- Test on real devices (iOS Safari, Android Chrome)
- Use `touch-manipulation` CSS for snappier touch response
- Numeric inputs use `inputMode="numeric"` for mobile keyboard
- Progress indicator changes from horizontal (desktop) to vertical dots (mobile)

---

## 5. Step Transition Animations

### Decision: Framer Motion (optional) or CSS transitions

**Rationale**:
- Framer Motion is listed as optional dependency in spec
- Provides declarative animations with React
- Can fallback to CSS transitions for bundle size concerns
- Improves perceived performance (users see smooth transitions)

**Implementation Pattern**:
```tsx
// With Framer Motion
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    {renderCurrentStep()}
  </motion.div>
</AnimatePresence>

// Or with pure CSS
.step-enter {
  opacity: 0;
  transform: translateX(20px);
}
.step-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 200ms, transform 200ms;
}
```

**Alternatives Considered**:
- **React Transition Group**: More boilerplate than Framer Motion
- **Pure CSS**: Works but requires manual class toggling
- **No animations**: Abrupt transitions feel unpolished

**Best Practices**:
- Keep transitions short (100-200ms for snappiness)
- Use ease-out for entering, ease-in for exiting
- Respect `prefers-reduced-motion` media query
- Only animate opacity and transform (GPU-accelerated)
- Avoid animating layout properties (width, height)

---

## 6. Glass Solution Visual Categorization

### Decision: Icon mapping + Tailwind styling with existing GlassSolution data

**Rationale**:
- GlassSolution model exists with categorization (thermal, acoustic, solar, security)
- Icons improve scannability for non-technical users
- Shadcn/ui includes Lucide icons (already in project)
- Can add icon field to database or map client-side

**Implementation Pattern**:
```typescript
// glass-solution-icons.constants.ts
import { Flame, Volume2, Sun, Shield } from 'lucide-react';

export const GLASS_SOLUTION_ICONS = {
  thermal: { icon: Flame, label: 'Térmico', color: 'text-orange-500' },
  acoustic: { icon: Volume2, label: 'Acústico', color: 'text-blue-500' },
  solar: { icon: Sun, label: 'Solar', color: 'text-yellow-500' },
  security: { icon: Shield, label: 'Seguridad', color: 'text-green-500' }
} as const;

// Usage
const { icon: Icon, label, color } = GLASS_SOLUTION_ICONS[solution.category];
<Icon className={cn('h-8 w-8', color)} />
```

**Data Quality Check**:
- Verify GlassSolution records have category field populated
- If missing, create migration to add category enum
- Fallback icon if category is unknown

**Alternatives Considered**:
- **Images**: Slower to load, harder to style, need hosting
- **Emoji**: Not accessible, inconsistent across platforms
- **Text only**: Works but less engaging for end users

**Best Practices**:
- Use semantic icons (flame for thermal, volume for acoustic)
- Maintain color consistency (same category = same color)
- Provide alt text for screen readers
- Size icons appropriately for touch targets (min 24x24px within 44x44px card)

---

## 7. Wizard-to-Budget Integration

### Decision: Use existing budget.add-item tRPC procedure with cache invalidation

**Rationale**:
- Budget Cart already exists with tRPC API
- Wizard transforms formData to QuoteItem shape
- Use two-step invalidation (constitution requirement): `invalidate()` + `router.refresh()`
- No new API endpoints needed

**Implementation Pattern**:
```typescript
// use-add-to-budget.ts
export function useAddToBudget() {
  const utils = api.useUtils();
  const router = useRouter();
  
  const addItem = api.budget['add-item'].useMutation({
    onSuccess: () => {
      toast.success('Ítem agregado al presupuesto');
    },
    onError: (error) => {
      toast.error('Error al agregar ítem: ' + error.message);
    },
    onSettled: () => {
      void utils.budget.invalidate(); // Step 1: Clear cache
      router.refresh();                // Step 2: Re-fetch server data
    }
  });
  
  return { addItem };
}
```

**Data Transformation**:
```typescript
// wizard-form.utils.ts
export function transformWizardToQuoteItem(
  wizardData: WizardFormData,
  modelId: string
): CreateQuoteItemInput {
  return {
    modelId,
    roomLocation: wizardData.roomLocation,
    width: wizardData.width,
    height: wizardData.height,
    colorId: wizardData.colorId,
    glassSolutionId: wizardData.glassSolutionId,
    serviceIds: wizardData.selectedServices,
    quantity: 1 // Wizard always creates single item
  };
}
```

**Alternatives Considered**:
- **New wizard-specific endpoint**: Unnecessary duplication
- **Direct Prisma mutation**: Violates server-first principle
- **Optimistic update without refresh**: Doesn't work with SSR (constitution)

**Best Practices**:
- Transform data in utils, not in component
- Type-check transformation output with Zod
- Handle errors gracefully with Spanish toast messages
- Clear wizard localStorage on successful addition
- Redirect to budget page or show confirmation modal

---

## 8. Room Location Data Source

### Decision: Shared constants file matching US-008 spec

**Rationale**:
- US-008 defines standard room locations
- Both wizard (US-007) and quote item form (US-008) need same list
- Extract to shared constants for DRY principle
- Allow free-text "Otro" option for flexibility

**Implementation Pattern**:
```typescript
// room-locations.constants.ts
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

export type RoomLocation = typeof ROOM_LOCATIONS[number] | string;

// Combobox allows both predefined + custom
<Combobox
  options={ROOM_LOCATIONS.map(loc => ({ value: loc, label: loc }))}
  allowCustom
  placeholder="Ej. Alcoba principal"
/>
```

**Alternatives Considered**:
- **Database table**: Overkill for static list that rarely changes
- **Hardcoded in component**: Violates DRY, hard to maintain
- **i18n file**: Not needed (Spanish-only UI)

**Best Practices**:
- Use `as const` for type safety
- Allow custom input for edge cases (user knows better)
- Suggest most common first (alphabetical or frequency-based)
- Validate max length (100 chars per spec)

---

## Summary

All research tasks completed. Key technologies and patterns selected:

1. **State Management**: React Hook Form + useState (wizard-level state)
2. **Persistence**: localStorage with progressive enhancement
3. **Performance**: 300ms debounce + TanStack Query caching
4. **Responsive**: Mobile-first TailwindCSS + Radix UI (44x44px targets)
5. **Animations**: Framer Motion (optional) or CSS transitions (200ms)
6. **Icons**: Lucide icons from Shadcn/ui with category-color mapping
7. **Integration**: Existing budget.add-item API + two-step invalidation
8. **Data**: Shared ROOM_LOCATIONS constants (matching US-008)

**Next Phase**: Proceed to Phase 1 (Design & Contracts) - generate data-model.md and API contracts.
