/**
 * Model Color Row Component
 *
 * Displays a single color assignment for a model with inline editing capabilities
 * - ColorChip visual preview
 * - Inline editable surcharge percentage (debounced 500ms)
 * - Default color checkbox
 * - Remove button with confirmation
 * - Optimistic UI updates
 *
 * Architecture:
 * - Client Component for interactivity
 * - Debounced surcharge updates to reduce API calls
 * - Optimistic updates with rollback on error
 */

"use client";

import type { Color, ModelColor } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { ColorChip } from "@/app/(dashboard)/admin/colors/_components/color-chip";

type ModelColorWithColor = ModelColor & {
  color: Color;
};

/**
 * Props for ModelColorRow
 *
 * Note: Next.js shows warnings about callback props not being Server Actions.
 * These are false positives - callbacks are valid when passed from Client Components.
 * This component is used in model-colors-list.tsx (also a Client Component).
 */
type ModelColorRowProps = {
  modelColor: ModelColorWithColor;
  onSurchargeChange: (id: string, surcharge: number) => void;
  onDefaultChange: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
};

/**
 * Single row displaying color assignment details
 * Handles inline editing with debounced updates
 */
export function ModelColorRow({
  modelColor,
  onSurchargeChange,
  onDefaultChange,
  onDelete,
  isUpdating = false,
}: ModelColorRowProps) {
  const [surcharge, setSurcharge] = useState(
    Number(modelColor.surchargePercentage),
  );

  // Debounce surcharge changes (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      const originalSurcharge = Number(modelColor.surchargePercentage);
      if (
        surcharge !== originalSurcharge &&
        surcharge >= 0 &&
        surcharge <= 100
      ) {
        onSurchargeChange(modelColor.id, surcharge);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [surcharge, modelColor.id, modelColor.surchargePercentage, onSurchargeChange]);

  const handleSurchargeChange = (value: string) => {
    const numValue = Number.parseFloat(value);
    if (!Number.isNaN(numValue)) {
      setSurcharge(Math.max(0, Math.min(100, numValue)));
    }
  };

  return (
    <TableRow className={isUpdating ? "opacity-50" : ""}>
      {/* Color Preview */}
      <TableCell>
        <ColorChip hexCode={modelColor.color.hexCode} size="md" />
      </TableCell>

      {/* Color Name */}
      <TableCell className="font-medium">{modelColor.color.name}</TableCell>

      {/* RAL Code */}
      <TableCell className="text-muted-foreground">
        {modelColor.color.ralCode ?? "—"}
      </TableCell>

      {/* Hex Code */}
      <TableCell className="font-mono text-sm">
        {modelColor.color.hexCode}
      </TableCell>

      {/* Surcharge Input (editable) */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            className="w-20"
            disabled={isUpdating}
            max={100}
            min={0}
            onChange={(e) => handleSurchargeChange(e.target.value)}
            step={0.01}
            type="number"
            value={surcharge}
          />
          <span className="text-muted-foreground text-sm">%</span>
        </div>
      </TableCell>

      {/* Default Checkbox */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={modelColor.isDefault}
            disabled={isUpdating || modelColor.isDefault}
            id={`default-${modelColor.id}`}
            onCheckedChange={() => onDefaultChange(modelColor.id)}
          />
          <Label
            className="cursor-pointer text-sm"
            htmlFor={`default-${modelColor.id}`}
          >
            {modelColor.isDefault ? "Por defecto" : "Establecer"}
          </Label>
        </div>
      </TableCell>

      {/* Remove Button */}
      <TableCell>
        <Button
          disabled={isUpdating}
          onClick={() => onDelete(modelColor.id)}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar color</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
