"use client";

/**
 * Error Boundary: Cart Page
 *
 * Catches and displays errors in cart page.
 * Provides user-friendly error message in Spanish.
 *
 * @module app/(public)/cart/error
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CartErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/**
 * Cart page error boundary
 *
 * Next.js error boundary for cart route.
 * Shows Spanish error message and retry button.
 */
export default function CartError({ error, reset }: CartErrorProps) {
	useEffect(() => {
		// Log error to console in development
		// Note: Winston logger cannot be used here (client-side component)
		console.error("Cart error:", error);
	}, [error]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
				<h2 className="text-destructive mb-4 text-2xl font-semibold">
					Error al cargar el carrito
				</h2>

				<p className="text-muted-foreground mb-6">
					Ha ocurrido un error inesperado. Por favor, intenta recargar la
					página.
				</p>

				{/* Show error digest if available (production) */}
				{error.digest && (
					<p className="text-muted-foreground mb-4 text-sm">
						Código de error: {error.digest}
					</p>
				)}

				<div className="flex gap-3">
					<Button onClick={reset} variant="default">
						Recargar
					</Button>

					<Button
						onClick={() => {
							window.location.href = "/";
						}}
						variant="outline"
					>
						Volver al inicio
					</Button>
				</div>
			</div>
		</div>
	);
}
