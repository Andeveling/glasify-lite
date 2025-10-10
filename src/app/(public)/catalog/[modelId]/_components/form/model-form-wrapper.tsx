import { Suspense } from 'react';
import { api } from '@/trpc/server-client';
import { ModelFormSkeleton } from '../model-form-skeleton';
import { ModelForm } from './model-form';

type ModelFormWrapperProps = {
  serverModel: Awaited<ReturnType<(typeof api.catalog)['get-model-by-id']>>;
};

async function ModelFormData({ serverModel }: ModelFormWrapperProps) {
  // Fetch glass types compatible with this model
  const glassTypes = await api.catalog['list-glass-types']({
    glassTypeIds: serverModel.compatibleGlassTypeIds,
  });

  // Fetch services for this profile supplier
  const services = await api.catalog['list-services']({
    manufacturerId: serverModel.profileSupplier?.id ?? '',
  });

  // Fetch glass solutions filtered by model compatibility (UX: "Don't Make Me Think")
  // Only show solutions that have at least one compatible glass type for this model
  const solutions = await api.catalog['list-glass-solutions']({
    modelId: serverModel.id,
  });

  // Fetch tenant currency (now from TenantConfig singleton)
  const currency = await api.tenantConfig.getCurrency();

  return (
    <ModelForm
      currency={currency}
      glassTypes={glassTypes}
      model={serverModel}
      services={services}
      solutions={solutions}
    />
  );
}

export function ModelFormWrapper({ serverModel }: ModelFormWrapperProps) {
  return (
    <Suspense fallback={<ModelFormSkeleton />}>
      <ModelFormData serverModel={serverModel} />
    </Suspense>
  );
}
