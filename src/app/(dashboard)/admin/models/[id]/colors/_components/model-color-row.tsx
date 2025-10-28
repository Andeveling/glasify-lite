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
import { ColorChip } from "@/app/(dashboard)/admin/colors/_components/color-chip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";

// Surcharge management constants
const SURCHARGE_DEBOUNCE_MS = 500;
const MIN_SURCHARGE = 0;
const MAX_SURCHARGE = 100;

type ModelColorWithColor = ModelColor & {
  color: Color;
};

/**
 * Props for ModelColorRow
 *
 * ⚠️ NEXT.JS WARNING (FALSE POSITIVE):
 * Next.js 15 shows warnings about callback props not being Server Actions.
 * This is a KNOWN ISSUE - callbacks are perfectly valid in Client-to-Client components.
 *
 * Context:
 * - This component (model-color-row.tsx) is a Client Component ("use client")
 * - Parent component (model-colors-list.tsx) is also a Client Component
 * - Callbacks are NOT crossing Server/Client boundary
 * - No serialization is needed for Client-to-Client prop passing
 *
 * References:
 * - https://github.com/vercel/next.js/issues/54282
 * - These warnings can be safely ignored for Client-to-Client callbacks
 *
 * DO NOT rename to "Action" suffix - these are NOT Server Actions.
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
    Number(modelColor.surchargePercentage)
  );

  // Debounce surcharge changes (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      const originalSurcharge = Number(modelColor.surchargePercentage);
      if (
        surcharge !== originalSurcharge &&
        surcharge >= MIN_SURCHARGE &&
        surcharge <= MAX_SURCHARGE
      ) {
        onSurchargeChange(modelColor.id, surcharge);
      }
    }, SURCHARGE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    surcharge,
    modelColor.id,
    modelColor.surchargePercentage,
    onSurchargeChange,
  ]);

  const handleSurchargeChange = (value: string) => {
    const numValue = Number.parseFloat(value);
    if (!Number.isNaN(numValue)) {
      setSurcharge(Math.max(MIN_SURCHARGE, Math.min(MAX_SURCHARGE, numValue)));
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
