"use client";

import { BarChart3, FileX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyDashboardStateProps = {
  /**
   * Title for the empty state message
   */
  title?: string;

  /**
   * Description explaining why there's no data
   */
  description?: string;

  /**
   * Icon to display (defaults to FileX)
   */
  icon?: React.ComponentType<{ className?: string }>;

  /**
   * Additional CSS classes for the card
   */
  className?: string;
};

/**
 * EmptyDashboardState Component
 *
 * Displays a friendly message when no data is available for the selected period.
 * Used throughout the dashboard when filters return empty results.
 *
 * Features:
 * - Clear visual indication of no data
 * - Contextual messaging
 * - Consistent styling with dashboard
 * - Customizable icon and text
 *
 * @example
 * ```tsx
 * <EmptyDashboardState
 *   title="Sin datos para este período"
 *   description="No hay cotizaciones en los últimos 7 días. Intenta seleccionar un período diferente."
 * />
 * ```
 */
export function EmptyDashboardState({
  title = "Sin datos disponibles",
  description = "No hay información para mostrar en el período seleccionado. Intenta cambiar el filtro de período.",
  icon: Icon = FileX,
  className,
}: EmptyDashboardStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <BarChart3 className="h-4 w-4" />
          <span>Selecciona un período diferente para ver métricas.</span>
        </div>
      </CardContent>
    </Card>
  );
}
