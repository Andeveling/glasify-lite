import { act, renderHook, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuoteFilters } from '../../../src/app/(public)/my-quotes/_hooks/use-quote-filters';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('useQuoteFilters', () => {
  let mockPush: ReturnType<typeof vi.fn>;
  let mockReplace: ReturnType<typeof vi.fn>;
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    mockPush = vi.fn();
    mockReplace = vi.fn();
    mockSearchParams = new URLSearchParams();

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams);
  });

  describe('Initialization', () => {
    it('should initialize with default filter values when no URL params', () => {
      const { result } = renderHook(() => useQuoteFilters());

      expect(result.current.filters.status).toBeUndefined();
      expect(result.current.filters.searchQuery).toBe('');
      expect(result.current.filters.sortBy).toBe('newest');
    });

    it('should initialize from URL search params', () => {
      mockSearchParams.set('status', 'sent');
      mockSearchParams.set('q', 'Casa Juan');
      mockSearchParams.set('sort', 'oldest');

      const { result } = renderHook(() => useQuoteFilters());

      expect(result.current.filters.status).toBe('sent');
      expect(result.current.filters.searchQuery).toBe('Casa Juan');
      expect(result.current.filters.sortBy).toBe('oldest');
    });

    it('should handle invalid status from URL params', () => {
      mockSearchParams.set('status', 'invalid-status');

      const { result } = renderHook(() => useQuoteFilters());

      // Should default to undefined for invalid status
      expect(result.current.filters.status).toBeUndefined();
    });
  });

  describe('Filter Updates', () => {
    it('should update status filter', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('draft');
      });

      expect(result.current.filters.status).toBe('draft');
    });

    it('should update search query', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setSearchQuery('New search term');
      });

      expect(result.current.filters.searchQuery).toBe('New search term');
    });

    it('should update sort by', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setSortBy('price-high');
      });

      expect(result.current.filters.sortBy).toBe('price-high');
    });
  });

  describe('URL Synchronization', () => {
    it('should update URL when status filter changes', async () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('sent');
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('status=sent'), expect.any(Object));
      });
    });

    it('should update URL when search query changes (debounced)', async () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setSearchQuery('Casa Juan');
      });

      // Should debounce - not called immediately
      expect(mockReplace).not.toHaveBeenCalled();

      // Wait for debounce (300ms default)
      await waitFor(
        () => {
          expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('q=Casa+Juan'), expect.any(Object));
        },
        { timeout: 500 }
      );
    });

    it('should update URL when sort changes', async () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setSortBy('price-low');
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('sort=price-low'), expect.any(Object));
      });
    });

    it('should remove param from URL when filter is cleared', async () => {
      mockSearchParams.set('status', 'draft');
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus(undefined);
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
        const callArg = mockReplace.mock.calls[0]?.[0] as string;
        expect(callArg).not.toContain('status=');
      });
    });

    it('should preserve page param when updating filters', async () => {
      mockSearchParams.set('page', '3');
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('sent');
      });

      await waitFor(() => {
        const callArg = mockReplace.mock.calls[0]?.[0] as string;
        expect(callArg).toContain('page=3');
        expect(callArg).toContain('status=sent');
      });
    });
  });

  describe('Debouncing', () => {
    it('should debounce search query updates', async () => {
      const { result } = renderHook(() => useQuoteFilters());

      // Rapid changes
      act(() => {
        result.current.setSearchQuery('C');
      });
      act(() => {
        result.current.setSearchQuery('Ca');
      });
      act(() => {
        result.current.setSearchQuery('Casa');
      });

      // Should only call once after debounce
      await waitFor(
        () => {
          expect(mockReplace).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });

    it('should not debounce status filter (immediate update)', async () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('sent');
      });

      // Should be called immediately (within a few ms)
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters', () => {
      mockSearchParams.set('status', 'sent');
      mockSearchParams.set('q', 'Casa Juan');
      mockSearchParams.set('sort', 'price-high');

      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.status).toBeUndefined();
      expect(result.current.filters.searchQuery).toBe('');
      expect(result.current.filters.sortBy).toBe('newest');
    });

    it('should update URL when clearing filters', async () => {
      mockSearchParams.set('status', 'sent');
      mockSearchParams.set('q', 'search');

      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.clearFilters();
      });

      await waitFor(() => {
        const callArg = mockReplace.mock.calls[0]?.[0] as string;
        expect(callArg).not.toContain('status=');
        expect(callArg).not.toContain('q=');
      });
    });
  });

  describe('Active Filters Count', () => {
    it('should return 0 when no filters active', () => {
      const { result } = renderHook(() => useQuoteFilters());

      expect(result.current.activeFiltersCount).toBe(0);
    });

    it('should count status filter as active', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('draft');
      });

      expect(result.current.activeFiltersCount).toBe(1);
    });

    it('should count search query as active', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setSearchQuery('Casa');
      });

      expect(result.current.activeFiltersCount).toBe(1);
    });

    it('should count multiple active filters', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('sent');
        result.current.setSearchQuery('Casa');
        result.current.setSortBy('price-high');
      });

      // Status + search + non-default sort = 3
      expect(result.current.activeFiltersCount).toBe(3);
    });

    it('should not count default sort as active filter', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setSortBy('newest'); // default
      });

      expect(result.current.activeFiltersCount).toBe(0);
    });
  });

  describe('Has Active Filters', () => {
    it('should return false when no filters', () => {
      const { result } = renderHook(() => useQuoteFilters());

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should return true when filters are active', () => {
      const { result } = renderHook(() => useQuoteFilters());

      act(() => {
        result.current.setStatus('sent');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
