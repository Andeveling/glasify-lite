import { notFound } from "next/navigation";
import { api } from "@/trpc/server-client";
import { ModelFormWrapper } from "./_components/form/model-form-wrapper";
import { ModelHeader } from "./_components/model-header";
import { QuoteWizard } from "./_components/quote-wizard";

type PageProps = {
  params: Promise<{ modelId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { modelId } = await params;

  // Fetch model data (critical data - no Suspense)
  const serverModel = await api.catalog["get-model-by-id"]({ modelId }).catch(
    () => null
  );

  if (!serverModel) {
    notFound();
  }

  // Fetch wizard data in parallel (glassSolutions and services)
  const [glassSolutions, services] = await Promise.all([
    api.catalog["list-glass-solutions"]({ modelId }),
    api.catalog["list-services"]({}),
  ]);

  // Feature flag: Use wizard for now, can switch to ModelFormWrapper later
  const useWizard = true;

  // Render with Suspense boundaries for secondary data
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
        {/* Single column: Model info + Form */}
        <div className="space-y-6">
          {/* Model Information */}
          <ModelHeader model={serverModel} />

          {/* Wizard or Form */}
                    {useWizard ? (
            <QuoteWizard
              glassSolutions={glassSolutions}
              modelId={modelId}
              services={services}
            />
          ) : (
            <ModelFormWrapper serverModel={serverModel} />
          )}
        </div>
      </div>
    </div>
  );
}
