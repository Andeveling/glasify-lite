import { Suspense } from "react";
import type { api } from "@/trpc/server-client";
import { adaptModelFromServer } from "../_utils/adapters";
import { ModelSidebar } from "./model-sidebar";
import { ModelSidebarSkeleton } from "./model-sidebar-skeleton";

type ModelSidebarWrapperProps = {
	serverModel: Awaited<ReturnType<(typeof api.catalog)["get-model-by-id"]>>;
};

function ModelSidebarContent({ serverModel }: ModelSidebarWrapperProps) {
	const modelDisplay = adaptModelFromServer(serverModel);
	return <ModelSidebar model={modelDisplay} />;
}

export function ModelSidebarWrapper({ serverModel }: ModelSidebarWrapperProps) {
	return (
		<Suspense fallback={<ModelSidebarSkeleton />}>
			<ModelSidebarContent serverModel={serverModel} />
		</Suspense>
	);
}
