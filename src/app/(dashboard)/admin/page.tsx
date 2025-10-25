import type { Metadata } from 'next';
import { AdminContentContainer } from '@/app/(dashboard)/admin/_components/admin-content-container';
import { db } from '@/server/db';
import { DashboardContent } from './_components/dashboard-content';
export const metadata: Metadata = {
  description: 'Panel de métricas y estadísticas del negocio',
  title: 'Dashboard | Admin - Glasify Lite',
};

/**
 * Force dynamic rendering (SSR) for real-time metrics
 * Dashboard data should always be fresh (no static generation)
 */
export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard Home Page
 *
 * Server Component that displays business metrics as the main admin home page.
 * Replaces the old catalog entities overview with the metrics dashboard.
 *
 * Displays:
 * - Quote performance (total, conversion rate, trends) [US1]
 * - Catalog analytics (top models, glass types, suppliers) [US2]
 * - Monetary metrics (revenue, price ranges) [US3]
 * - Temporal filters (7d, 30d, 90d, year) [US4]
 *
 * RBAC: Admin sees all data, Seller sees only their own quotes
 *
 * Note: The old catalog overview moved to /admin/catalog (if needed)
 */
export default async function AdminDashboardPage() {
  // Fetch tenant config for formatting (timezone, locale, currency)
  const tenantConfig = await db.tenantConfig.findFirst({
    select: {
      currency: true,
      locale: true,
      timezone: true,
    },
  });

  return (
    <AdminContentContainer maxWidth="full">
      <DashboardContent tenantConfig={tenantConfig} />
    </AdminContentContainer>
  );
}
