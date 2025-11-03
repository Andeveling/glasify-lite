import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { useTenantConfig } from "@/providers/tenant-config-provider";
import type { Model } from "../_types/model.types";

type ModelInfoProps = {
	model: Model;
};

export function ModelInfo({ model }: ModelInfoProps) {
	const tenantConfig = useTenantConfig();

	return (
		<Card className="overflow-hidden p-0">
			{/* Image Section */}
			<div className="relative aspect-square w-full overflow-hidden bg-muted">
				<Image
					alt={model.name}
					className="h-full w-full object-cover"
					fill
					priority
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
					src={model.imageUrl || "/placeholder.webp"}
				/>
			</div>

			<CardContent className="py-0">
				{/* Price */}
				<div className="pt-0 pb-2">
					<p className="mb-1 font-medium text-muted-foreground text-sm">
						Precio Base
					</p>
					<p className="font-bold text-3xl text-foreground">
						{formatCurrency(model.basePrice, { context: tenantConfig })}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
