/**
 * DeleteCartItemDialog Component
 *
 * Confirmation dialog for cart item deletion.
 * Follows "Don't Make Me Think" principles with clear messaging.
 *
 * Features:
 * - Clear title and description
 * - Destructive action styling
 * - Keyboard accessible (Escape to cancel, Enter to confirm)
 * - Mobile-friendly
 *
 * @module app/(public)/cart/_components/delete-cart-item-dialog
 */

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================================
// Types
// ============================================================================

export type DeleteCartItemDialogProps = {
  /** Whether dialog is open */
  open: boolean;

  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;

  /** Name of item being deleted */
  itemName: string;

  /** Callback when deletion is confirmed */
  onConfirm: () => void;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Confirmation dialog for deleting cart items
 *
 * @example
 * ```tsx
 * function CartItem({ item }) {
 *   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setShowDeleteDialog(true)}>Eliminar</Button>
 *       <DeleteCartItemDialog
 *         open={showDeleteDialog}
 *         onOpenChange={setShowDeleteDialog}
 *         itemName={item.name}
 *         onConfirm={() => handleDelete(item.id)}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function DeleteCartItemDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
}: DeleteCartItemDialogProps) {
  /**
   * Handle confirmation click
   */
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar{" "}
            <span className="font-semibold">"{itemName}"</span> del carrito.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
