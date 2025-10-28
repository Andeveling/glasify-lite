import { Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ModelDimensions } from "../_types/model.types";

type ModelDimensionsProps = {
  dimensions: ModelDimensions;
};

// ✅ Move to module scope - created once, not on every render
const EXCEPTIONAL_CAPACITY_THRESHOLD = 5000; // Large sliding doors (>5m)

/**
 * Determines if a dimension capacity is exceptional
 * @param max - Maximum dimension in millimeters
 * @returns true if dimension exceeds exceptional capacity threshold
 */
function isExceptionalCapacity(max: number): boolean {
  return max > EXCEPTIONAL_CAPACITY_THRESHOLD;
}

/**
 * Displays dimensional constraints with contextual labels
 * User Story 4: Access Dimensional Guidelines (Priority P2)
 * - Shows clear min/max values in millimeters
 * - Highlights unusual capacities (e.g., 6700mm sliding doors)
 * - Easy to reference while configuring quote form
 *
 * Performance: Helper function and threshold moved to module scope to prevent re-creation on re-renders
 */
export function ModelDimensionsCard({ dimensions }: ModelDimensionsProps) {
  const { minWidth, maxWidth, minHeight, maxHeight } = dimensions;

  const hasExceptionalWidth = isExceptionalCapacity(maxWidth);
  const hasExceptionalHeight = isExceptionalCapacity(maxHeight);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Maximize2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Dimensiones Permitidas</h3>
      </div>

      <div className="space-y-3 text-sm">
        {/* Width Range */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ancho mínimo:</span>
            <span className="font-medium">{minWidth}mm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ancho máximo:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{maxWidth}mm</span>
              {hasExceptionalWidth && (
                <Badge className="text-xs" variant="secondary">
                  Gran capacidad
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Height Range */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Alto mínimo:</span>
            <span className="font-medium">{minHeight}mm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Alto máximo:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{maxHeight}mm</span>
              {hasExceptionalHeight && (
                <Badge className="text-xs" variant="secondary">
                  Gran capacidad
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contextual Help */}
        {(hasExceptionalWidth || hasExceptionalHeight) && (
          <div className="rounded-md bg-muted/50 p-2 text-muted-foreground text-xs">
            <p>
              💡 Este modelo soporta grandes dimensiones, ideal para puertas
              corredizas y ventanales amplios.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
