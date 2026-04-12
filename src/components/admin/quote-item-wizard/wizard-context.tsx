'use client'

import { createContext, type ReactNode, useContext } from 'react'

interface QuoteItemWithServices {
  id: string
  modelId: string
  glassTypeId: string
  colorId?: string | null
  serviceIds: string[]
  quantity: number
  widthMm: number
  heightMm: number
  configuredWidthMm: number
  configuredHeightMm: number
}

interface WizardContextValue {
  quoteId: string
  clientId: string
  editItem?: QuoteItemWithServices
  onSuccess: () => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

function useWizardContext() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizardContext must be used within WizardProvider')
  }
  return context
}

function WizardProvider({ children, value }: { children: ReactNode; value: WizardContextValue }) {
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export { useWizardContext, WizardProvider }
export type { QuoteItemWithServices, WizardContextValue }
