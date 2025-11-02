"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type GlobalErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		// Optional: Log error to external service
		// console.error("Global error:", error);
	}, []);

	return (
		<html lang="es">
			<body>
				<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
					<div className="w-full max-w-md space-y-6">
						<Card>
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
									<AlertTriangle className="h-12 w-12 text-destructive" />
								</div>
								<CardTitle className="text-2xl">¡Algo salió mal!</CardTitle>
								<CardDescription>
									Ha ocurrido un error inesperado en la aplicación. Nuestro
									equipo ha sido notificado.
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-6">
								{/* Error Details for Development */}
								{process.env.NODE_ENV === "development" && (
									<Alert>
										<AlertTriangle className="h-4 w-4" />
										<AlertDescription>
											<div className="space-y-2">
												<p className="font-semibold text-sm">
													Detalles del Error (Solo en Desarrollo):
												</p>
												<p className="break-all font-mono text-xs">
													{error.message}
												</p>
												{error.digest && (
													<p className="font-mono text-xs">
														ID: {error.digest}
													</p>
												)}
											</div>
										</AlertDescription>
									</Alert>
								)}

								{/* Action Buttons */}
								<div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
									<Button className="flex-1" onClick={reset}>
										Intentar de Nuevo
									</Button>
									<Button asChild className="flex-1" variant="outline">
										<Link href="/catalog">Ir al Catálogo</Link>
									</Button>
								</div>

								{/* Contact Support */}
								<div className="text-center text-muted-foreground text-sm">
									<p>
										Si el problema persiste, por favor{" "}
										<Button
											asChild
											className="h-auto p-0"
											size="sm"
											variant="link"
										>
											<Link href="/catalog">contacta a soporte</Link>
										</Button>
										.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</body>
		</html>
	);
}
