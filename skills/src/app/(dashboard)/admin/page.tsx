import type { Metadata } from 'next'
import { AdminContentContainer } from '@/app/(dashboard)/admin/_components/admin-content-container'
import { db } from '@/server/db'
import { DashboardContent } from './metrics/_components/dashboard-content'

export const metadata: Metadata = {
  description: 'Panel de control del administrador con estadísticas y acciones rápidas',
  title: 'Dashboard Administrativo | Glasify Lite',
}


export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const tenantConfig = await db.tenantConfig.findFirst({
    select: {
      currency: true,
      locale: true,
      timezone: true,
    },
  })

  return (
    <AdminContentContainer maxWidth="full">
      <DashboardContent tenantConfig={tenantConfig} />
    </AdminContentContainer>
  )
}
