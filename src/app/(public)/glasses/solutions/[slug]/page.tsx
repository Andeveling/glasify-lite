/**
 * Glass Solution Detail Page
 *
 * Public page displaying individual glass solution with all assigned glass types.
 * Uses ISR with 3600-second revalidation for performance.
 * Statically generated for all solutions at build time with periodic revalidation.
 *
 * @route /glasses/solutions/[slug]
 * @access public (no authentication required)
 * @caching ISR: 3600 seconds (1 hour)
 * @staticGeneration generateStaticParams generates paths for all solutions
 */

import { ArrowLeft, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import logger from '@/lib/logger';
import { getIconComponent } from '@/lib/icon-map';
import { api } from '@/trpc/server-client';

// Static generation with 1-hour revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // ISR: 1 hour

/**
 * Generate static params for all glass solutions
 * This is called at build time to generate paths for all solutions
 */
export async function generateStaticParams() {
  try {
    const { items: solutions } = await api.catalog[ 'list-solutions' ]({
      limit: 1000,
      page: 1,
    });

    return solutions.map((solution) => ({
      slug: solution.slug,
    }));
  } catch (error) {
    logger.error('Error generating static params for glass solutions', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return empty array to prevent build failure
    // Pages will be generated on-demand during ISR
    return [];
  }
}

/**
 * Generate dynamic metadata for each solution page
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const solution = await api.catalog[ 'get-by-slug' ]({ slug }).catch(() => null);

    if (!solution) {
      return {
        description: 'La solución de vidrio solicitada no existe.',
        title: 'Solución no encontrada | Glasify Lite',
      };
    }

    return {
      description:
        solution.description || `Descubre la solución de vidrio ${solution.nameEs} y sus características especiales.`,
      openGraph: {
        description: solution.description || `Solución de vidrio especializada: ${solution.nameEs}`,
        title: `${solution.nameEs} | Glasify Lite`,
        type: 'website',
      },
      title: `${solution.nameEs} | Glasify Lite`,
    };
  } catch (error) {
    logger.error('Error generating metadata for glass solution', {
      error: error instanceof Error ? error.message : 'Unknown error',
      slug,
    });

    return {
      description: 'Error al cargar la página de solución de vidrio.',
      title: 'Error | Glasify Lite',
    };
  }
}

/**
 * Performance rating component
 */
function PerformanceRating({ rating }: { rating: string }): React.ReactElement {
  type RatingKey = 'basic' | 'excellent' | 'good' | 'standard' | 'very_good';

  const ratings: Record<RatingKey, { label: string; stars: number }> = {
    basic: { label: 'Básico', stars: 1 },
    excellent: { label: 'Excelente', stars: 5 },
    good: { label: 'Bueno', stars: 3 },
    standard: { label: 'Estándar', stars: 2 },
    // biome-ignore lint/style/useNamingConvention: Matches database enum value
    very_good: { label: 'Muy Bueno', stars: 4 },
  };

  const ratingKey = (rating as RatingKey) || 'standard';
  const ratingData = ratings[ratingKey];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            className={`h-4 w-4 ${i < ratingData.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            key={i}
          />
        ))}
      </div>
      <span className="text-muted-foreground text-sm">{ratingData.label}</span>
    </div>
  );
}

/**
 * Glass Solution Detail Page Component
 */
export default async function GlassSolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const solution = await api.catalog[ 'get-by-slug' ]({ slug });

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        {/* Breadcrumb Navigation */}
        <div className='border-border border-b bg-card/50'>
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              className='inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-primary'
              href="/glasses/solutions"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a soluciones
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            {solution.icon && (
              <div className="mb-6 inline-block rounded-lg bg-primary/10 p-4 text-primary">
                {(() => {
                  const IconComponent = getIconComponent(solution.icon);
                  return <IconComponent className="h-10 w-10" />;
                })()}
              </div>
            )}

            <h1 className='mb-4 font-bold text-4xl tracking-tight'>{solution.nameEs}</h1>

            {solution.description && <p className="text-lg text-muted-foreground">{solution.description}</p>}
          </div>

          {/* Glass Types Section */}
          {solution.glassTypes.length > 0 ? (
            <div>
              <h2 className='mb-6 font-bold text-2xl'>Tipos de Vidrio Disponibles</h2>

              <div className="grid gap-4 md:grid-cols-2">
                {solution.glassTypes.map((glassType) => (
                  <div className="rounded-lg border border-border bg-card p-6" key={glassType.id}>
                    {/* Glass Type Header */}
                    <div className="mb-4">
                      <h3 className='mb-2 font-semibold text-lg'>{glassType.name}</h3>

                      {glassType.code && (
                        <p className='text-muted-foreground text-sm'>
                          Código: <span className="font-mono font-semibold">{glassType.code}</span>
                        </p>
                      )}
                    </div>

                    {/* Specifications */}
                    <div className='mb-4 space-y-2 border-border border-y py-4'>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Espesor</span>
                        <span className="font-semibold">{glassType.thicknessMm}mm</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio por m²</span>
                        <span className="font-semibold">
                          $
                          {Number(glassType.pricePerSqm).toLocaleString('es-LA', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Performance Rating */}
                    <div className="mb-4">
                      <p className='mb-2 text-muted-foreground text-sm'>Rendimiento</p>
                      <PerformanceRating rating={glassType.performanceRating} />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {glassType.isPrimary && (
                        <span className='inline-block rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs'>
                          Solución Primaria
                        </span>
                      )}

                      {glassType.notes && (
                        <span className='inline-block rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground text-xs'>
                          Notas disponibles
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {glassType.notes && (
                      <div className='mt-4 rounded bg-muted p-3 text-muted-foreground text-sm'>{glassType.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='rounded-lg border border-border border-dashed bg-card/50 p-12 text-center'>
              <p className="text-muted-foreground">No hay tipos de vidrio asignados a esta solución aún.</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Error loading glass solution detail page', {
      error: error instanceof Error ? error.message : 'Unknown error',
      slug,
    });

    notFound();
  }
}
