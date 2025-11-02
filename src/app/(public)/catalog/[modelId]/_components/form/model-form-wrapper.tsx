import { Suspense } from "react";
import { getTenantConfig } from "@/server/utils/tenant";
import { api } from "@/trpc/server-client";
import { ModelFormSkeleton } from "../model-form-skeleton";
import { ModelForm } from "./model-form";

type ModelFormWrapperProps = {
	serverModel: Awaited<ReturnType<(typeof api.catalog)["get-model-by-id"]>>;
};

async function ModelFormData({ serverModel }: ModelFormWrapperProps) {
	// Fetch glass types compatible with this model
	const glassTypes = await api.catalog["list-glass-types"]({
		glassTypeIds: serverModel.compatibleGlassTypeIds,
	});

	// Fetch services (now global, no longer tied to manufacturer)
	const services = await api.catalog["list-services"]({});

	// Fetch glass solutions filtered by model compatibility (UX: "Don't Make Me Think")
	// Only show solutions that have at least one compatible glass type for this model
	const solutions = await api.catalog["list-glass-solutions"]({
		modelId: serverModel.id,
	});

	// Check if model has colors (for conditional rendering in form)
	const colorData = await api.quote["get-model-colors-for-quote"]({
		modelId: serverModel.id,
	});
	const hasColors = colorData.hasColors;

	// Fetch tenant currency directly from utility (Server Component - no tRPC overhead)
	// Public data - no authentication required
	const tenantConfig = await getTenantConfig();
	const currency = tenantConfig.currency;

	return (
		<ModelForm
			currency={currency}
			glassTypes={glassTypes}
			hasColors={hasColors}
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
