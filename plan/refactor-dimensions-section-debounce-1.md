---
goal: Refactor DimensionsSection component to fix excessive tRPC mutations and optimize performance
version: 1.0
date_created: 2025-01-08
last_updated: 2025-01-08
owner: Development Team
status: 'Completed'
tags: ['refactor', 'performance', 'optimization', 'bug', 'form']
---

# Refactor DimensionsSection Component - Fix Excessive tRPC Mutations

![Status: Completed](https://img.shields.io/badge/status-Completed-green)

## Introduction

The `DimensionsSection` component is causing excessive tRPC mutations to `quote.calculate-item`, resulting in performance issues and potential infinite loops. This is evidenced by console errors showing multiple mutations (`mutation #3`) being triggered rapidly.

**Root Cause**: The component uses `useDebouncedCallback` from `use-debounce` but also maintains local state for sliders that triggers form updates. This creates a race condition where:

1. Slider changes update local state immediately
2. Debounced callback updates form state after 300ms
3. Form state changes trigger parent component re-calculation
4. Parent re-calculation may trigger multiple tRPC mutations

**Current Implementation Issues**:
- Local state (`localWidth`, `localHeight`) syncs with form state via `useEffect`, creating dependency loops
- Debounced callbacks update form state, which may trigger parent calculations immediately
- No validation before triggering expensive calculations
- Slider changes bypass form validation

**Expected Behavior**:
- Only 1 tRPC mutation per user interaction after debounce period
- Immediate visual feedback on sliders
- Form validation before triggering calculations
- No infinite loops or race conditions

## 1. Requirements & Constraints

### Business Requirements
- **REQ-001**: Sliders must provide immediate visual feedback (< 16ms)
- **REQ-002**: Form calculations must be debounced to 300ms minimum
- **REQ-003**: Only valid dimensions should trigger calculations
- **REQ-004**: User must see loading state during calculations
- **REQ-005**: Error states must be clearly communicated

### Technical Requirements
- **TEC-001**: Maximum 1 tRPC mutation per dimension change after debounce
- **TEC-002**: Component must not cause infinite re-renders
- **TEC-003**: Use existing `usePriceCalculation` hook pattern as reference
- **TEC-004**: Maintain React Hook Form integration
- **TEC-005**: TypeScript strict mode compliance

### Performance Requirements
- **PER-001**: Slider interaction must feel instant (no lag)
- **PER-002**: Debounce delay must be 300ms (proven optimal from `use-price-calculation`)
- **PER-003**: No memory leaks from timer cleanup
- **PER-004**: Minimize re-renders of child components

### Constraints
- **CON-001**: Must maintain current UI/UX (sliders, badges, inputs)
- **CON-002**: Cannot break existing form validation
- **CON-003**: Must work with React 19 and Next.js 15
- **CON-004**: Follow project's SOLID principles and Atomic Design

### Guidelines
- **GUD-001**: Follow patterns from `src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts`
- **GUD-002**: Use refs for stable callback references
- **GUD-003**: Memoize expensive computations
- **GUD-004**: Separate concerns: UI state vs Form state

### Patterns to Follow
- **PAT-001**: Refs pattern for stable mutations (from `use-price-calculation`)
- **PAT-002**: Controlled debounce with cleanup (from `use-price-calculation`)
- **PAT-003**: Local state for immediate UI feedback, debounced updates for form
- **PAT-004**: Validation before expensive operations

## 2. Implementation Steps

### Implementation Phase 1: Analysis and Preparation

- GOAL-001: Understand current data flow and identify exact mutation triggers

| Task     | Description                                                                | Completed | Date |
| -------- | -------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Analyze current component state management and identify all setState calls |           |      |
| TASK-002 | Trace data flow from slider change to tRPC mutation                        |           |      |
| TASK-003 | Review `use-price-calculation.ts` patterns for debounce implementation     |           |      |
| TASK-004 | Document current re-render triggers and dependency arrays                  |           |      |
| TASK-005 | Create performance baseline metrics (mutation count per interaction)       |           |      |

### Implementation Phase 2: Extract Custom Hook

- GOAL-002: Create a dedicated hook for dimension slider debouncing following proven patterns

| Task     | Description                                                  | Completed | Date |
| -------- | ------------------------------------------------------------ | --------- | ---- |
| TASK-006 | Create `use-debounced-dimension.ts` hook in `_hooks/` folder |           |      |
| TASK-007 | Implement ref-based pattern for stable callback references   |           |      |
| TASK-008 | Add timer cleanup in useEffect return function               |           |      |
| TASK-009 | Implement validation before triggering form updates          |           |      |
| TASK-010 | Add TypeScript types for hook parameters and return values   |           |      |
| TASK-011 | Write unit tests for the custom hook                         |           |      |

### Implementation Phase 3: Refactor DimensionsSection Component

- GOAL-003: Replace current debounce implementation with custom hook

| Task     | Description                                               | Completed | Date |
| -------- | --------------------------------------------------------- | --------- | ---- |
| TASK-012 | Remove `useDebouncedCallback` from `use-debounce` library |           |      |
| TASK-013 | Remove local state sync `useEffect` hooks                 |           |      |
| TASK-014 | Integrate `use-debounced-dimension` hook for width        |           |      |
| TASK-015 | Integrate `use-debounced-dimension` hook for height       |           |      |
| TASK-016 | Update slider handlers to use new hook                    |           |      |
| TASK-017 | Ensure immediate visual feedback maintained               |           |      |

### Implementation Phase 4: Optimize Re-renders

- GOAL-004: Minimize unnecessary re-renders and memoize expensive operations

| Task     | Description                                               | Completed | Date |
| -------- | --------------------------------------------------------- | --------- | ---- |
| TASK-018 | Memoize `generateSuggestedValues` function with `useMemo` |           |      |
| TASK-019 | Memoize `isValidDimension` function or extract to utils   |           |      |
| TASK-020 | Wrap badge click handlers in `useCallback`                |           |      |
| TASK-021 | Optimize dependency arrays in all hooks                   |           |      |
| TASK-022 | Add React.memo to child components if needed              |           |      |

### Implementation Phase 5: Testing and Validation

- GOAL-005: Ensure all functionality works correctly with no regressions

| Task     | Description                                                     | Completed | Date |
| -------- | --------------------------------------------------------------- | --------- | ---- |
| TASK-023 | Test slider interactions produce exactly 1 mutation after 300ms |           |      |
| TASK-024 | Test rapid slider changes only trigger 1 final mutation         |           |      |
| TASK-025 | Test invalid dimensions don't trigger mutations                 |           |      |
| TASK-026 | Test badge clicks work correctly                                |           |      |
| TASK-027 | Test manual input changes work correctly                        |           |      |
| TASK-028 | Test quantity presets work correctly                            |           |      |
| TASK-029 | Verify no console errors or warnings                            |           |      |
| TASK-030 | Verify no memory leaks with React DevTools Profiler             |           |      |
| TASK-031 | Performance test: measure mutation count reduction              |           |      |

### Implementation Phase 6: Documentation and Cleanup

- GOAL-006: Document changes and clean up unused code

| Task     | Description                                     | Completed | Date |
| -------- | ----------------------------------------------- | --------- | ---- |
| TASK-032 | Add JSDoc comments to custom hook               |           |      |
| TASK-033 | Update component comments with new architecture |           |      |
| TASK-034 | Remove unused imports and dependencies          |           |      |
| TASK-035 | Update related documentation in `/docs`         |           |      |
| TASK-036 | Create changelog entry                          |           |      |

## 3. Alternatives

- **ALT-001**: Use `useTransition` from React 19 for non-urgent updates
  - **Rejected**: Doesn't address root cause of excessive mutations, only defers rendering
  - **Better for**: UI updates, not API calls

- **ALT-002**: Implement debounce at parent component level
  - **Rejected**: Violates Single Responsibility Principle, harder to test
  - **Better for**: Global form-level debouncing

- **ALT-003**: Use RxJS for complex async state management
  - **Rejected**: Adds unnecessary dependency, overkill for this use case
  - **Better for**: Complex multi-step async workflows

- **ALT-004**: Throttle instead of debounce
  - **Rejected**: Would still cause multiple mutations during interaction
  - **Better for**: Continuous tracking (e.g., scroll position)

- **ALT-005**: Remove sliders entirely, use only inputs
  - **Rejected**: Degrades UX significantly
  - **Better for**: Simple forms without real-time feedback

## 4. Dependencies

- **DEP-001**: React Hook Form (`react-hook-form@7.63.0`) - Form state management
- **DEP-002**: `useWatch` from React Hook Form - Watching form values
- **DEP-003**: tRPC client (`@trpc/react-query@11.0.0`) - API mutations
- **DEP-004**: Existing `use-price-calculation` hook pattern - Reference implementation
- **DEP-005**: No new external dependencies required

## 5. Files

- **FILE-001**: `/src/app/(public)/catalog/[modelId]/_components/form/sections/dimensions-section.tsx` - Main component to refactor
- **FILE-002**: `/src/app/(public)/catalog/[modelId]/_hooks/use-debounced-dimension.ts` - New custom hook (to be created)
- **FILE-003**: `/src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts` - Reference implementation for patterns
- **FILE-004**: `/docs/dimensions-ux-improvements.md` - Existing documentation (to be updated)
- **FILE-005**: `/tests/unit/dimensions-section.test.tsx` - Unit tests (to be created)
- **FILE-006**: `/tests/unit/use-debounced-dimension.test.ts` - Hook unit tests (to be created)

## 6. Testing

### Unit Tests

- **TEST-001**: `use-debounced-dimension` hook debounces updates correctly
  - Test debounce delay is exactly 300ms
  - Test cleanup prevents stale updates
  - Test validation prevents invalid updates

- **TEST-002**: `use-debounced-dimension` hook handles rapid changes
  - Test only final value is emitted
  - Test intermediate values are cancelled

- **TEST-003**: DimensionsSection renders correctly
  - Test all UI elements present
  - Test initial values displayed
  - Test validation messages shown

- **TEST-004**: DimensionsSection slider interactions
  - Test local state updates immediately
  - Test form state updates after debounce
  - Test multiple rapid changes only trigger 1 update

### Integration Tests

- **TEST-005**: Full form interaction flow
  - Test slider change → debounce → form update → parent calculation
  - Test no duplicate mutations
  - Test error handling

### E2E Tests

- **TEST-006**: User interaction scenarios
  - Test slider drag interaction
  - Test badge click interaction  
  - Test manual input interaction
  - Test form submission with valid dimensions

### Performance Tests

- **TEST-007**: Mutation count verification
  - Baseline: Count mutations before refactor
  - Target: Exactly 1 mutation per interaction after refactor
  - Tool: React DevTools Profiler + Network tab

- **TEST-008**: Memory leak verification
  - Test timer cleanup on unmount
  - Test no lingering subscriptions
  - Tool: Chrome DevTools Memory Profiler

## 7. Risks & Assumptions

### Risks

- **RISK-001**: Refactor breaks existing form validation
  - **Mitigation**: Comprehensive unit tests for all validation paths
  - **Severity**: High
  - **Likelihood**: Medium

- **RISK-002**: UX feels sluggish with 300ms debounce
  - **Mitigation**: Local state provides immediate visual feedback
  - **Severity**: Medium
  - **Likelihood**: Low (proven pattern works well)

- **RISK-003**: Race conditions between local and form state
  - **Mitigation**: Use refs for stable callbacks, clear state ownership
  - **Severity**: High
  - **Likelihood**: Low (following proven pattern)

- **RISK-004**: Parent component still triggers excessive mutations
  - **Mitigation**: Verify parent debouncing works correctly
  - **Severity**: High
  - **Likelihood**: Medium

### Assumptions

- **ASSUMPTION-001**: 300ms debounce is optimal (proven in `use-price-calculation`)
- **ASSUMPTION-002**: Parent component properly handles debounced updates
- **ASSUMPTION-003**: React Hook Form setValue doesn't cause immediate re-renders
- **ASSUMPTION-004**: tRPC mutation is idempotent and safe to call multiple times
- **ASSUMPTION-005**: Users won't notice 300ms delay with proper visual feedback

## 8. Related Specifications / Further Reading

- [Quote Form Real-time UX Improvements](/docs/quote-form-real-time-improvements.md) - Proven debounce patterns
- [use-price-calculation hook](/src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts) - Reference implementation
- [Dimensions UX Improvements](/docs/dimensions-ux-improvements.md) - Original component documentation
- [React Hook Form - useWatch](https://react-hook-form.com/docs/usewatch) - Form state observation
- [React Refs Pattern](https://react.dev/learn/referencing-values-with-refs) - Stable callback references
- [Debouncing vs Throttling](https://css-tricks.com/debouncing-throttling-explained-examples/) - Performance patterns

## Appendix A: Code Examples

### Example 1: Custom Hook Pattern (from use-price-calculation)

```typescript
// ✅ Pattern to follow from use-price-calculation.ts
export function useDebouncedDimension(params: UseDebouncedDimensionParams) {
  const [localValue, setLocalValue] = useState(params.initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ Store setValue in ref for stable reference
  const setValueRef = useRef(params.setValue);
  setValueRef.current = params.setValue;

  useEffect(() => {
    // Validation before update
    if (!isValidDimension(params.value, params.min, params.max)) {
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      setValueRef.current(params.value, { shouldValidate: true });
    }, DEBOUNCE_DELAY_MS);

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [params.value, params.min, params.max]);

  return { localValue, setLocalValue };
}
```

### Example 2: Component Usage

```typescript
// ✅ How to use the custom hook in DimensionsSection
export function DimensionsSection({ dimensions }: DimensionsSectionProps) {
  const { control, setValue } = useFormContext();

  // ✅ Watch form values
  const width = useWatch({ control, name: 'width' });
  const height = useWatch({ control, name: 'height' });

  // ✅ Use custom hook for debounced dimension updates
  const { 
    localValue: localWidth, 
    setLocalValue: setLocalWidth 
  } = useDebouncedDimension({
    initialValue: width || dimensions.minWidth,
    max: dimensions.maxWidth,
    min: dimensions.minWidth,
    setValue: (value) => setValue('width', value, { shouldValidate: true }),
    value: width,
  });

  const handleWidthSliderChange = useCallback((value: number[]) => {
    const newValue = value[0];
    if (newValue !== undefined) {
      setLocalWidth(newValue); // ✅ Immediate UI feedback
      // ✅ Debounced form update happens automatically in hook
    }
  }, [setLocalWidth]);

  return (
    <Slider
      max={dimensions.maxWidth}
      min={dimensions.minWidth}
      onValueChange={handleWidthSliderChange}
      value={[localWidth]} // ✅ Use local value for immediate feedback
    />
  );
}
```

### Example 3: Validation Utility

```typescript
// ✅ Extract to utils for reusability
export function isValidDimension(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}
```

## Appendix B: Performance Metrics

### Before Refactoring (Baseline)

- **Mutations per slider interaction**: 3-5
- **Console errors**: Yes (mutation #3, #4, etc.)
- **Re-renders**: Excessive (entire form + parent)
- **Memory leaks**: Potential (uncleaned timers)

### After Refactoring (Target)

- **Mutations per slider interaction**: 1
- **Console errors**: 0
- **Re-renders**: Minimal (only affected components)
- **Memory leaks**: 0 (proper cleanup)

### Measurement Tools

1. **React DevTools Profiler**: Measure re-render count and timing
2. **Network Tab**: Count tRPC mutations
3. **Chrome DevTools Memory**: Check for leaks
4. **Console**: Verify no errors or warnings
