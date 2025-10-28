/**
 * CartItem Component
 *
 * Displays individual cart item row with inline editing for name,
 * quantity adjustment controls, and remove functionality.
 *
 * Features:
 * - Inline name editing (click to edit, blur/Enter to save)
 * - Quantity controls with min/max validation
 * - Remove button with confirmation
 * - Smooth animations for better UX feedback
 * - Responsive layout
 * - Accessibility support (ARIA labels, keyboard navigation)
 *
 * @module app/(public)/cart/_components/cart-item
 */

"use client";

import { Check, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { memo, useState, useTransition } from "react";
import { formatCurrency } from "@/app/_utils/format-currency.util";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/cart.types";
import { CART_CONSTANTS } from "@/types/cart.types";
import { DeleteCartItemDialog } from "./delete-cart-item-dialog";

// ============================================================================
// Types
// ============================================================================

export type CartItemProps = {
  /** Cart item data */
  item: CartItemType;

  /** Callback when name is updated */
  onUpdateName?: (itemId: string, newName: string) => void;

  /** Callback when quantity is updated */
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;

  /** Callback when item is removed */
  onRemove?: (itemId: string) => void;

  /** Currency code (COP for Colombia, USD for Panama) */
  currency?: string;

  /** Whether updates are in progress */
  isUpdating?: boolean;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Cart item row component
 *
 * Performance: Wrapped with React.memo to prevent unnecessary re-renders
 * when other cart items change. Only re-renders when item data, callbacks,
 * or props actually change.
 *
 * @example
 * ```tsx
 * <CartItem
 *   item={cartItem}
 *   onUpdateName={handleUpdateName}
 *   onUpdateQuantity={handleUpdateQuantity}
 *   onRemove={handleRemove}
 *   currency="MXN"
 * />
 * ```
 */
const CartItemComponent = ({
  item,
  onUpdateName,
  onUpdateQuantity,
  onRemove,
  currency = "COP",
  isUpdating = false,
}: CartItemProps) => {
  const [editedName, setEditedName] = useState(item.name);
  const [editMode, setEditMode] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handle name save (blur or Enter key)
   */
  const handleNameSave = () => {
    setEditMode(false);
    setNameError(null);

    const trimmedName = editedName.trim();

    // Validate name
    if (trimmedName.length === 0) {
      setNameError("El nombre no puede estar vacío");
      setEditedName(item.name); // Reset to original
      return;
    }

    if (trimmedName.length > CART_CONSTANTS.MAX_NAME_LENGTH) {
      setNameError(`Máximo ${CART_CONSTANTS.MAX_NAME_LENGTH} caracteres`);
      setEditedName(item.name); // Reset to original
      return;
    }

    // Only call update if changed
    if (trimmedName !== item.name && onUpdateName) {
      onUpdateName(item.id, trimmedName);
    }
  };

  /**
   * Handle name cancel (Escape key)
   */
  const handleNameCancel = () => {
    setEditMode(false);
    setEditedName(item.name); // Reset to original
    setNameError(null);
  };

  /**
   * Handle quantity adjustment
   */
  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;

    // Validate bounds
    if (
      newQuantity < CART_CONSTANTS.MIN_QUANTITY ||
      newQuantity > CART_CONSTANTS.MAX_QUANTITY
    ) {
      return;
    }

    if (onUpdateQuantity) {
      // Use transition for smooth animation
      startTransition(() => {
        onUpdateQuantity(item.id, newQuantity);
      });
    }
  };

  /**
   * Handle item removal - show confirmation dialog
   */
  const handleRemove = () => {
    setShowDeleteDialog(true);
  };

  /**
   * Handle confirmed deletion
   */
  const handleConfirmDelete = () => {
    if (onRemove) {
      onRemove(item.id);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  const isInAction = isUpdating || isPending;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 rounded-lg border p-4",
        "transition-all duration-150 ease-in-out",
        // Updating animation: subtle opacity
        isInAction && "opacity-70",
        // Default state
        !isInAction && "scale-100 opacity-100",
        "md:grid-cols-[2fr_3fr_1fr_1fr_auto]"
      )}
      data-testid={`cart-item-${item.id}`}
    >
      {/* Column 1: Name (editable) */}
      <div className="flex flex-col gap-1">
        {editMode ? (
          <>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Editar nombre del artículo"
                autoFocus
                className="font-medium text-base"
                disabled={isUpdating}
                maxLength={CART_CONSTANTS.MAX_NAME_LENGTH}
                onBlur={handleNameSave}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleNameSave();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleNameCancel();
                  }
                }}
                type="text"
                value={editedName}
              />
              <Button
                aria-label="Guardar nombre"
                className="size-8 shrink-0"
                disabled={isUpdating}
                onClick={handleNameSave}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Check className="size-4" />
              </Button>
              <Button
                aria-label="Cancelar edición"
                className="size-8 shrink-0"
                disabled={isUpdating}
                onClick={handleNameCancel}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
            {nameError && (
              <p className="text-destructive text-sm">{nameError}</p>
            )}
          </>
        ) : (
          <button
            aria-label="Nombre del artículo"
            className="group flex items-center gap-2 text-left font-medium text-base transition-colors hover:text-primary disabled:opacity-50"
            disabled={isUpdating}
            onClick={() => setEditMode(true)}
            type="button"
          >
            {item.name}
            <Pencil className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
        <p className="text-muted-foreground text-sm">
          {item.modelName} - {item.glassTypeName}
        </p>
      </div>

      {/* Column 2: Configuration details */}
      <div className="flex flex-col gap-1 text-sm">
        <p>
          <span className="font-medium">Dimensiones:</span> {item.widthMm} ×{" "}
          {item.heightMm} mm
        </p>
        {item.solutionName && (
          <p>
            <span className="font-medium">Solución:</span> {item.solutionName}
          </p>
        )}
        {item.additionalServiceIds.length > 0 && (
          <p>
            <span className="font-medium">Servicios:</span>{" "}
            {item.additionalServiceIds.length}
          </p>
        )}
      </div>

      {/* Column 3: Quantity controls */}
      <div className="flex flex-col items-start justify-center gap-2 md:items-center">
        <fieldset
          aria-label="Controles de cantidad"
          className="flex items-center gap-1"
        >
          <Button
            aria-label="Disminuir cantidad"
            className="size-8"
            disabled={
              item.quantity <= CART_CONSTANTS.MIN_QUANTITY || isUpdating
            }
            onClick={() => handleQuantityChange(-1)}
            size="icon"
            type="button"
            variant="outline"
          >
            <Minus className="size-4" />
          </Button>
          <span
            className="flex min-w-12 items-center justify-center font-medium text-base"
            data-testid="quantity-display"
          >
            {item.quantity}
          </span>
          <Button
            aria-label="Aumentar cantidad"
            className="size-8"
            disabled={
              item.quantity >= CART_CONSTANTS.MAX_QUANTITY || isUpdating
            }
            onClick={() => handleQuantityChange(1)}
            size="icon"
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
          </Button>
        </fieldset>
        <span className="text-muted-foreground text-xs">
          Precio unitario:{" "}
          {formatCurrency(item.unitPrice, {
            currency,
            decimals: currency === "USD" ? 2 : 0,
            locale: currency === "USD" ? "es-PA" : "es-CO",
          })}
        </span>
      </div>

      {/* Column 4: Subtotal */}
      <div className="flex items-center justify-start md:justify-center">
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Subtotal</p>
          <p className="font-semibold text-lg" data-testid="subtotal">
            {formatCurrency(item.subtotal, {
              currency,
              decimals: currency === "USD" ? 2 : 0,
              locale: currency === "USD" ? "es-PA" : "es-CO",
            })}
          </p>
        </div>
      </div>

      {/* Column 5: Remove button */}
      <div className="flex items-center justify-end md:justify-center">
        <Button
          aria-label={`Eliminar ${item.name}`}
          className="size-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
          data-testid="remove-button"
          disabled={isUpdating}
          onClick={handleRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="size-5" />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteCartItemDialog
        itemName={item.name}
        onConfirm={handleConfirmDelete}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      />
    </div>
  );
};

/**
 * Memoized CartItem component for performance optimization
 *
 * Custom comparison function ensures component only re-renders when:
 * - item.id changes
 * - item.name changes
 * - item.quantity changes
 * - item.unitPrice changes
 * - item.subtotal changes
 * - isUpdating changes
 * - currency changes
 *
 * Callback props (onUpdateName, onUpdateQuantity, onRemove) are assumed
 * to be stable (wrapped with useCallback in parent).
 */
export const CartItem = memo(CartItemComponent, (prevProps, nextProps) => {
  // Re-render if item data changed
  if (
    prevProps.item.id !== nextProps.item.id ||
    prevProps.item.name !== nextProps.item.name ||
    prevProps.item.quantity !== nextProps.item.quantity ||
    prevProps.item.unitPrice !== nextProps.item.unitPrice ||
    prevProps.item.subtotal !== nextProps.item.subtotal
  ) {
    return false; // Props changed, re-render
  }

  // Re-render if state props changed
  if (
    prevProps.isUpdating !== nextProps.isUpdating ||
    prevProps.currency !== nextProps.currency
  ) {
    return false; // Props changed, re-render
  }

  // Props are equal, skip re-render
  return true;
});
