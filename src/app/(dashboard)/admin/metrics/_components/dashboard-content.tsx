"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { DashboardPeriod } from "@/types/dashboard";
import { EmptyDashboardState } from "./empty-dashboard-state";
import { GlassTypesChart } from "./glass-types-chart";
import { MonetaryMetricsCards } from "./monetary-metrics-cards";
import { PeriodSelector } from "./period-selector";
import { PriceRangesChart } from "./price-ranges-chart";
import { QuotesMetricsCards } from "./quotes-metrics-cards";
import { QuotesTrendChart } from "./quotes-trend-chart";
import { SupplierDistributionChart } from "./supplier-distribution-chart";
import { TopModelsChart } from "./top-models-chart";

interface DashboardContentProps {
  /**
   * Tenant configuration for formatting (from server)
   */
  tenantConfig?: {
    locale?: string;
    currency?: string;
    timezone?: string;
  } | null;
}

/**
 * DashboardContent Component
 *
 * Client Component that handles:
 * - Period selection from URL params
 * - TanStack Query hooks for dashboard data
 * - Loading and error states
 * - US1: Quote performance metrics and trend
 *
 * This component is rendered inside the Server Component page.tsx
 * which provides the initial tenant config.
 *
 * Features:
 * - URL-based period state (shareable links)
 * - Optimistic UI updates
 * - Error boundaries
 * - RBAC-aware data fetching
 */
export function DashboardContent({ tenantConfig }: DashboardContentProps) {
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") ?? DashboardPeriod.LAST_30_DAYS) as
    | "7d"
    | "30d"
    | "90d"
    | "year";

  // Fetch quote metrics
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = api.dashboard.getQuotesMetrics.useQuery({
    period,
  });

  // Fetch quote trend
  const {
    data: trendData,
    isLoading: trendLoading,
    error: trendError,
  } = api.dashboard.getQuotesTrend.useQuery({
    period,
  });

  // Fetch catalog analytics
  const {
    data: catalogData,
    isLoading: catalogLoading,
    error: catalogError,
  } = api.dashboard.getCatalogAnalytics.useQuery({
    period,
  });

  // Fetch monetary metrics
  const {
    data: monetaryData,
    isLoading: monetaryLoading,
    error: monetaryError,
  } = api.dashboard.getMonetaryMetrics.useQuery({
    period,
  });

  // Fetch price ranges
  const {
    data: priceRangesData,
    isLoading: priceRangesLoading,
    error: priceRangesError,
  } = api.dashboard.getPriceRanges.useQuery({
    period,
  });

  // Global loading state
  const isLoading =
    metricsLoading ||
    trendLoading ||
    catalogLoading ||
    monetaryLoading ||
    priceRangesLoading;

  // Global error state
  const hasError =
    metricsError ||
    trendError ||
    catalogError ||
    monetaryError ||
    priceRangesError;

  if (hasError) {
    return (
      <EmptyDashboardState
        description="No se pudieron cargar los datos del dashboard. Por favor, intenta recargar la página."
        title="Error al cargar métricas"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Dashboard de Métricas
          </h1>
          <p className="text-muted-foreground">
            Análisis de rendimiento y estadísticas del negocio
          </p>
        </div>
        <PeriodSelector className="w-48" defaultPeriod={period} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Cargando métricas...
          </span>
        </div>
      )}

      {/* Quote Performance Section (US1) */}
      {!isLoading && metricsData && trendData && (
        <>
          <section className="space-y-4">
            <h2 className="font-semibold text-xl">
              Rendimiento de Cotizaciones
            </h2>
            <QuotesMetricsCards
              metrics={metricsData}
              tenantConfig={tenantConfig}
            />
            <QuotesTrendChart
              data={trendData.data}
              periodLabel={trendData.period}
            />
          </section>

          {/* Catalog Analytics Section (US2) */}
          {catalogData && (
            <section className="space-y-4">
              <h2 className="font-semibold text-xl">Análisis del Catálogo</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <TopModelsChart
                  data={catalogData.topModels}
                  tenantConfig={tenantConfig}
                />
                <GlassTypesChart
                  data={catalogData.topGlassTypes}
                  tenantConfig={tenantConfig}
                />
                <SupplierDistributionChart
                  data={catalogData.supplierDistribution}
                  tenantConfig={tenantConfig}
                />
              </div>
            </section>
          )}

          {/* Monetary Metrics Section (US3) */}
          {monetaryData && priceRangesData && (
            <section className="space-y-4">
              <h2 className="font-semibold text-xl">Métricas Monetarias</h2>
              <MonetaryMetricsCards
                data={monetaryData}
                tenantConfig={tenantConfig}
              />
              <PriceRangesChart
                data={priceRangesData.ranges}
                tenantConfig={tenantConfig}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
