/**
 * New Glass Type Page (US8 - T072)
 *
 * Server Component wrapper for glass type creation form
 *
 * Route: /admin/glass-types/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassTypeForm } from "../_components/glass-type-form";

export const metadata: Metadata = {
	description:
		"Crear un nuevo tipo de vidrio con sus soluciones y características",
	title: "Nuevo Tipo de Vidrio | Admin",
};

export default function NewGlassTypePage() {
	return (
		<div className="flex h-full flex-col gap-6 overflow-hidden">
			<div className="space-y-2">
				<h1 className="font-bold text-3xl tracking-tight">
					Nuevo Tipo de Vidrio
				</h1>
				<p className="text-muted-foreground">
					Crea un nuevo tipo de vidrio con sus soluciones y características
				</p>
			</div>
			<div className="flex flex-1 gap-4 overflow-hidden rounded-lg">
				{/* Formulario - Ocupa espacio flexible */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-0">
						<GlassTypeForm mode="create" />
					</div>
				</div>
				{/* Preview - Ancho fijo mínimo o flexible en pantallas grandes */}
				<div className="hidden w-full flex-1 lg:block">
					<Skeleton className="h-full w-full" />
				</div>
			</div>
		</div>
	);
}
