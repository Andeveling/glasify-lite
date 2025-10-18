'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

/**
 * Delete Confirmation Dialog Component
 *
 * Reusable dialog for confirming delete operations with dependency warnings.
 * Shows entity dependencies and blocks deletion if dependencies exist.
 *
 * @example
 * ```tsx
 * <DeleteConfirmationDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   entityName="modelo"
 *   entityLabel="Ventana Corrediza PVC"
 *   dependencies={[
 *     { entity: 'QuoteItem', count: 5, message: '5 ítem(s) de cotización asociados' }
 *   ]}
 *   onConfirm={handleDelete}
 *   loading={isDeleting}
 * />
 * ```
 */

export interface DependencyInfo {
  entity: string;
  count: number;
  message: string;
}

export interface DeleteConfirmationDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;
  /** Entity type name (e.g., "modelo", "tipo de vidrio") */
  entityName: string;
  /** Specific entity label/name (e.g., "Ventana Corrediza PVC") */
  entityLabel: string;
  /** List of dependencies that would prevent deletion */
  dependencies?: DependencyInfo[];
  /** Callback when delete is confirmed */
  onConfirm: () => void | Promise<void>;
  /** Loading state during delete operation */
  loading?: boolean;
  /** Custom warning message (optional) */
  warningMessage?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  entityName,
  entityLabel,
  dependencies = [],
  onConfirm,
  loading = false,
  warningMessage,
}: DeleteConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const hasDependencies = dependencies.length > 0;
  const canDelete = !hasDependencies;

  const handleConfirm = async () => {
    if (!canDelete) return;

    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            {canDelete ? `¿Eliminar ${entityName}?` : `No se puede eliminar ${entityName}`}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>
              {canDelete ? (
                <>
                  Estás a punto de eliminar <strong>{entityLabel}</strong>.
                </>
              ) : (
                <>
                  No puedes eliminar <strong>{entityLabel}</strong> porque tiene dependencias activas.
                </>
              )}
            </p>

            {hasDependencies && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="mb-2 font-semibold text-destructive text-sm">Dependencias encontradas:</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {dependencies.map((dep, index) => (
                    <li key={`${dep.entity}-${index}`}>
                      <strong>{dep.entity}:</strong> {dep.message}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-muted-foreground text-xs">
                  Elimina o actualiza estas dependencias antes de eliminar {entityLabel}.
                </p>
              </div>
            )}

            {canDelete && warningMessage && (
              <p className="rounded-lg bg-amber-50 p-3 text-amber-900 text-sm dark:bg-amber-950 dark:text-amber-100">
                {warningMessage}
              </p>
            )}

            {canDelete && !warningMessage && (
              <p className="text-muted-foreground text-sm">
                Esta acción no se puede deshacer. El registro será eliminado permanentemente.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading || isConfirming}>Cancelar</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading || isConfirming}
              onClick={handleConfirm}
            >
              {loading || isConfirming ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Delete Button Component
 *
 * Trigger button for the delete confirmation dialog.
 * Use with DeleteConfirmationDialog component.
 */
export interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DeleteButton({ onClick, disabled = false, variant = 'destructive', size = 'sm' }: DeleteButtonProps) {
  return (
    <Button disabled={disabled} onClick={onClick} size={size} variant={variant}>
      <Trash2 className="mr-2 size-4" />
      Eliminar
    </Button>
  );
}
