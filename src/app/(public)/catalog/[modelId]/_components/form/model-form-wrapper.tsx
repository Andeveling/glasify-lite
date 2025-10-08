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

  // Fetch services for this manufacturer
  const services = await api.catalog['list-services']({
    manufacturerId: serverModel.manufacturer?.id ?? '',
  });

  return <ModelForm glassTypes={glassTypes} model={serverModel} services={services} />;
}

export function ModelFormWrapper({ serverModel }: ModelFormWrapperProps) {
  return (
    <Suspense fallback={<ModelFormSkeleton />}>
      <ModelFormData serverModel={serverModel} />
    </Suspense>
  );
}
