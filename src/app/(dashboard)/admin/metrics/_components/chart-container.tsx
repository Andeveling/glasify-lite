"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartContainerProps = {
  /**
   * Chart title displayed in the header
   */
  title: string;

  /**
   * Optional description/subtitle for the chart
   */
  description?: string;

  /**
   * Recharts component (LineChart, BarChart, PieChart, etc.)
   */
  children: ReactNode;

  /**
   * Additional CSS classes for the card
   */
  className?: string;

  /**
   * Height class for the chart content area (default: h-64)
   */
  height?: string;
};

/**
 * ChartContainer Component
 *
 * Reusable wrapper for Recharts components with consistent styling.
 * Provides responsive sizing, theme support, and proper card structure.
 *
 * Features:
 * - Responsive container with proper aspect ratio
 * - Consistent card styling across all charts
 * - Dark mode support (inherits from theme)
 * - Flexible height configuration
 *
 * Usage with Recharts:
 * - Wrap any Recharts component (ResponsiveContainer is included)
 * - Chart inherits theme colors automatically
 * - Title and description provide context
 *
 * @example
 * ```tsx
 * <ChartContainer
 *   title="Tendencia de Cotizaciones"
 *   description="Últimos 30 días"
 *   height="h-80"
 * >
 *   <ResponsiveContainer width="100%" height="100%">
 *     <LineChart data={data}>
 *       <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
 *     </LineChart>
 *   </ResponsiveContainer>
 * </ChartContainer>
 * ```
 */
export function ChartContainer({
  title,
  description,
  children,
  className,
  height = "h-64",
}: ChartContainerProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={cn("w-full", height)}>{children}</div>
      </CardContent>
    </Card>
  );
}
