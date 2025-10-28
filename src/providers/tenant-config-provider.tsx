/**
 * TenantConfig Provider
 *
 * Provides tenant configuration (currency, locale, timezone, etc.) to Client Components.
 * Fetched once in Server Component and provided via React Context.
 *
 * @module providers/tenant-config-provider
 */

"use client";

import { createContext, useContext } from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * Tenant configuration subset needed by Client Components
 * Full TenantConfig is server-only, this is the public subset
 */
export type TenantConfigPublic = {
  /** ISO 4217 currency code (COP, USD, EUR, etc.) */
  currency: string;
  /** IETF BCP 47 locale (es-CO, en-US, etc.) */
  locale: string;
  /** IANA timezone (America/Bogota, etc.) */
  timezone: string;
  /** Quote validity in days */
  quoteValidityDays: number;
};

// ============================================================================
// Context
// ============================================================================

const TenantConfigContext = createContext<TenantConfigPublic | null>(null);

// ============================================================================
// Provider
// ============================================================================

type TenantConfigProviderProps = {
  children: React.ReactNode;
  config: TenantConfigPublic;
};

/**
 * TenantConfig Provider Component
 *
 * Provides tenant configuration to all Client Components.
 * Config is fetched in Server Component (root layout) and passed as prop.
 *
 * @example
 * ```tsx
 * // In Server Component (layout.tsx)
 * import { getTenantConfig } from '@/server/utils/tenant';
 * import { TenantConfigProvider } from '@/providers/tenant-config-provider';
 *
 * export default async function RootLayout({ children }) {
 *   const config = await getTenantConfig();
 *
 *   return (
 *     <TenantConfigProvider config={config}>
 *       {children}
 *     </TenantConfigProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In Client Component
 * 'use client';
 * import { useTenantConfig } from '@/providers/tenant-config-provider';
 *
 * export function PriceDisplay({ amount }: { amount: number }) {
 *   const { currency, locale } = useTenantConfig();
 *
 *   const formatted = new Intl.NumberFormat(locale, {
 *     style: 'currency',
 *     currency,
 *   }).format(amount);
 *
 *   return <span>{formatted}</span>;
 * }
 * ```
 */
export function TenantConfigProvider({
  children,
  config,
}: TenantConfigProviderProps) {
  return (
    <TenantConfigContext.Provider value={config}>
      {children}
    </TenantConfigContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useTenantConfig Hook
 *
 * Access tenant configuration in Client Components.
 *
 * @throws {Error} If used outside TenantConfigProvider
 * @returns Tenant configuration (currency, locale, timezone, quoteValidityDays)
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * export function CartSummary() {
 *   const { currency } = useTenantConfig();
 *
 *   return (
 *     <div>
 *       Total: {formatCurrency(1000, currency)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenantConfig(): TenantConfigPublic {
  const context = useContext(TenantConfigContext);

  if (!context) {
    throw new Error("useTenantConfig must be used within TenantConfigProvider");
  }

  return context;
}
