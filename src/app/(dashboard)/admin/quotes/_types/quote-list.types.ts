import type { QuoteStatus } from "@prisma/client";

/**
 * Lightweight DTO for quote list view
 * Used in admin quotes dashboard list
 */
export type QuoteListItem = {
  id: string;
  status: QuoteStatus;
  projectName: string;
  total: number;
  currency: string;
  validUntil: Date | null;
  createdAt: Date;
  sentAt: Date | null;
  itemCount: number;
  /**
   * User who created the quote
   * Null if user was deleted (onDelete: SetNull)
   * email can be null per schema (User.email is nullable)
   */
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: "admin" | "seller" | "user";
  } | null;
};

/**
 * URL search params for filtering/sorting quotes
 */
export type QuoteListFilters = {
  status?: QuoteStatus;
  search?: string;
  sortBy?: "createdAt" | "total" | "validUntil";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

/**
 * User contact information for quote detail view (US7)
 * Note: contactPhone comes from Quote.contactPhone, not User.phone
 */
export type UserContactInfo = {
  id: string;
  name: string | null;
  email: string | null;
  role: "admin" | "seller" | "user";
};
