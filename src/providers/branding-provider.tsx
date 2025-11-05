/**
 * Branding Provider
 *
 * Injects tenant branding (colors, logo) as CSS variables
 * Enables dynamic theming without CSS rebuilds
 *
 * US-009: Configurar datos de branding del tenant
 * TEC-007: Middleware para inyectar branding en layout root
 * TEC-008: CSS variables dinámicas para colores corporativos
 */

"use client";

import { createContext, useContext, useEffect } from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * Branding configuration for Client Components
 */
export type BrandingConfig = {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  businessName: string;
};

// ============================================================================
// Context
// ============================================================================

const BrandingContext = createContext<BrandingConfig | null>(null);

// ============================================================================
// Provider
// ============================================================================

type BrandingProviderProps = {
  children: React.ReactNode;
  config: BrandingConfig;
};

/**
 * Branding Provider Component
 *
 * Injects CSS variables in :root for dynamic theming
 * Provides branding config to Client Components
 *
 * @example
 * ```tsx
 * // In Server Component (layout.tsx)
 * import { api } from '@/trpc/server';
 * import { BrandingProvider } from '@/providers/branding-provider';
 *
 * export default async function RootLayout({ children }) {
 *   const branding = await api.tenantConfig.getBranding();
 *
 *   return (
 *     <BrandingProvider config={branding}>
 *       {children}
 *     </BrandingProvider>
 *   );
 * }
 * ```
 */
export function BrandingProvider({ children, config }: BrandingProviderProps) {
  useEffect(() => {
    // Inject CSS variables in :root
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", config.primaryColor);
    root.style.setProperty("--brand-secondary", config.secondaryColor);
  }, [config.primaryColor, config.secondaryColor]);

  return (
    <BrandingContext.Provider value={config}>
      {children}
    </BrandingContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useBranding Hook
 *
 * Access tenant branding in Client Components
 *
 * @throws {Error} If used outside BrandingProvider
 * @returns Branding configuration (logo, colors, businessName)
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * export function Header() {
 *   const { logoUrl, businessName } = useBranding();
 *
 *   return (
 *     <header>
 *       {logoUrl ? (
 *         <img src={logoUrl} alt={businessName} />
 *       ) : (
 *         <h1>{businessName}</h1>
 *       )}
 *     </header>
 *   );
 * }
 * ```
 */
export function useBranding(): BrandingConfig {
  const context = useContext(BrandingContext);

  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }

  return context;
}
