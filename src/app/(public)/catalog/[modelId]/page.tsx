import { notFound } from "next/navigation";
import { api } from "@/trpc/server-client";
import { ModelFormWrapper } from "./_components/form/model-form-wrapper";
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

  // Render wizard with integrated model header
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
        {/* Wizard with integrated model header */}
        {useWizard ? (
          <QuoteWizard
            glassSolutions={glassSolutions}
            model={serverModel}
            services={services}
          />
        ) : (
          <ModelFormWrapper serverModel={serverModel} />
        )}
      </div>
    </div>
  );
}
