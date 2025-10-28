import { Paintbrush } from 'lucide-react';
import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { BrandingConfigForm } from './_components/branding-config-form';

export const metadata: Metadata = {
  description: 'Configura el logo, colores y redes sociales de tu empresa',
  title: 'Configuración de Branding | Admin',
};

export const dynamic = 'force-dynamic';

export default async function BrandingPage() {
  const branding = await api.tenantConfig.getBranding();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Paintbrush className="h-6 w-6" />
        <div>
          <h1 className="font-bold text-3xl">Configuración de Branding</h1>
          <p className="text-muted-foreground">Personaliza la identidad visual de {branding.businessName}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <BrandingConfigForm initialData={branding} />
      </div>
    </div>
  );
}
