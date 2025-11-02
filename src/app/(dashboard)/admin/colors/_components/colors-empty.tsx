/**
 * Colors Empty State Component
 *
 * Displays when no colors are found matching the filters
 * Follows "Don't Make Me Think": Clear, contextual message
 *
 * Usage: Shows when colors.length === 0
 */

"use client";

import { Palette } from "lucide-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

type ColorsEmptyProps = {
	searchTerm?: string;
};

export function ColorsEmpty({ searchTerm }: ColorsEmptyProps) {
	const hasSearch = Boolean(searchTerm?.trim());

	return (
		<Empty className="border-0 bg-transparent">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Palette className="h-6 w-6 text-muted-foreground" />
				</EmptyMedia>
				<div>
					<EmptyTitle>
						{hasSearch ? "Sin resultados" : "Sin colores"}
					</EmptyTitle>
					<EmptyDescription>
						{hasSearch
							? "No hay colores que coincidan con la búsqueda. Intenta con otros términos."
							: "Aún no hay colores registrados. Crea uno para comenzar."}
					</EmptyDescription>
				</div>
			</EmptyHeader>
		</Empty>
	);
}
