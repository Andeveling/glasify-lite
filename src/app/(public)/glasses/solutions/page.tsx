/**
 * Glass Solutions List Page
 *
 * Public page displaying all available glass solutions.
 * Marked as dynamic to allow access to headers() via tRPC.
 *
 * @route /glasses/solutions
 * @access public (no authentication required)
 * @caching dynamic (requires headers for auth context)
 * @generated On-demand rendering with ISR
 */

import { GlassesIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getIconComponent } from "@/lib/icon-map";
import { api } from "@/trpc/server-client";

// MIGRATED: Removed "use cache" (incompatible with headers() in tRPC context)
// MIGRATED: Removed export const dynamic = 'force-static' (incompatible with Cache Components)
// MIGRATED: Removed export const revalidate = 3600 (incompatible with Cache Components)
// Note: Page is rendered on-demand with ISR because tRPC requires headers() for context

/**
 * SEO Metadata for glass solutions listing page
 */
export const metadata: Metadata = {
	description:
		"Explora nuestras soluciones de vidrio especializadas para control solar, eficiencia energética, aislamiento, seguridad y más.",
	openGraph: {
		description:
			"Soluciones de vidrio personalizadas para todas tus necesidades arquitectónicas y de construcción.",
		title: "Soluciones de Vidrio | Glasify Lite",
		type: "website",
	},
	title: "Soluciones de Vidrio | Glasify Lite",
};

/**
 * Glass Solutions List Page Component
 *
 * Server Component that fetches and displays all glass solutions.
 * Each solution is a link to its detail page.
 */
export default async function GlassSolutionsPage() {
	try {
		// Fetch solutions from tRPC server procedure
		const { items: solutions } = await api.catalog["list-solutions"]({
			limit: 100,
			page: 1,
		});

		if (solutions.length === 0) {
			return (
				<div className="flex min-h-96 flex-col items-center justify-center text-center">
					<GlassesIcon className="mb-4 h-12 w-12 text-muted-foreground" />
					<h1 className="mb-2 font-bold text-2xl">
						Sin soluciones disponibles
					</h1>
					<p className="text-muted-foreground">
						Por el momento no hay soluciones de vidrio disponibles.
					</p>
				</div>
			);
		}

		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 sm:py-16 lg:py-20">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-12 text-center">
						<h1 className="mb-4 font-bold text-4xl tracking-tight">
							Soluciones de Vidrio
						</h1>
						<p className="text-lg text-muted-foreground">
							Descubre nuestras soluciones especializadas de vidrio para cada
							necesidad de tu proyecto.
						</p>
					</div>

					{/* Solutions Grid */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{solutions.map((solution) => {
							const IconComponent = getIconComponent(solution.icon);

							return (
								<Link
									className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
									href={`/glasses/solutions/${solution.slug}`}
									key={solution.id}
								>
									{/* Icon */}
									<div className="mb-4 inline-block rounded-lg bg-primary/10 p-3 text-primary">
										<IconComponent className="h-6 w-6" />
									</div>

									{/* Content */}
									<div>
										<h2 className="mb-2 font-semibold text-xl group-hover:text-primary">
											{solution.nameEs}
										</h2>
										{solution.description && (
											<p className="line-clamp-3 text-muted-foreground text-sm">
												{solution.description}
											</p>
										)}
									</div>

									{/* Arrow indicator */}
									<div className="absolute right-6 bottom-6 transition-transform group-hover:translate-x-1">
										<svg
											aria-labelledby={`title-${solution.id}`}
											className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100"
											fill="none"
											role="img"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title id={`title-${solution.id}`}>Ver detalles</title>
											<path
												d="M9 5l7 7-7 7"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		);
	} catch {
		// Note: Cannot use logger in cached functions - it accesses headers()
		// Error details will be visible in browser console

		return (
			<div className="flex min-h-96 flex-col items-center justify-center text-center">
				<GlassesIcon className="mb-4 h-12 w-12 text-destructive" />
				<h1 className="mb-2 font-bold text-2xl">Error al cargar soluciones</h1>
				<p className="text-muted-foreground">
					Hubo un problema al cargar las soluciones de vidrio. Por favor,
					intenta más tarde.
				</p>
			</div>
		);
	}
}
