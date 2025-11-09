/**
 * Quote Types - Database Entities and DTOs
 *
 * These types define the quote data structures for quote generation and viewing.
 * Aligned with Prisma schema extensions from data-model.md.
 *
 * @module types/quote.types
 */

import type { QuoteStatus } from "@/server/db/schema";
import type { CartItem } from "./cart.types";

// ============================================================================
// Quote Input Types
// ============================================================================
/**
 * Project address input for quote generation
 *
 * Fields required for structured address storage
 */
export type QuoteProjectAddress = {
  /** Project name or identifier */
  projectName: string;

  /** Street address */
  projectStreet: string;

  /** City */
  projectCity: string;

  /** State/region */
  projectState: string;
};

/**
 * Delivery address with geocoding data (from client)
 */
export type DeliveryAddressInput = {
  city?: string | null;
  country?: string | null;
  district?: string | null;
  label?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
  reference?: string | null;
  region?: string | null;
  street?: string | null;
};

/**
 * Input for generating quote from cart
 *
 * Used in generateQuoteFromCartAction Server Action
 */
export type GenerateQuoteInput = {
  /** Cart items to convert to quote items */
  cartItems: CartItem[];

  /** Project address information */
  projectAddress: QuoteProjectAddress;

  /** Optional contact phone */
  contactPhone?: string;

  /** Optional delivery address with geocoding data */
  deliveryAddress?: DeliveryAddressInput;

  /**
   * @deprecated Manufacturer ID (deprecated field, kept for backward compatibility)
   * This field is no longer used for quote generation. Currency and validity
   * are now obtained from TenantConfig singleton.
   */
  manufacturerId?: string;
};

// ============================================================================
// Quote Output Types (DTOs)
// ============================================================================

/**
 * Quote item detail for display
 *
 * Enriched version of QuoteItem for UI rendering
 */
export type QuoteItemDetail = {
  /** Quote item ID */
  id: string;

  /** User-editable name from cart */
  name: string;

  /** Model name */
  modelName: string;

  /** Glass type name */
  glassTypeName: string;

  /** Glass solution name (if applicable) */
  solutionName?: string;

  /** Width in millimeters */
  widthMm: number;

  /** Height in millimeters */
  heightMm: number;

  /** Number of units */
  quantity: number;

  /** Price per unit at quote generation time */
  unitPrice: number;

  /** Total price (unitPrice * quantity) */
  subtotal: number;

  /** Additional service names */
  serviceNames: string[];
};

/**
 * Full quote detail for display
 *
 * Complete quote information with computed fields
 */
export type QuoteDetail = {
  /** Quote ID */
  id: string;

  /** Quote status */
  status: QuoteStatus;

  /** Manufacturer name */
  manufacturerName: string;

  /** User email */
  userEmail?: string;

  /** Quote creation date */
  createdAt: Date;

  /** Quote validity end date (15 days from creation) */
  validUntil: Date | null;

  /** Whether quote has expired */
  isExpired: boolean;

  /** Project address */
  projectAddress: QuoteProjectAddress;

  /** Contact phone */
  contactPhone?: string;

  /** Currency code */
  currency: string;

  /** Total price */
  total: number;

  /** All quote items */
  items: QuoteItemDetail[];

  /** Number of items */
  itemCount: number;

  /** Total units (sum of quantities) */
  totalUnits: number;
};

/**
 * Quote list item for quote history
 *
 * Lightweight version for list rendering
 */
export type QuoteListItem = {
  /** Quote ID */
  id: string;

  /** Quote status */
  status: QuoteStatus;

  /** Quote creation date */
  createdAt: Date;

  /** Quote validity end date */
  validUntil: Date | null;

  /** Whether quote has expired */
  isExpired: boolean;

  /** Project name */
  projectName: string;

  /** Total price */
  total: number;

  /** Currency code */
  currency: string;

  /** Number of items */
  itemCount: number;
};

// ============================================================================
// Quote Query Options
// ============================================================================

/**
 * Options for listing user quotes
 */
export type ListUserQuotesOptions = {
  /** User ID (from session) */
  userId: string;

  /** Filter by status */
  status?: QuoteStatus;

  /** Filter expired quotes */
  includeExpired?: boolean;

  /** Page number (1-indexed) */
  page?: number;

  /** Items per page */
  limit?: number;

  /** Sort order */
  sortBy?: "createdAt" | "validUntil" | "total";

  /** Sort direction */
  sortOrder?: "asc" | "desc";
};

/**
 * Paginated quote list response
 */
export type QuoteListResponse = {
  /** Quotes for current page */
  quotes: QuoteListItem[];

  /** Total number of quotes matching filters */
  total: number;

  /** Current page number */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there's a next page */
  hasNextPage: boolean;

  /** Whether there's a previous page */
  hasPreviousPage: boolean;
};

// ============================================================================
// Quote Validation
// ============================================================================

/**
 * Quote validation error codes
 */
export const QuoteErrorCode = {
  EmptyCart: "EMPTY_CART",
  InvalidAddress: "INVALID_ADDRESS",
  NotFound: "NOT_FOUND",
  PriceCalculationFailed: "PRICE_CALCULATION_FAILED",
  TransactionFailed: "TRANSACTION_FAILED",
  Unauthorized: "UNAUTHORIZED",
  Unknown: "UNKNOWN",
} as const;

export type QuoteErrorCode =
  (typeof QuoteErrorCode)[keyof typeof QuoteErrorCode];

/**
 * Quote operation result (discriminated union)
 */
export type QuoteOperationResult<T = void> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: QuoteErrorCode;
        message: string;
      };
    };

// ============================================================================
// Quote Constants
// ============================================================================

/**
 * Quote business rules and defaults
 */
export const QUOTE_CONSTANTS = {
  /** Default page size for quote list */
  DEFAULT_PAGE_SIZE: 20,

  /** Default sort order */
  DEFAULT_SORT: "createdAt" as const,

  /** Default sort direction */
  DEFAULT_SORT_ORDER: "desc" as const,

  /** Maximum page size for quote list */
  MAX_PAGE_SIZE: 100,
  /** Quote validity period in days */
  VALIDITY_DAYS: 15,
} as const;

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Quote status display metadata
 */
export type QuoteStatusMeta = {
  label: string;
  color: "default" | "secondary" | "success" | "warning" | "destructive";
  description: string;
};

/**
 * Quote status metadata map
 */
export const QUOTE_STATUS_META: Record<QuoteStatus, QuoteStatusMeta> = {
  canceled: {
    color: "destructive",
    description: "Cotización cancelada",
    label: "Cancelada",
  },
  draft: {
    color: "default",
    description: "Cotización en preparación",
    label: "Borrador",
  },
  sent: {
    color: "secondary",
    description: "Cotización enviada al cliente",
    label: "Enviada",
  },
};
