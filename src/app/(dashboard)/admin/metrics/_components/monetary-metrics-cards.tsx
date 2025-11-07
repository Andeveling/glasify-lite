"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { MonetaryMetrics } from "@/types/dashboard";

type MonetaryMetricsCardsProps = {
  /**
   * Monetary metrics from tRPC query
   */
  data: MonetaryMetrics;

  /**
   * Tenant configuration for currency/locale formatting
   */
  tenantConfig?: { currency?: string; locale?: string } | null;
};

/**
 * MonetaryMetricsCards Component
 *
 * Displays monetary metrics in card format with trend indicators.
 * Shows total quote value and average ticket with period comparison.
 *
 * Features:
 * - 2 metric cards (total value, average value)
 * - Trend indicators (up/down arrows with percentage change)
 * - Formatted currency values from @lib/format (tenant-aware)
 * - Color-coded trends (green = positive, red = negative)
 *
 * @example
 * ```tsx
 * <MonetaryMetricsCards
 *   data={{
 *     totalValue: 50000000,
 *     averageValue: 2500000,
 *     percentageChange: 0.15,
 *     previousPeriodTotal: 43500000,
 *     currency: 'COP',
 *     locale: 'es-CO'
 *   }}
 *   tenantConfig={{ currency: 'COP', locale: 'es-CO' }}
 * />
 * ```
 */
export function MonetaryMetricsCards({
  data,
  tenantConfig,
}: MonetaryMetricsCardsProps) {
  const { totalValue, averageValue, percentageChange } = data;

  const isPositiveTrend = percentageChange >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const trendColor = isPositiveTrend ? "text-green-600" : "text-red-600";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Total Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Valor Total</CardTitle>
          <svg
            aria-label="Icono de dinero"
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            height="24"
            role="img"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Dinero</title>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {formatCurrency(totalValue, { context: tenantConfig })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={trendColor}>
              {formatPercent(Math.abs(percentageChange), {
                context: tenantConfig,
              })}
            </span>
            <span>vs período anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Ticket Promedio</CardTitle>
          <svg
            aria-label="Icono de usuario"
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            height="24"
            role="img"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Usuario</title>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {formatCurrency(averageValue, { context: tenantConfig })}
          </div>
          <CardDescription className="mt-1">
            Valor promedio por cotización
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
