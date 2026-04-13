import { vi } from 'vitest'

import type { RouterOutputs } from '@/trpc/react'

import { mockColorsData, mockGlassTypes, mockModels, mockServices } from './mock-data'

interface MockTrpcOptions {
  catalogFilterModels?: RouterOutputs['catalog']['filter-models-by-dimensions']
  catalogGetGlassTypes?: RouterOutputs['catalog']['get-available-glass-types']
  catalogListServices?: RouterOutputs['catalog']['list-services']
  quoteGetColors?: typeof mockColorsData
  quoteAddItemError?: Error | null
  quoteAddItemPending?: boolean
}

function createMockTrpcReact(options: MockTrpcOptions = {}) {
  const {
    catalogFilterModels = mockModels,
    catalogGetGlassTypes = mockGlassTypes,
    catalogListServices = mockServices,
    quoteAddItemError = null,
    quoteAddItemPending = false,
    quoteGetColors = mockColorsData,
  } = options

  const _mockUseQuery = vi.fn((input: unknown, opts?: { enabled?: boolean }) => {
    const enabled = opts?.enabled ?? true
    if (!enabled) {
      return { data: undefined, error: null, isLoading: false, refetch: vi.fn() }
    }

    const procedurePath = input as Record<string, unknown>
    if (procedurePath && typeof procedurePath === 'object') {
    }

    return { data: undefined, error: null, isLoading: false, refetch: vi.fn() }
  })

  const _mockUseMutation = vi.fn((_opts?: { onSuccess?: () => void }) => ({
    error: quoteAddItemError,
    isPending: quoteAddItemPending,
    mutateAsync: quoteAddItemError
      ? vi.fn().mockRejectedValue(quoteAddItemError)
      : vi.fn().mockResolvedValue({ id: 'quote-item-1' }),
  }))

  const mockApi = {
    catalog: {
      'filter-models-by-dimensions': {
        useQuery: (_input: unknown, opts?: { enabled?: boolean }) => {
          const enabled = opts?.enabled ?? true
          if (!enabled) {
            return { data: undefined, error: null, isLoading: false, refetch: vi.fn() }
          }
          return {
            data: catalogFilterModels,
            error: null,
            isLoading: false,
            refetch: vi.fn(),
          }
        },
      },
      'get-available-glass-types': {
        useQuery: (_input: unknown, opts?: { enabled?: boolean }) => {
          const enabled = opts?.enabled ?? true
          if (!enabled) {
            return { data: undefined, error: null, isLoading: false, refetch: vi.fn() }
          }
          return {
            data: catalogGetGlassTypes,
            error: null,
            isLoading: false,
            refetch: vi.fn(),
          }
        },
      },
      'list-services': {
        useQuery: () => ({
          data: catalogListServices,
          error: null,
          isLoading: false,
          refetch: vi.fn(),
        }),
      },
    },
    quote: {
      'add-item': {
        useMutation: (_opts?: { onSuccess?: () => void }) => ({
          error: quoteAddItemError,
          isPending: quoteAddItemPending,
          mutateAsync: quoteAddItemError
            ? vi.fn().mockRejectedValue(quoteAddItemError)
            : vi.fn().mockResolvedValue({ id: 'quote-item-1' }),
        }),
      },
      'get-model-colors-for-quote': {
        useQuery: () => ({
          data: quoteGetColors,
          error: null,
          isLoading: false,
          refetch: vi.fn(),
        }),
      },
    },
    tenantConfig: {
      get: {
        useQuery: () => ({
          data: {
            currency: 'COP',
            locale: 'es-CO',
            timezone: 'America/Bogota',
          },
          error: null,
          isLoading: false,
        }),
      },
    },
  }

  return {
    api: mockApi,
    createTRPCReact: vi.fn(() => mockApi),
  }
}

export { createMockTrpcReact }
export type { MockTrpcOptions }
