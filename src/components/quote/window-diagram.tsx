/**
 * WindowDiagram Component
 * 
 * Renders SVG window diagrams by type with fallback support.
 * Server Component optimized for performance and accessibility.
 * 
 * @module WindowDiagram
 */

import type { WindowType } from '@/types/window.types';
import { getWindowDiagram } from '@/lib/utils/window-diagram-map';
import { cn } from '@/lib/utils';

export interface WindowDiagramProps {
  /** Window type to render */
  type: WindowType | string;
  
  /** Size variant for the diagram */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Override alt text for accessibility */
  alt?: string;
  
  /** Whether to show a border around the diagram */
  showBorder?: boolean;
  
  /** Background color */
  background?: 'transparent' | 'white' | 'gray';
}

/**
 * Size dimensions mapping
 */
const SIZE_CLASSES = {
  sm: 'w-12 h-12',   // 48px - compact view
  md: 'w-20 h-20',   // 80px - list items
  lg: 'w-32 h-32',   // 128px - detail view
  xl: 'w-48 h-48',   // 192px - full view
} as const;

/**
 * Background color classes
 */
const BACKGROUND_CLASSES = {
  transparent: 'bg-transparent',
  white: 'bg-white',
  gray: 'bg-gray-50',
} as const;

/**
 * WindowDiagram Component
 * 
 * Displays an SVG diagram representing a window type.
 * Falls back to default diagram for unknown types.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <WindowDiagram type="sliding-2-panel" size="md" />
 * 
 * // With custom styling
 * <WindowDiagram 
 *   type="french-4-panel" 
 *   size="lg"
 *   showBorder
 *   background="gray"
 *   className="shadow-md"
 * />
 * ```
 */
export function WindowDiagram({
  type,
  size = 'md',
  className,
  alt,
  showBorder = false,
  background = 'transparent',
}: WindowDiagramProps) {
  const diagram = getWindowDiagram(type);
  
  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        SIZE_CLASSES[size],
        BACKGROUND_CLASSES[background],
        showBorder && 'rounded-md border border-gray-200',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={diagram.svgPath}
        alt={alt ?? diagram.altText}
        className="h-full w-full object-contain p-1"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/**
 * WindowDiagramSkeleton Component
 * 
 * Loading skeleton for WindowDiagram.
 * Use with React Suspense boundaries.
 */
export function WindowDiagramSkeleton({
  size = 'md',
  className,
}: Pick<WindowDiagramProps, 'size' | 'className'>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        SIZE_CLASSES[size],
        className
      )}
      aria-label="Cargando diagrama..."
    />
  );
}
