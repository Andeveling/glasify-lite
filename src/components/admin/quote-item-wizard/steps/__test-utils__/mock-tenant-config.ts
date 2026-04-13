import { vi } from 'vitest'
import type { FormatContext } from '@/lib/format'

const defaultFormatContext: FormatContext = {
  currency: 'COP',
  locale: 'es-CO',
  timezone: 'America/Bogota',
}

function createMockUseTenantConfig(context?: Partial<FormatContext>) {
  const formatContext = { ...defaultFormatContext, ...context }
  return {
    useTenantConfig: vi.fn(() => ({
      formatContext,
      hasError: false,
      isLoading: false,
      tenantConfig: {
        currency: formatContext.currency,
        locale: formatContext.locale,
        timezone: formatContext.timezone,
      },
    })),
  }
}

export { createMockUseTenantConfig, defaultFormatContext }
export type { FormatContext }
