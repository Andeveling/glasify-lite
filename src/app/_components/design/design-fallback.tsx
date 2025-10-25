'use client';

/**
 * DesignFallback Component
 *
 * Displays a placeholder UI when a model has no design assigned.
 * Used in catalog cards and model preview contexts.
 *
 * Design Principles:
 * - Minimalist placeholder to indicate missing design
 * - Visual consistency with design renderings
 * - Accessible with proper ARIA labels
 */

import { Package } from 'lucide-react';

interface DesignFallbackProps {
  /** Display width in pixels */
  width: number;
  /** Display height in pixels */
  height: number;
  /** Optional message override (Spanish by default) */
  message?: string;
  /** Optional CSS class name for styling */
  className?: string;
}

export function DesignFallback({
  width,
  height,
  message = 'Diseño no disponible',
  className = '',
}: DesignFallbackProps) {
  return (
    <div
      aria-label="Diseño no disponible"
      className={`flex flex-col items-center justify-center bg-muted/30 text-muted-foreground ${className}`}
      role="img"
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      <Package aria-hidden="true" className="mb-2 h-12 w-12 opacity-40" />
      <p className="text-sm opacity-60">{message}</p>
    </div>
  );
}
