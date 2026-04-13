"use client"

import { createContext, useContext } from "react"
import type { TenantConfigPublic } from "@/lib/schemas/tenant.config"
import { TenantConfigSchema } from "@/lib/schemas/tenant.config"

const TenantConfigContext = createContext<TenantConfigPublic | null>(null)

type TenantConfigProviderProps = {
  children: React.ReactNode
  config: unknown
}

export function TenantConfigProvider({ children, config }: TenantConfigProviderProps) {
  const parsed = TenantConfigSchema.safeParse(config)
  if (!parsed.success) {
    throw new Error(
      `TenantConfigProvider: invalid config\n${parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    )
  }
  return <TenantConfigContext.Provider value={parsed.data}>{children}</TenantConfigContext.Provider>
}

export function useTenantConfig(): TenantConfigPublic {
  const context = useContext(TenantConfigContext)
  if (!context) {
    throw new Error("useTenantConfig must be used within TenantConfigProvider")
  }
  return context
}

export type { TenantConfigPublic }
export { TenantConfigSchema }
