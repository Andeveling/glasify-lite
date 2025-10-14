/**
 * Quote Detail Loading State
 *
 * Displays a creative loading animation when navigating from the quotes list
 * to a specific quote detail page. Uses skeleton UI with pulsing animations,
 * shimmer effects, and the Spinner component for visual feedback.
 *
 * Features:
 * - Animated shimmer effect on skeleton elements
 * - Floating spinner with bounce animation
 * - Progressive loading indicators
 * - Smooth transitions matching the actual content layout
 */

import { Spinner } from '@/components/ui/spinner';

export default function QuoteDetailLoading() {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Header with animated spinner and pulse text */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <Spinner className="size-6 text-primary" />
        <p className="animate-pulse text-muted-foreground">Cargando cotización...</p>
      </div>

      {/* Back button skeleton */}
      <div className="mb-6 h-10 w-32 overflow-hidden rounded-md bg-muted">
        <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Quote header skeleton with shimmer */}
      <div className="mb-8 space-y-4 overflow-hidden rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Project name with staggered animation */}
            <div className="relative h-8 w-64 overflow-hidden rounded bg-muted">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            {/* Status badges */}
            <div className="flex gap-2">
              <div className="relative h-6 w-20 overflow-hidden rounded-full bg-muted">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-75" />
              </div>
              <div className="relative h-6 w-24 overflow-hidden rounded-full bg-muted">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-100" />
              </div>
            </div>
          </div>
          {/* Export buttons */}
          <div className="flex gap-2">
            <div className="relative h-10 w-32 overflow-hidden rounded-md bg-muted">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-150" />
            </div>
            <div className="relative h-10 w-32 overflow-hidden rounded-md bg-muted">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-200" />
            </div>
          </div>
        </div>

        {/* Quote details grid with progressive animation */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[ ...Array(4) ].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="relative h-4 w-24 overflow-hidden rounded bg-muted">
                <div
                  className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              </div>
              <div className="relative h-6 w-40 overflow-hidden rounded bg-muted">
                <div
                  className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{ animationDelay: `${i * 50 + 25}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items section skeleton */}
      <div className="space-y-6">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="relative h-7 w-48 overflow-hidden rounded bg-muted">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="relative h-6 w-32 overflow-hidden rounded bg-muted">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-75" />
          </div>
        </div>

        {/* Items grid with staggered card animations */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[ ...Array(6) ].map((_, i) => (
            <div
              key={i}
              className="space-y-4 overflow-hidden rounded-lg border bg-card p-4 opacity-0 animate-in fade-in"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Item image with centered spinner */}
              <div className="relative">
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse">
                    <Spinner className="size-8 text-primary/50" />
                  </div>
                </div>
              </div>

              {/* Item details */}
              <div className="space-y-3">
                <div className="relative h-5 w-full overflow-hidden rounded bg-muted">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-100" />
                </div>
                <div className="relative h-4 w-3/4 overflow-hidden rounded bg-muted">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-150" />
                </div>

                {/* Specs */}
                <div className="space-y-2">
                  {[ ...Array(3) ].map((_, j) => (
                    <div key={j} className="relative h-4 overflow-hidden rounded bg-muted" style={{ width: `${100 - j * 15}%` }}>
                      <div
                        className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{ animationDelay: `${200 + j * 50}ms` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="relative h-4 w-20 overflow-hidden rounded bg-muted">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-300" />
                  </div>
                  <div className="relative h-6 w-24 overflow-hidden rounded bg-muted">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-350" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary skeleton */}
      <div className="mt-8 overflow-hidden rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div className="relative h-6 w-32 overflow-hidden rounded bg-muted">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="space-y-3">
            {[ ...Array(4) ].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="relative h-5 w-32 overflow-hidden rounded bg-muted">
                  <div
                    className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                </div>
                <div className="relative h-5 w-24 overflow-hidden rounded bg-muted">
                  <div
                    className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ animationDelay: `${i * 50 + 25}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="relative h-6 w-24 overflow-hidden rounded bg-muted">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-200" />
            </div>
            <div className="relative h-7 w-32 overflow-hidden rounded bg-muted">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent delay-250" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating spinner with bounce animation and pulse effect */}
      <div className="pointer-events-none fixed right-8 bottom-8 animate-bounce">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 shadow-lg ring-4 ring-primary/20 backdrop-blur-sm animate-in fade-in zoom-in">
          <Spinner className="size-8 text-primary" />
        </div>
      </div>
    </div>
  );
}

