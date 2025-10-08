---
goal: Refactor DimensionsSection to apply Atomic Design principles and use theme colors
version: 1.0
date_created: 2025-01-08
last_updated: 2025-01-08
owner: Development Team
status: 'Planned'
tags: ['refactor', 'atomic-design', 'theming', 'ui-ux', 'architecture']
---

# Refactor DimensionsSection - Atomic Design & Theme Colors

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

## Introduction

The `DimensionsSection` component is currently a **dense organism** (325 lines) that violates Atomic Design principles by mixing multiple responsibilities and using hardcoded colors instead of theme variables. This refactoring will decompose it into reusable atoms and molecules following the project's Atomic Design architecture.

**Current Issues**:
- **Monolithic component**: All UI logic in a single 325-line file
- **Hardcoded colors**: `text-green-600`, `text-red-600`, `border-red-500` instead of theme variables
- **Poor separation of concerns**: Validation, rendering, and state management mixed
- **Low reusability**: Components cannot be used elsewhere
- **Difficult to test**: Tightly coupled logic

**Expected Benefits**:
- ✅ **Atomic Design compliance**: Clear separation of atoms, molecules, organisms
- ✅ **Theme consistency**: All colors from CSS variables
- ✅ **Reusability**: Components can be used in other contexts
- ✅ **Testability**: Smaller, focused components are easier to test
- ✅ **Maintainability**: Single Responsibility Principle (SRP)

## 1. Requirements & Constraints

### Business Requirements
- **REQ-001**: Maintain exact same UX/UI (no visual changes from user perspective)
- **REQ-002**: All colors must use theme variables (support dark/light mode)
- **REQ-003**: Components must be accessible (WCAG AA compliance)
- **REQ-004**: Preserve immediate visual feedback on slider interactions
- **REQ-005**: Maintain all existing functionality (validation, suggestions, presets)

### Technical Requirements
- **TEC-001**: Follow project's Atomic Design structure (atoms → molecules → organisms → templates)
- **TEC-002**: Use Tailwind CSS theme colors (`text-destructive`, `text-success`, etc.)
- **TEC-003**: Extract reusable components to `src/components/` for atoms/molecules
- **TEC-004**: Keep feature-specific organisms in `_components/` folder
- **TEC-005**: TypeScript strict mode compliance with proper prop types

### Architectural Requirements
- **ARC-001**: **Atoms** go in `src/components/ui/` (Shadcn/ui components)
- **ARC-002**: **Molecules** go in `src/components/` (shared combinations)
- **ARC-003**: **Organisms** go in `src/app/(public)/catalog/[modelId]/_components/form/` (complex, feature-specific)
- **ARC-004**: Follow SOLID principles (especially SRP and OCP)
- **ARC-005**: No business logic in atoms/molecules, only in organisms

### Theme Requirements
- **THM-001**: Use semantic color names from theme (`destructive`, `success`, `muted-foreground`)
- **THM-002**: No hardcoded hex/rgb colors (`#f00`, `rgb(255,0,0)`, etc.)
- **THM-003**: No hardcoded Tailwind color classes (`text-green-600`, `border-red-500`)
- **THM-004**: Use CSS variables when semantic names unavailable
- **THM-005**: Ensure dark mode compatibility

### Constraints
- **CON-001**: Cannot modify Shadcn/ui base components (`src/components/ui/`)
- **CON-002**: Must maintain backward compatibility (same props for DimensionsSection)
- **CON-003**: No new external dependencies
- **CON-004**: Must work with existing form validation (React Hook Form + Zod)

### Guidelines
- **GUD-001**: Atoms should have no dependencies on other custom components
- **GUD-002**: Molecules should only compose atoms
- **GUD-003**: Organisms can compose atoms, molecules, and other organisms
- **GUD-004**: Use `cn()` utility for conditional class composition
- **GUD-005**: Prefer composition over configuration

### Patterns to Follow
- **PAT-001**: Component composition pattern (from Shadcn/ui)
- **PAT-002**: Polymorphic component pattern (`asChild` prop)
- **PAT-003**: Controlled component pattern (for form integration)
- **PAT-004**: Variant-based styling with CVA (class-variance-authority)

## 2. Implementation Steps

### Implementation Phase 1: Analysis and Design

- GOAL-001: Identify atomic decomposition structure and theme color mappings

| Task     | Description                                                        | Completed | Date |
| -------- | ------------------------------------------------------------------ | --------- | ---- |
| TASK-001 | Analyze DimensionsSection and identify atoms, molecules, organisms |           |      |
| TASK-002 | Map all hardcoded colors to theme variables                        |           |      |
| TASK-003 | Design component hierarchy (atoms → molecules → organisms)         |           |      |
| TASK-004 | Create component interface contracts (props, types)                |           |      |
| TASK-005 | Document component responsibilities and boundaries                 |           |      |

### Implementation Phase 2: Create Atoms (Shadcn/ui Components)

- GOAL-002: Identify if new atoms are needed or if existing Shadcn/ui components suffice

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-006 | Review existing atoms in `src/components/ui/` (Badge, Button, Slider, etc.) |           |      |
| TASK-007 | Verify if custom atoms are needed or if Shadcn/ui covers all cases          |           |      |
| TASK-008 | Document which atoms will be used from existing library                     |           |      |

### Implementation Phase 3: Create Molecules (Shared Components)

- GOAL-003: Extract reusable molecules from DimensionsSection

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-009 | Create `DimensionInput` molecule (input + icon + unit + validation state)   |           |      |
| TASK-010 | Create `DimensionSlider` molecule (slider with value display)               |           |      |
| TASK-011 | Create `ValidationIndicator` molecule (Check/AlertCircle with theme colors) |           |      |
| TASK-012 | Create `SuggestedValueBadges` molecule (badge grid with click handlers)     |           |      |
| TASK-013 | Create `QuantityPresets` molecule (button grid for presets)                 |           |      |
| TASK-014 | Add unit tests for each molecule                                            |           |      |

### Implementation Phase 4: Create Organisms (Feature-Specific)

- GOAL-004: Refactor DimensionsSection into smaller organisms

| Task     | Description                                                                         | Completed | Date |
| -------- | ----------------------------------------------------------------------------------- | --------- | ---- |
| TASK-015 | Create `DimensionField` organism (combines input, slider, badges for one dimension) |           |      |
| TASK-016 | Create `DimensionValidationAlert` organism (validation alert with theme colors)     |           |      |
| TASK-017 | Create `QuantityField` organism (quantity input with presets)                       |           |      |
| TASK-018 | Refactor `DimensionsSection` to compose organisms                                   |           |      |
| TASK-019 | Add unit tests for organisms                                                        |           |      |

### Implementation Phase 5: Apply Theme Colors

- GOAL-005: Replace all hardcoded colors with theme variables

| Task     | Description                                                     | Completed | Date |
| -------- | --------------------------------------------------------------- | --------- | ---- |
| TASK-020 | Replace `text-green-600` with `text-success` or theme variable  |           |      |
| TASK-021 | Replace `text-red-600` with `text-destructive`                  |           |      |
| TASK-022 | Replace `border-red-500` with `border-destructive`              |           |      |
| TASK-023 | Replace `text-muted-foreground` (already correct, verify usage) |           |      |
| TASK-024 | Define custom success color in `globals.css` if not exists      |           |      |
| TASK-025 | Test dark mode color consistency                                |           |      |

### Implementation Phase 6: Integration and Testing

- GOAL-006: Integrate refactored components and validate functionality

| Task     | Description                                                 | Completed | Date |
| -------- | ----------------------------------------------------------- | --------- | ---- |
| TASK-026 | Replace old DimensionsSection with new composition          |           |      |
| TASK-027 | Verify form integration (React Hook Form) still works       |           |      |
| TASK-028 | Test all user interactions (slider, input, badges, presets) |           |      |
| TASK-029 | Validate theme colors in light and dark mode                |           |      |
| TASK-030 | Run E2E tests for quote form flow                           |           |      |
| TASK-031 | Performance test: verify no regression in mutation count    |           |      |

### Implementation Phase 7: Documentation and Cleanup

- GOAL-007: Update documentation and clean up unused code

| Task     | Description                                                   | Completed | Date |
| -------- | ------------------------------------------------------------- | --------- | ---- |
| TASK-032 | Add JSDoc comments to all new components                      |           |      |
| TASK-033 | Update Storybook stories (if applicable)                      |           |      |
| TASK-034 | Document component hierarchy in `/docs`                       |           |      |
| TASK-035 | Create migration guide for other forms using similar patterns |           |      |
| TASK-036 | Remove unused code/imports                                    |           |      |
| TASK-037 | Update CHANGELOG                                              |           |      |

## 3. Alternatives

- **ALT-001**: Keep monolithic component, only fix colors
  - **Rejected**: Doesn't address architectural issues, low reusability
  - **Better for**: Quick hotfix, but not sustainable long-term

- **ALT-002**: Use headless UI library (Radix UI directly, no Shadcn/ui)
  - **Rejected**: Project already uses Shadcn/ui, would introduce inconsistency
  - **Better for**: Greenfield projects

- **ALT-003**: Create utility functions instead of components
  - **Rejected**: Doesn't improve reusability or testability of UI
  - **Better for**: Pure logic, not UI composition

- **ALT-004**: Use CSS-in-JS library (styled-components, emotion)
  - **Rejected**: Project uses Tailwind CSS, would add dependency
  - **Better for**: Projects already using CSS-in-JS

- **ALT-005**: Extract only molecules, keep organisms as-is
  - **Considered**: Partial improvement, but organisms would still be dense
  - **Better for**: Incremental refactoring if time-constrained

## 4. Dependencies

- **DEP-001**: Existing Shadcn/ui atoms (Badge, Button, Slider, Input, etc.)
- **DEP-002**: Tailwind CSS theme configuration (`globals.css`)
- **DEP-003**: `cn()` utility from `@/lib/utils`
- **DEP-004**: React Hook Form (`useFormContext`, `Controller`)
- **DEP-005**: `lucide-react` icons (AlertCircle, Check, Ruler, Package)
- **DEP-006**: `use-debounced-dimension` custom hook (from previous refactor)
- **DEP-007**: No new external dependencies required

## 5. Files

### Files to Create

- **FILE-001**: `/src/components/dimension-input.tsx` - Molecule: Input with validation state
- **FILE-002**: `/src/components/dimension-slider.tsx` - Molecule: Slider with value display
- **FILE-003**: `/src/components/validation-indicator.tsx` - Molecule: Check/Alert icon with theme colors
- **FILE-004**: `/src/components/suggested-value-badges.tsx` - Molecule: Badge grid
- **FILE-005**: `/src/components/quantity-presets.tsx` - Molecule: Preset button grid
- **FILE-006**: `/src/app/(public)/catalog/[modelId]/_components/form/dimension-field.tsx` - Organism: Complete dimension field
- **FILE-007**: `/src/app/(public)/catalog/[modelId]/_components/form/dimension-validation-alert.tsx` - Organism: Validation alert
- **FILE-008**: `/src/app/(public)/catalog/[modelId]/_components/form/quantity-field.tsx` - Organism: Quantity field

### Files to Modify

- **FILE-009**: `/src/app/(public)/catalog/[modelId]/_components/form/sections/dimensions-section.tsx` - Refactor to use new components
- **FILE-010**: `/src/styles/globals.css` - Add success color if needed
- **FILE-011**: `/docs/dimensions-ux-improvements.md` - Update with Atomic Design section

## 6. Testing

### Unit Tests

- **TEST-001**: `validation-indicator.test.tsx` - Test icon rendering based on validation state
- **TEST-002**: `dimension-input.test.tsx` - Test input value changes and validation styling
- **TEST-003**: `dimension-slider.test.tsx` - Test slider value updates
- **TEST-004**: `suggested-value-badges.test.tsx` - Test badge clicks
- **TEST-005**: `quantity-presets.test.tsx` - Test preset button clicks
- **TEST-006**: `dimension-field.test.tsx` - Test complete field composition
- **TEST-007**: `dimensions-section.test.tsx` - Test full section integration

### Integration Tests

- **TEST-008**: Test form submission with new component structure
- **TEST-009**: Test validation flow across all dimension fields
- **TEST-010**: Test theme color switching (light/dark mode)

### Visual Regression Tests

- **TEST-011**: Compare screenshots before/after refactor (should be identical)
- **TEST-012**: Verify dark mode appearance
- **TEST-013**: Verify responsive layout (mobile, tablet, desktop)

### Accessibility Tests

- **TEST-014**: Test keyboard navigation through all fields
- **TEST-015**: Test screen reader announcements
- **TEST-016**: Verify ARIA labels and roles

## 7. Risks & Assumptions

### Risks

- **RISK-001**: Breaking form integration with React Hook Form
  - **Mitigation**: Incremental refactoring, test after each phase
  - **Severity**: High
  - **Likelihood**: Low (following Controller pattern)

- **RISK-002**: Visual regressions from component decomposition
  - **Mitigation**: Visual regression tests, careful CSS preservation
  - **Severity**: Medium
  - **Likelihood**: Medium

- **RISK-003**: Performance degradation from more component layers
  - **Mitigation**: Use React.memo for expensive molecules, profile with DevTools
  - **Severity**: Low
  - **Likelihood**: Low (modern React handles composition well)

- **RISK-004**: Missing theme colors (success variant may not exist)
  - **Mitigation**: Add to globals.css if needed, verify with design team
  - **Severity**: Low
  - **Likelihood**: Medium

- **RISK-005**: Over-abstraction making code harder to understand
  - **Mitigation**: Clear naming, comprehensive JSDoc, don't abstract prematurely
  - **Severity**: Medium
  - **Likelihood**: Medium

### Assumptions

- **ASSUMPTION-001**: Tailwind theme has all needed semantic colors (or can be extended)
- **ASSUMPTION-002**: React Hook Form Controller pattern works with decomposed components
- **ASSUMPTION-003**: Component composition won't impact performance significantly
- **ASSUMPTION-004**: Success color variant is acceptable to add to theme
- **ASSUMPTION-005**: Existing `use-debounced-dimension` hook works with refactored components

## 8. Related Specifications / Further Reading

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/) - Brad Frost
- [Shadcn/ui Documentation](https://ui.shadcn.com/) - Component patterns
- [React Hook Form - Controller](https://react-hook-form.com/docs/usecontroller/controller) - Form integration
- [Tailwind CSS Theming](https://tailwindcss.com/docs/theme) - Theme customization
- `/docs/dimensions-ux-improvements.md` - Original component documentation
- `/docs/dimensions-refactor-summary.md` - Previous refactor (debounce optimization)
- `/.github/copilot-instructions.md` - Project architecture guidelines

## Appendix A: Component Hierarchy Design

### Atomic Structure

```
DimensionsSection (Organism - Template)
├── DimensionField (Organism) [width]
│   ├── FormField (Shadcn/ui)
│   ├── FormLabel (Shadcn/ui - Atom)
│   ├── ValidationIndicator (Molecule)
│   │   └── Check | AlertCircle (Atom - lucide-react)
│   ├── DimensionInput (Molecule)
│   │   ├── InputGroup (Shadcn/ui - Atom)
│   │   ├── InputGroupInput (Shadcn/ui - Atom)
│   │   ├── InputGroupAddon (Shadcn/ui - Atom)
│   │   └── Ruler (Atom - lucide-react)
│   ├── DimensionSlider (Molecule)
│   │   └── Slider (Shadcn/ui - Atom)
│   ├── SuggestedValueBadges (Molecule)
│   │   └── Badge[] (Shadcn/ui - Atom)
│   └── FormDescription (Shadcn/ui - Atom)
│
├── DimensionField (Organism) [height]
│   └── [same structure as width]
│
├── DimensionValidationAlert (Organism)
│   ├── Alert (Shadcn/ui - Atom)
│   ├── AlertCircle (Atom - lucide-react)
│   └── AlertDescription (Shadcn/ui - Atom)
│
└── QuantityField (Organism)
    ├── FormField (Shadcn/ui)
    ├── FormLabel (Shadcn/ui - Atom)
    ├── InputGroup (Shadcn/ui - Atom)
    ├── Package (Atom - lucide-react)
    ├── QuantityPresets (Molecule)
    │   └── Button[] (Shadcn/ui - Atom)
    └── FormDescription (Shadcn/ui - Atom)
```

### Responsibility Separation

| Component                  | Type     | Responsibility                                        | Location                     |
| -------------------------- | -------- | ----------------------------------------------------- | ---------------------------- |
| `DimensionsSection`        | Organism | Orchestrate all dimension fields, manage form state   | `_components/form/sections/` |
| `DimensionField`           | Organism | Manage single dimension (width or height) with all UI | `_components/form/`          |
| `QuantityField`            | Organism | Manage quantity input with presets                    | `_components/form/`          |
| `DimensionValidationAlert` | Organism | Show validation errors                                | `_components/form/`          |
| `ValidationIndicator`      | Molecule | Show check/alert icon based on state                  | `src/components/`            |
| `DimensionInput`           | Molecule | Input with icon, unit, validation styling             | `src/components/`            |
| `DimensionSlider`          | Molecule | Slider with immediate feedback                        | `src/components/`            |
| `SuggestedValueBadges`     | Molecule | Grid of clickable suggestion badges                   | `src/components/`            |
| `QuantityPresets`          | Molecule | Grid of preset quantity buttons                       | `src/components/`            |

## Appendix B: Theme Color Mapping

### Current (Hardcoded) → New (Theme Variables)

| Current Class           | Issue           | New Class/Variable   | CSS Variable               |
| ----------------------- | --------------- | -------------------- | -------------------------- |
| `text-green-600`        | Hardcoded color | `text-success`       | `--color-success` (to add) |
| `text-red-600`          | Hardcoded color | `text-destructive`   | `--color-destructive`      |
| `border-red-500`        | Hardcoded color | `border-destructive` | `--color-destructive`      |
| `text-muted-foreground` | ✅ Correct       | Keep as-is           | `--color-muted-foreground` |

### New Theme Variables to Add (if missing)

```css
/* globals.css */
:root {
  --success: oklch(0.55 0.15 145); /* Green for success states */
  --success-foreground: oklch(0.98 0 0); /* White text on success */
}

.dark {
  --success: oklch(0.65 0.18 150); /* Lighter green for dark mode */
  --success-foreground: oklch(0.98 0 0);
}

@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

### Tailwind Config Extension (if needed)

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        success: 'hsl(var(--success))',
        'success-foreground': 'hsl(var(--success-foreground))',
      },
    },
  },
};
```

## Appendix C: Code Examples

### Example 1: ValidationIndicator Molecule

```tsx
// src/components/validation-indicator.tsx
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ValidationIndicatorProps = {
  isValid: boolean;
  showIndicator: boolean;
  className?: string;
};

export function ValidationIndicator({
  isValid,
  showIndicator,
  className,
}: ValidationIndicatorProps) {
  if (!showIndicator) return null;

  return isValid ? (
    <Check className={cn('h-4 w-4 text-success', className)} aria-label="Válido" />
  ) : (
    <AlertCircle className={cn('h-4 w-4 text-destructive', className)} aria-label="Inválido" />
  );
}
```

### Example 2: DimensionInput Molecule

```tsx
// src/components/dimension-input.tsx
import { Ruler } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

type DimensionInputProps = {
  value: number | '';
  onChange: (value: number | '') => void;
  min: number;
  max: number;
  placeholder: string;
  isValid: boolean;
  unit?: string;
  className?: string;
};

export function DimensionInput({
  value,
  onChange,
  min,
  max,
  placeholder,
  isValid,
  unit = 'mm',
  className,
}: DimensionInputProps) {
  const hasValue = value !== '';
  
  return (
    <InputGroup className={className}>
      <InputGroupInput
        type="number"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        placeholder={placeholder}
        className={cn({
          'border-destructive': !isValid && hasValue,
        })}
      />
      <InputGroupAddon>
        <Ruler
          className={cn('h-4 w-4', {
            'text-success': hasValue && isValid,
            'text-muted-foreground': !hasValue,
            'text-destructive': hasValue && !isValid,
          })}
        />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>{unit}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
```

### Example 3: DimensionField Organism

```tsx
// src/app/(public)/catalog/[modelId]/_components/form/dimension-field.tsx
import { useMemo } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DimensionInput } from '@/components/dimension-input';
import { DimensionSlider } from '@/components/dimension-slider';
import { SuggestedValueBadges } from '@/components/suggested-value-badges';
import { ValidationIndicator } from '@/components/validation-indicator';
import type { Control } from 'react-hook-form';

type DimensionFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  min: number;
  max: number;
  localValue: number;
  onSliderChange: (value: number) => void;
  isValid: (value: number) => boolean;
};

export function DimensionField({
  control,
  name,
  label,
  min,
  max,
  localValue,
  onSliderChange,
  isValid,
}: DimensionFieldProps) {
  const suggestedValues = useMemo(() => generateSuggestedValues(min, max), [min, max]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldIsValid = isValid(field.value);

        return (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{label}</FormLabel>
              <ValidationIndicator isValid={fieldIsValid} showIndicator={!!field.value} />
            </div>

            <FormControl>
              <DimensionInput
                value={field.value}
                onChange={field.onChange}
                min={min}
                max={max}
                placeholder={String(min)}
                isValid={fieldIsValid}
              />
            </FormControl>

            <DimensionSlider
              value={localValue}
              onChange={onSliderChange}
              min={min}
              max={max}
              step={10}
            />

            <SuggestedValueBadges
              values={suggestedValues}
              onSelect={field.onChange}
            />

            <FormDescription>
              Rango: {min}-{max}mm
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
```

## Appendix D: Success Criteria

### Before Refactoring
- ❌ 1 monolithic component (325 lines)
- ❌ 3 hardcoded color classes
- ❌ Low reusability
- ❌ Difficult to test in isolation
- ❌ Mixed responsibilities

### After Refactoring
- ✅ 8+ focused components (avg 50-80 lines each)
- ✅ 0 hardcoded colors (all theme variables)
- ✅ High reusability (molecules can be used elsewhere)
- ✅ Easy to test (unit tests for each component)
- ✅ Clear separation of concerns (Atomic Design)
- ✅ Dark mode support verified
- ✅ Same UX/UI (no visual changes)
- ✅ Maintained performance (no mutation increase)

---

**Status**: Ready for Implementation 🚀
