import { notFound } from "next/navigation";
import { api } from "@/trpc/server-client";
import { ModelFormWrapper } from "./_components/form/model-form-wrapper";
import { ModelSidebarWrapper } from "./_components/model-sidebar-wrapper";

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

  // Render with Suspense boundaries for secondary data
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
        <div className="flex flex-col md:col-2">
          {/* Sidebar - Only visible on desktop (lg breakpoint) */}
          <div className="hidden lg:block">
            <ModelSidebarWrapper serverModel={serverModel} />
          </div>

          {/* Form - Full width on mobile, right column on desktop */}
          <ModelFormWrapper serverModel={serverModel} />
        </div>
      </div>
    </div>
  );
}
