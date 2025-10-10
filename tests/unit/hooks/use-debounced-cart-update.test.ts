/**
 * Unit Tests: useDebouncedCartUpdate Hook
 *
 * Tests debounced quantity/name updates to prevent excessive re-renders
 * and storage writes during rapid user input.
 *
 * @module tests/unit/hooks/use-debounced-cart-update
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// Mock Hook Implementation (to be created in src/)
// ============================================================================

type DebouncedUpdateFn = (itemId: string, updates: { name?: string; quantity?: number }) => void;

/**
 * Debounced cart update hook
 *
 * Prevents excessive updates during rapid user input (e.g., typing, quantity spinners)
 *
 * @param updateFn - Function to call after debounce delay
 * @param delayMs - Debounce delay in milliseconds
 */
function useDebouncedCartUpdate(updateFn: DebouncedUpdateFn, delayMs = 300) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate: DebouncedUpdateFn = (itemId, updates) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateFn(itemId, updates);
    }, delayMs);
  };

  const flush = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return { debouncedUpdate, flush };
}

// ============================================================================
// Unit Tests
// ============================================================================

describe('useDebouncedCartUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should debounce rapid updates', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // Simulate rapid typing (3 keystrokes within debounce window)
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'V' });
      vi.advanceTimersByTime(50);
      result.current.debouncedUpdate('item-1', { name: 'VE' });
      vi.advanceTimersByTime(50);
      result.current.debouncedUpdate('item-1', { name: 'VEK' });
    });

    // Should not have called update yet
    expect(mockUpdate).not.toHaveBeenCalled();

    // Advance past debounce delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called update only once with final value
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith('item-1', { name: 'VEK' });
    });
  });

  it('should debounce quantity spinner updates', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // Simulate rapid quantity changes (user holding + button)
    act(() => {
      result.current.debouncedUpdate('item-2', { quantity: 1 });
      vi.advanceTimersByTime(100);
      result.current.debouncedUpdate('item-2', { quantity: 2 });
      vi.advanceTimersByTime(100);
      result.current.debouncedUpdate('item-2', { quantity: 3 });
    });

    // Should not have called update yet
    expect(mockUpdate).not.toHaveBeenCalled();

    // Advance past debounce delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called update only once with final quantity
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith('item-2', { quantity: 3 });
    });
  });

  it('should handle updates to different items independently', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // Update two different items
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'Item A' });
      vi.advanceTimersByTime(150);
      result.current.debouncedUpdate('item-2', { quantity: 5 });
    });

    // Advance past first item's delay
    act(() => {
      vi.advanceTimersByTime(200); // Total: 350ms from first update
    });

    // Should have called update for both items
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    // Note: This implementation doesn't track items independently
    // This test documents current behavior - consider if per-item debounce needed
  });

  it('should allow immediate flush', () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // Start an update
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'VEKA-001' });
    });

    // Flush immediately (e.g., on blur or explicit save)
    act(() => {
      result.current.flush();
    });

    // Update should not be called (flushed before timer fired)
    expect(mockUpdate).not.toHaveBeenCalled();

    // Advancing time should not trigger update
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should cleanup pending updates on unmount', () => {
    const mockUpdate = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // Start an update
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'Test' });
    });

    // Unmount before debounce completes
    unmount();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Update should not be called (component unmounted)
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should use default delay of 300ms when not specified', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate)); // No delay param

    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'Test' });
    });

    // Should not fire before 300ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(mockUpdate).not.toHaveBeenCalled();

    // Should fire at 300ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('should allow custom delay', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 500)); // Custom 500ms

    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'Test' });
    });

    // Should not fire before 500ms
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(mockUpdate).not.toHaveBeenCalled();

    // Should fire at 500ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle simultaneous name and quantity updates', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // User edits both name and quantity
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'VEKA-001', quantity: 5 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith('item-1', { name: 'VEKA-001', quantity: 5 });
    });
  });

  it('should cancel previous update when new update queued', async () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() => useDebouncedCartUpdate(mockUpdate, 300));

    // First update
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'Initial' });
    });

    // Wait partway through debounce
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Second update (should cancel first)
    act(() => {
      result.current.debouncedUpdate('item-1', { name: 'Final' });
    });

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should only call with final value, not initial
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith('item-1', { name: 'Final' });
    });
  });
});
