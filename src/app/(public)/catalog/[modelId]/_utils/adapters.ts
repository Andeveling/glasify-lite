import type { ModelDetailOutput } from "@/server/api/routers/catalog";
import type { Model } from "../_types/model.types";
import { MATERIAL_BENEFITS } from "./material-benefits";

/**
 * Adapts ModelDetailOutput from tRPC to Model type used in components
 * Note: currency is now obtained from TenantConfig singleton, not from model
 */
export function adaptModelFromServer(serverModel: ModelDetailOutput): Model {
	// Map profileSupplier object with materialType
	const profileSupplier = serverModel.profileSupplier
		? {
				id: serverModel.profileSupplier.id,
				materialType: serverModel.profileSupplier.materialType,
				name: serverModel.profileSupplier.name,
			}
		: null;

	// Get material-specific benefits if supplier exists
	const materialFeatures = profileSupplier
		? MATERIAL_BENEFITS[profileSupplier.materialType]
		: [];

	return {
		basePrice: serverModel.basePrice,
		currency: "USD", // TODO: Pass currency from TenantConfig as parameter
		description: "Modelo de alta calidad con excelentes características", // TODO: Add description field to Model table
		dimensions: {
			maxHeight: serverModel.maxHeightMm,
			maxWidth: serverModel.maxWidthMm,
			minHeight: serverModel.minHeightMm,
			minWidth: serverModel.minWidthMm,
		},
		features: [
			"Fabricación de alta calidad",
			"Garantía del fabricante",
			...materialFeatures,
		],
		id: serverModel.id,
		imageUrl: serverModel.imageUrl || "/placeholder.webp",
		name: serverModel.name,
		profileSupplier,
	};
}
