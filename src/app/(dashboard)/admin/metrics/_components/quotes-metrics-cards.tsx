"use client";

import { FileCheck, FileText, FileX, Send } from "lucide-react";
import { formatPercent } from "@/lib/format";
import type { QuoteMetrics } from "@/types/dashboard";
import { MetricCard } from "./metric-card";

// Conversion constant for decimal to percentage display
const PERCENTAGE_MULTIPLIER = 100;

type QuotesMetricsCardsProps = {
  /**
   * Quote metrics data from tRPC query
   */
  metrics: QuoteMetrics;

  /**
   * Tenant configuration for formatting (locale, currency, timezone)
   */
  tenantConfig?: {
    locale?: string;
    currency?: string;
    timezone?: string;
  } | null;
};

/**
 * QuotesMetricsCards Component
 *
 * Displays 4 metric cards showing quote performance:
 * - Total quotes generated
 * - Draft quotes (not sent yet)
 * - Sent quotes (awaiting client response)
 * - Conversion rate (sent/total percentage)
 *
 * All metrics show trend indicators comparing to previous period.
 *
 * Features:
 * - RBAC aware (displays filtered data)
 * - Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
 * - Formatted percentages using @lib/format
 * - Trend arrows (up/down) with color coding
 *
 * @example
 * ```tsx
 * <QuotesMetricsCards
 *   metrics={{
 *     totalQuotes: 150,
 *     draftQuotes: 45,
 *     sentQuotes: 100,
 *     canceledQuotes: 5,
 *     conversionRate: 0.667,
 *     percentageChange: 0.25
 *   }}
 *   tenantConfig={tenantConfig}
 * />
 * ```
 */
export function QuotesMetricsCards({
  metrics,
  tenantConfig,
}: QuotesMetricsCardsProps) {
  // Format conversion rate using centralized formatter
  const conversionRateFormatted = formatPercent(metrics.conversionRate, {
    context: tenantConfig,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        description="En el período"
        icon={FileText}
        title="Total de Cotizaciones"
        trend={metrics.percentageChange * PERCENTAGE_MULTIPLIER}
        value={metrics.totalQuotes}
      />

      <MetricCard
        description="Sin enviar"
        icon={FileCheck}
        title="Borradores"
        value={metrics.draftQuotes}
      />

      <MetricCard
        description="Esperando respuesta"
        icon={Send}
        title="Enviadas"
        value={metrics.sentQuotes}
      />

      <MetricCard
        description="Enviadas / Total"
        icon={FileX}
        title="Tasa de Conversión"
        trend={metrics.percentageChange * PERCENTAGE_MULTIPLIER}
        value={conversionRateFormatted}
      />
    </div>
  );
}
