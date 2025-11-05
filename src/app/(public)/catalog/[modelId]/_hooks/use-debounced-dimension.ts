import { useEffect, useRef, useState } from "react";

const DEBOUNCE_DELAY_MS = 300; // ✅ Optimized for real-time responsiveness (proven in use-price-calculation)

type UseDebouncedDimensionParams = {
  /**
   * Initial value for the dimension (used on first render)
   */
  initialValue: number;
  /**
   * Minimum allowed value for validation
   */
  min: number;
  /**
   * Maximum allowed value for validation
   */
  max: number;
  /**
   * Callback to update the form state
   * Should be a stable reference (e.g., from setValue)
   */
  setValue: (value: number) => void;
  /**
   * Current value from form state (watched via useWatch)
   */
  value: number;
};

type UseDebouncedDimensionReturn = {
  /**
   * Local value for immediate UI feedback (controlled by slider)
   */
  localValue: number;
  /**
   * Setter for local value (used by slider onChange)
   */
  setLocalValue: (value: number) => void;
};

/**
 * Validates if a dimension value is within allowed range
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns true if value is within range, false otherwise
 */
function isValidDimension(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Custom hook for debounced dimension updates following proven patterns from use-price-calculation
 *
 * ✅ Real-time UX Improvements:
 * - Immediate visual feedback via local state
 * - Debounced form updates (300ms) to prevent excessive mutations
 * - Built-in validation before triggering updates
 * - Ref-based stable callback references to prevent infinite loops
 * - Proper timer cleanup to prevent memory leaks
 *
 * @example
 * ```tsx
 * const { localValue, setLocalValue } = useDebouncedDimension({
 *   initialValue: width || dimensions.minWidth,
 *   min: dimensions.minWidth,
 *   max: dimensions.maxWidth,
 *   setValue: (value) => setValue('width', value, { shouldValidate: true }),
 *   value: width,
 * });
 *
 * const handleSliderChange = useCallback((values: number[]) => {
 *   const newValue = values[0];
 *   if (newValue !== undefined) {
 *     setLocalValue(newValue); // ✅ Immediate UI feedback
 *   }
 * }, [setLocalValue]);
 * ```
 */
export function useDebouncedDimension(
  params: UseDebouncedDimensionParams
): UseDebouncedDimensionReturn {
  // ✅ Local state for immediate UI feedback (no debounce)
  const [localValue, setLocalValue] = useState<number>(params.initialValue);

  // ✅ Ref to store timer ID for cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Store setValue in ref for stable reference (prevents dependency issues)
  const setValueRef = useRef(params.setValue);
  setValueRef.current = params.setValue;

  // ✅ Ref to track the last form value we processed
  const lastFormValueRef = useRef(params.value);

  // ✅ Debounced form update effect
  useEffect(() => {
    // Skip if local value hasn't changed or is invalid
    if (
      localValue === params.value ||
      !isValidDimension(localValue, params.min, params.max)
    ) {
      return;
    }

    // Clear previous timer if exists
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer to update form state
    debounceTimerRef.current = setTimeout(() => {
      setValueRef.current(localValue);
      lastFormValueRef.current = localValue;
    }, DEBOUNCE_DELAY_MS);

    // ✅ Cleanup function to prevent memory leaks
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, params.value, params.min, params.max]);

  // ✅ Sync local state when form value changes externally (e.g., badge click, manual input)
  useEffect(() => {
    // Only update if the form value changed AND it's different from what we last set
    if (
      params.value !== lastFormValueRef.current &&
      params.value !== localValue
    ) {
      setLocalValue(params.value);
      lastFormValueRef.current = params.value;
    }
  }, [params.value, localValue]);

  return {
    localValue,
    setLocalValue,
  };
}
