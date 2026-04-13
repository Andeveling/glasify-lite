import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { useForm, FormProvider, type DefaultValues } from 'react-hook-form'
import { vi } from 'vitest'

import type { WizardFormValues } from '../../wizard-form-schema'
import {
  mockValidFormValues,
  mockModels,
  mockGlassTypes,
  mockColorsData,
  mockServices,
} from './mock-data'

function createMockApi() {
  return {
    catalog: {
      'filter-models-by-dimensions': {
        useQuery: vi.fn().mockReturnValue({ data: mockModels, error: null, isLoading: false, refetch: vi.fn() }),
      },
      'get-available-glass-types': {
        useQuery: vi.fn().mockReturnValue({ data: mockGlassTypes, error: null, isLoading: false, refetch: vi.fn() }),
      },
      'list-services': {
        useQuery: vi.fn().mockReturnValue({ data: mockServices, error: null, isLoading: false, refetch: vi.fn() }),
      },
    },
    quote: {
      'add-item': {
        useMutation: vi.fn().mockReturnValue({
          error: null,
          isPending: false,
          mutateAsync: vi.fn().mockResolvedValue({ id: 'quote-item-1' }),
        }),
      },
      'get-model-colors-for-quote': {
        useQuery: vi.fn().mockReturnValue({ data: mockColorsData, error: null, isLoading: false, refetch: vi.fn() }),
      },
    },
    tenantConfig: {
      get: {
        useQuery: vi.fn().mockReturnValue({
          data: { currency: 'COP', locale: 'es-CO', timezone: 'America/Bogota' },
          error: null,
          isLoading: false,
        }),
      },
    },
  }
}

const mockApi = createMockApi()

vi.mock('@/trpc/react', async () => {
  const { vi } = await import('vitest')
  return {
    api: (globalThis as Record<string, unknown>).__mockApi,
    createTRPCReact: vi.fn(),
  }
})

vi.mock('@/app/_hooks/use-tenant-config', async () => {
  return {
    useTenantConfig: vi.fn().mockReturnValue({
      formatContext: { currency: 'COP', locale: 'es-CO', timezone: 'America/Bogota' },
      hasError: false,
      isLoading: false,
      tenantConfig: { currency: 'COP', locale: 'es-CO', timezone: 'America/Bogota' },
    }),
  }
})

;(globalThis as Record<string, unknown>).__mockApi = mockApi

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

interface TestWrapperProps {
  children: React.ReactNode
  defaultValues?: DefaultValues<WizardFormValues>
  queryClient?: QueryClient
}

function TestWrapper({ children, defaultValues = mockValidFormValues, queryClient }: TestWrapperProps) {
  const form = useForm<WizardFormValues>({
    defaultValues,
  })
  const qc = queryClient ?? createTestQueryClient()

  return (
    <QueryClientProvider client={qc}>
      <FormProvider {...form}>
        {children}
      </FormProvider>
    </QueryClientProvider>
  )
}

function renderWithFormContext(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    defaultValues?: DefaultValues<WizardFormValues>
    queryClient?: QueryClient
  },
) {
  const queryClient = options?.queryClient ?? createTestQueryClient()
  const result = render(ui, {
    ...options,
    wrapper: ({ children }) => (
      <TestWrapper defaultValues={options?.defaultValues} queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
  })

  return {
    ...result,
    queryClient,
    rerender: (newUi: React.ReactElement, rerenderOptions?: typeof options) =>
      result.rerender(
        <TestWrapper defaultValues={rerenderOptions?.defaultValues} queryClient={queryClient}>
          {newUi}
        </TestWrapper>,
      ),
  }
}

export { renderWithFormContext, TestWrapper, createTestQueryClient, mockApi, createMockApi }
