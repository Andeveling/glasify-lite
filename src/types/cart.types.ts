/**
 * Cart Type Definitions
 *
 * These types define the structure of cart items and cart state
 * used throughout the application for budget cart workflow.
 *
 * Cart is managed client-side with sessionStorage persistence.
 */

/**
 * Individual item in the cart (client-side only, no database table)
 *
 * Lifecycle:
 * - Created when user clicks "Add to Cart"
 * - Persisted in sessionStorage
 * - Deleted after quote generation
 */
export type CartItem = {
  /** Client-generated unique identifier (cuid) */
  id: string;

  /** Reference to Model.id */
  modelId: string;

  /** Denormalized model name for display */
  modelName: string;

  /** Reference to GlassType.id */
  glassTypeId: string;

  /** Denormalized glass type name for display */
  glassTypeName: string;

  /** Optional reference to GlassSolution.id */
  solutionId?: string;

  /** Denormalized solution name for display */
  solutionName?: string;

  /** Configured width in millimeters */
  widthMm: number;

  /** Configured height in millimeters */
  heightMm: number;

  /** Number of units (default: 1) */
  quantity: number;

  /** Array of Service.id references */
  additionalServiceIds: string[];

  /** Optional reference to ModelColor.id */
  colorId?: string;

  /** User-editable name (auto-generated: "VEKA-001") */
  name: string;

  /** Price per unit (calculated via tRPC) */
  unitPrice: number;

  /** unitPrice * quantity */
  subtotal: number;

  /** ISO timestamp of when item was added */
  createdAt: string;

  dimensions: {
    widthMm: number;
    heightMm: number;
  };
};

/**
 * Cart state structure
 */
export type CartState = {
  /** All items in the cart */
  items: CartItem[];

  /** Sum of all item subtotals */
  total: number;

  /** Number of items in cart */
  itemCount: number;

  /** Whether cart is currently being modified */
  isLoading: boolean;

  /** Last update timestamp */
  lastUpdated: string;
};

/**
 * Cart summary for display
 */
export type CartSummary = {
  /** Total number of items */
  itemCount: number;

  /** Total price of all items */
  total: number;

  /** Currency code (from manufacturer) */
  currency: string;

  /** Whether cart is empty */
  isEmpty: boolean;
};

/**
 * Cart item creation input (from form)
 */
export type CreateCartItemInput = {
  modelId: string;
  modelName: string;
  glassTypeId: string;
  glassTypeName: string;
  solutionId?: string;
  solutionName?: string;
  widthMm: number;
  heightMm: number;
  quantity?: number;
  additionalServiceIds?: string[];
  colorId?: string;
};

/**
 * Cart item update input
 */
export type UpdateCartItemInput = {
  /** Item ID to update */
  id: string;

  /** New name (optional) */
  name?: string;

  /** New quantity (optional) */
  quantity?: number;
};

/**
 * Cart validation error
 */
export type CartValidationError = {
  /** Error code */
  code:
    | "DUPLICATE_NAME"
    | "CART_LIMIT_EXCEEDED"
    | "INVALID_QUANTITY"
    | "ITEM_NOT_FOUND";

  /** Human-readable error message */
  message: string;

  /** Field that caused the error */
  field?: string;

  /** Current value that failed validation */
  value?: unknown;
};

/**
 * Constants for cart validation
 */
export const CART_CONSTANTS = {
  /** Maximum items allowed in cart */
  MAX_ITEMS: 20,

  /** Maximum length for item name */
  MAX_NAME_LENGTH: 50,

  /** Maximum quantity per item */
  MAX_QUANTITY: 100,

  /** Minimum quantity per item */
  MIN_QUANTITY: 1,

  /** SessionStorage key for cart data */
  STORAGE_KEY: "glasify_cart",
} as const;

/**
 * Cart storage data structure (persisted in sessionStorage)
 */
export type CartStorageData = {
  items: CartItem[];
  version: number; // For future schema migrations
  lastModified: string; // ISO timestamp
};
