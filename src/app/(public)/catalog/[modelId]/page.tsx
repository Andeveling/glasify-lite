import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackLink } from "@/components/ui/back-link";
import { api } from "@/trpc/server-client";
import { ModelFormWrapper } from "./_components/form/model-form-wrapper";
import { ModelFormSkeleton } from "./_components/model-form-skeleton";

type PageProps = {
  params: Promise<{ modelId: string }>;
};

async function ModelPageContent({ modelId }: { modelId: string }) {
  // Fetch model data (critical data - wrapped in Suspense)
  try {
    const serverModel = await api.catalog["get-model-by-id"]({ modelId });

    // Render with Suspense boundaries for secondary data
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto max-w-7xl space-x-2 px-3 py-4 sm:px-4 sm:py-8">
          {/* Back navigation */}
          <BackLink href="/catalog" icon="chevron" variant="link">
            Volver al Catálogo
          </BackLink>
          <div className="flex flex-col gap-4">
            {/* Form - Full width on mobile, right column on desktop */}
            <ModelFormWrapper serverModel={serverModel} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // If it's a NOT_FOUND error, show 404 page
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    // For other errors, re-throw to let error boundary handle it
    throw error;
  }
}

export default async function Page({ params }: PageProps) {
  const { modelId } = await params;

  return (
    <Suspense fallback={<ModelFormSkeleton />}>
      <ModelPageContent modelId={modelId} />
    </Suspense>
  );
}
