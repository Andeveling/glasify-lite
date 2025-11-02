import {
	AlertCircle,
	BookOpen,
	Home,
	Search,
	ShoppingCart,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BackButton } from "./_components/back-button";

export const metadata: Metadata = {
	description: "La página que buscas no existe o ha sido movida",
	title: "Página No Encontrada - Glasify",
};

export default function PublicNotFound() {
	return (
		<div className="flex min-h-[80vh] items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				<Card>
					<CardHeader className="text-center">
						<div className="mb-4 flex justify-center">
							<AlertCircle className="h-16 w-16 text-muted-foreground" />
						</div>
						<CardTitle className="font-bold text-3xl">
							Página No Encontrada
						</CardTitle>
						<CardDescription className="text-lg">
							Lo sentimos, la página que buscas no existe o ha sido movida.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						{/* Error message */}
						<div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
							<p className="text-muted-foreground text-sm">
								<strong>Error 404:</strong> El recurso solicitado no pudo ser
								encontrado en nuestro servidor.
							</p>
						</div>

						{/* Navigation options */}
						<div className="space-y-4">
							<h3 className="mb-4 text-center font-semibold text-lg">
								¿Qué te gustaría hacer?
							</h3>

							<div className="grid gap-3 md:grid-cols-2">
								<Link href="/catalog">
									<Button className="h-auto w-full p-4" variant="default">
										<div className="flex flex-col items-center gap-2">
											<Search className="h-5 w-5" />
											<div className="text-center">
												<div className="font-medium">Ver Catálogo</div>
												<div className="text-xs opacity-90">
													Explorar nuestros productos
												</div>
											</div>
										</div>
									</Button>
								</Link>

								<Link href="/quote">
									<Button className="h-auto w-full p-4" variant="outline">
										<div className="flex flex-col items-center gap-2">
											<ShoppingCart className="h-5 w-5" />
											<div className="text-center">
												<div className="font-medium">Crear Cotización</div>
												<div className="text-xs opacity-90">
													Obtener presupuesto
												</div>
											</div>
										</div>
									</Button>
								</Link>
							</div>

							<div className="flex flex-col items-center gap-2">
								<Link href="/">
									<Button className="gap-2" variant="ghost">
										<Home className="h-4 w-4" />
										Volver al Inicio
									</Button>
								</Link>

								<BackButton />
							</div>
						</div>

						{/* Help section */}
						<div className="border-t pt-6">
							<div className="space-y-3 text-center">
								<div className="flex items-center justify-center gap-2 text-muted-foreground">
									<BookOpen className="h-4 w-4" />
									<span className="font-medium text-sm">¿Necesitas ayuda?</span>
								</div>

								<div className="space-y-2 text-muted-foreground text-sm">
									<p>
										Si llegaste aquí desde un enlace interno, por favor{" "}
										<a
											className="text-primary underline hover:no-underline"
											href="mailto:soporte@glasify.com"
										>
											repórtanos el problema
										</a>
									</p>

									<p>
										También puedes{" "}
										<Link
											className="text-primary underline hover:no-underline"
											href="/catalog"
										>
											explorar nuestro catálogo completo
										</Link>{" "}
										para encontrar lo que buscas.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
