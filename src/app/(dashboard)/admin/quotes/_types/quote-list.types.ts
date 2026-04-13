import type { QuoteStatus } from "@prisma/generated/client"

/**
 * Lightweight DTO for quote list view
 * Used in admin quotes dashboard list
 */
export type QuoteListItem = {
  id: string
  status: QuoteStatus
  projectName: string
  total: number
  currency: string
  validUntil: Date | null
  createdAt: Date
  sentAt: Date | null
  itemCount: number
  /**
   * Client associated with the quote
   * Null if client was deleted or quote has no clientId
   */
  client: {
    id: string
    name: string
    email: string | null
    phone: string | null
    company: string | null
  } | null
}

/**
 * URL search params for filtering/sorting quotes
 */
export type QuoteListFilters = {
  status?: QuoteStatus
  search?: string
  sortBy?: "createdAt" | "total" | "validUntil"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
  clientId?: string
}

/**
 * Client contact information for quote detail view
 * Replaces UserContactInfo - shows client data instead of user
 */
export type ClientContactInfo = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
}
