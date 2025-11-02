/**
 * Dimensions Section
 *
 * Width/height limits and glass discounts
 */

"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FormNumberInput } from "./form-fields";

export function DimensionsSection() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Dimensiones</CardTitle>
				<CardDescription>
					Límites de ancho y alto, y descuentos para el vidrio
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-6 md:grid-cols-2">
				{/* Width Constraints */}
				<div className="space-y-4 md:col-span-2">
					<h4 className="font-medium text-sm">Ancho (mm)</h4>
					<div className="grid gap-4 md:grid-cols-2">
						<FormNumberInput
							description="Ancho mínimo permitido"
							label="Mínimo"
							min={0}
							name="minWidthMm"
							placeholder="600"
							required
							step={1}
						/>

						<FormNumberInput
							description="Ancho máximo permitido"
							label="Máximo"
							min={0}
							name="maxWidthMm"
							placeholder="2000"
							required
							step={1}
						/>
					</div>
				</div>

				{/* Height Constraints */}
				<div className="space-y-4 md:col-span-2">
					<h4 className="font-medium text-sm">Alto (mm)</h4>
					<div className="grid gap-4 md:grid-cols-2">
						<FormNumberInput
							description="Alto mínimo permitido"
							label="Mínimo"
							min={0}
							name="minHeightMm"
							placeholder="800"
							required
							step={1}
						/>

						<FormNumberInput
							description="Alto máximo permitido"
							label="Máximo"
							min={0}
							name="maxHeightMm"
							placeholder="2200"
							required
							step={1}
						/>
					</div>
				</div>

				{/* Glass Discounts */}
				<div className="space-y-4 md:col-span-2">
					<h4 className="font-medium text-sm">Descuentos de Vidrio</h4>
					<div className="grid gap-4 md:grid-cols-2">
						<FormNumberInput
							description="Descuento por lado para cálculo de vidrio"
							label="Descuento Ancho (mm)"
							min={0}
							name="glassDiscountWidthMm"
							placeholder="0"
							step={1}
						/>

						<FormNumberInput
							description="Descuento por lado para cálculo de vidrio"
							label="Descuento Alto (mm)"
							min={0}
							name="glassDiscountHeightMm"
							placeholder="0"
							step={1}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
