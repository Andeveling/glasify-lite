"use client";

import { Button } from "@/components/ui/button";

/**
 * Catalog Error Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays error state when catalog fails to load.
 * Provides user with retry option.
 */
export function CatalogError() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="text-center">
				<h1 className="mb-4 font-bold text-2xl text-foreground">
					Error al cargar el catálogo
				</h1>
				<p className="mb-6 text-muted-foreground">
					No se pudieron cargar los modelos de vidrio. Por favor, intente
					nuevamente.
				</p>
				<Button onClick={() => window.location.reload()}>Reintentar</Button>
			</div>
		</div>
	);
}
