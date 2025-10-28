/**
 * FormActions Component
 *
 * Form action buttons (Cancel, Submit)
 *
 * @module _components/form-actions
 */

"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  mode: "create" | "edit";
  isLoading: boolean;
  onCancel: () => void;
}

/**
 * Form action buttons component
 */
export function FormActions({ mode, isLoading, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Button onClick={onCancel} type="button" variant="outline">
        Cancelar
      </Button>
      <Button disabled={isLoading} type="submit">
        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {mode === "create" ? "Crear Tipo de Vidrio" : "Guardar Cambios"}
      </Button>
    </div>
  );
}
