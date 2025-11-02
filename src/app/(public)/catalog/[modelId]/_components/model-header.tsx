import Image from "next/image";
import { formatCurrency } from "@/lib/format";

/**
 * Model Header Component
 * Displays model information with image, name, and base price
 * Designed to be integrated within the wizard, not as a separate piece
 */

type ModelHeaderProps = {
	model: {
		id: string;
		name: string;
		basePrice: number;
		imageUrl?: string | null;
		profileSupplier?: {
			id: string;
			name: string;
			materialType: string;
		} | null;
	};
};

export function ModelHeader({ model }: ModelHeaderProps) {
	return (
		<div className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
				{/* Model Image */}
				{model.imageUrl ? (
					<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted/30 sm:h-32 sm:w-32">
						<Image
							alt={`Modelo ${model.name}`}
							className="h-full w-full object-contain p-2"
							height={128}
							src={model.imageUrl}
							width={128}
						/>
					</div>
				) : (
					<div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg border bg-muted/30 sm:h-32 sm:w-32">
						<span className="text-center text-muted-foreground text-xs">
							Sin imagen
						</span>
					</div>
				)}

				{/* Model Info */}
				<div className="min-w-0 flex-1 space-y-2">
					<h1 className="font-semibold text-2xl md:text-3xl">{model.name}</h1>
					{model.profileSupplier && (
						<p className="text-muted-foreground text-sm">
							{model.profileSupplier.name} •{" "}
							{model.profileSupplier.materialType}
						</p>
					)}
					<div className="flex items-baseline gap-2">
						<span className="text-muted-foreground text-sm">Precio base:</span>
						<span className="font-semibold text-lg">
							{formatCurrency(model.basePrice)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
