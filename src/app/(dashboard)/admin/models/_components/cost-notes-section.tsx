/**
 * Cost Notes Section
 *
 * Notes and last cost review date
 */

"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FormDateInput, FormTextarea } from "./form-fields";

export function CostNotesSection() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Notas</CardTitle>
				<CardDescription>Información adicional</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<FormTextarea
					description="Observaciones sobre costos, cambios de precio, etc."
					label="Notas de Costos"
					name="costNotes"
					placeholder="Ej: Precio sujeto a cambios según proveedor..."
					rows={3}
				/>

				<FormDateInput
					description="Última fecha de revisión"
					label="Revisión de Costos"
					name="lastCostReviewDate"
				/>
			</CardContent>
		</Card>
	);
}
