import { notFound } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/trpc/server-client";
import { ModelFormWrapper } from "./_components/form/model-form-wrapper";
import { ModelFormSkeleton } from "./_components/model-form-skeleton";

type PageProps = {
	params: Promise<{ modelId: string }>;
};

async function ModelPageContent({ modelId }: { modelId: string }) {
	// Fetch model data (critical data - wrapped in Suspense)
	const serverModel = await api.catalog["get-model-by-id"]({ modelId }).catch(
		() => null,
	);

	if (!serverModel) {
		notFound();
	}

	// Render with Suspense boundaries for secondary data
	return (
		<div className="min-h-screen bg-muted/30">
			<div className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
				<div className="flex flex-col">
					{/* Form - Full width on mobile, right column on desktop */}
					<ModelFormWrapper serverModel={serverModel} />
				</div>
			</div>
		</div>
	);
}

export default async function Page({ params }: PageProps) {
	const { modelId } = await params;

	return (
		<Suspense fallback={<ModelFormSkeleton />}>
			<ModelPageContent modelId={modelId} />
		</Suspense>
	);
}
