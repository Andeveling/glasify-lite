/**
 * useDebouncedCallback Hook
 *
 * Generic React hook that debounces any callback function to improve performance
 * by preventing excessive function calls during rapid user input.
 *
 * Use Cases:
 * - Search inputs (wait for user to stop typing)
 * - Filter controls (delay API calls)
 * - Auto-save features (reduce save frequency)
 * - Resize/scroll handlers (throttle expensive operations)
 *
 * Features:
 * - Generic type support
 * - Configurable delay (default: 300ms per REQ-002, PERF-003)
 * - Automatic cleanup on unmount
 * - Preserves callback reference with useCallback
 *
 * Usage:
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => {
 *     fetchResults(query);
 *   },
 *   300
 * );
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 *
 * @see PERF-003: Debounce search inputs by 300ms
 */

"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Generic callback type that can accept any arguments and return any value
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic hook needs to accept any function signature
type AnyFunction = (...args: any[]) => any;

/**
 * Default debounce delay in milliseconds
 * Based on REQ-002 and PERF-003 requirements
 */
const DEFAULT_DELAY = 300;

/**
 * Custom hook to debounce a callback function
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced version of the callback
 */
export function useDebouncedCallback<T extends AnyFunction>(
  callback: T,
  delay: number = DEFAULT_DELAY
): T {
  // Store timeout ID for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store callback in ref to avoid re-creating debounced function on every render
  const callbackRef = useRef<T>(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  // Create debounced function
  const debouncedCallback = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Must match generic function signature
    (...args: any[]) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Alternative hook that returns both debounced value and callback
 * Useful when you need to track the debounced state
 *
 * Usage:
 * ```tsx
 * const [value, setValue] = useDebouncedState('', 300);
 *
 * <input value={value} onChange={(e) => setValue(e.target.value)} />
 * ```
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = DEFAULT_DELAY
): [T, (newValue: T) => void] {
  const valueRef = useRef<T>(initialValue);
  const debouncedSetValue = useDebouncedCallback((newValue: T) => {
    valueRef.current = newValue;
  }, delay);

  return [valueRef.current, debouncedSetValue];
}
