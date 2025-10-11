import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { ModelFormWrapper } from './_components/form/model-form-wrapper';
import { ModelSidebarWrapper } from './_components/model-sidebar-wrapper';

type PageProps = {
  params: Promise<{ modelId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { modelId } = await params;

  // Fetch model data (critical data - no Suspense)
  const serverModel = await api.catalog['get-model-by-id']({ modelId }).catch(() => null);

  if (!serverModel) notFound();

  // Render with Suspense boundaries for secondary data
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <ModelSidebarWrapper serverModel={serverModel} />
          <ModelFormWrapper serverModel={serverModel} />
        </div>
      </div>
    </div>
  );
}
