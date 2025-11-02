/**
 * WindowDiagram Component
 *
 * Renders SVG window diagrams by type with fallback support.
 * Server Component optimized for performance and accessibility.
 *
 * @module WindowDiagram
 */

import { cn } from "@/lib/utils";
import { getWindowDiagram } from "@/lib/utils/window-diagram-map";
import type { WindowType } from "@/types/window.types";

export type WindowDiagramProps = {
	/** Window type to render */
	type: WindowType | string;

	/** Size variant for the diagram */
	size?: "sm" | "md" | "lg" | "xl";

	/** Additional CSS classes */
	className?: string;

	/** Override alt text for accessibility */
	alt?: string;

	/** Whether to show a border around the diagram */
	showBorder?: boolean;

	/** Background color */
	background?: "transparent" | "white" | "gray";
};

/**
 * Size dimensions mapping
 */
const SIZE_CLASSES = {
	lg: "w-32 h-32", // 128px - detail view
	md: "w-20 h-20", // 80px - list items
	sm: "w-12 h-12", // 48px - compact view
	xl: "w-48 h-48", // 192px - full view
} as const;

/**
 * Get pixel dimensions for a size variant
 */
function getSizeDimensions(size: "sm" | "md" | "lg" | "xl"): {
	width: number;
	height: number;
} {
	switch (size) {
		case "sm":
			return { height: 48, width: 48 };
		case "md":
			return { height: 80, width: 80 };
		case "lg":
			return { height: 128, width: 128 };
		case "xl":
			return { height: 192, width: 192 };
		default:
			return { height: 80, width: 80 };
	}
}

/**
 * Background color classes
 */
const BACKGROUND_CLASSES = {
	gray: "bg-gray-50",
	transparent: "bg-transparent",
	white: "bg-white",
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
	size = "md",
	className,
	alt,
	showBorder = false,
	background = "transparent",
}: WindowDiagramProps) {
	const diagram = getWindowDiagram(type);

	return (
		<div
			className={cn(
				"relative flex items-center justify-center",
				SIZE_CLASSES[size],
				BACKGROUND_CLASSES[background],
				showBorder && "rounded-md border border-gray-200",
				className,
			)}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				alt={alt ?? diagram.altText}
				className="h-full w-full object-contain p-1"
				decoding="async"
				loading="lazy"
				src={diagram.svgPath}
				{...getSizeDimensions(size)}
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
	size = "md",
	className,
}: Pick<WindowDiagramProps, "size" | "className">) {
	return (
		<output
			aria-busy="true"
			className={cn(
				"animate-pulse rounded-md bg-gray-200",
				SIZE_CLASSES[size],
				className,
			)}
		>
			<span className="sr-only">Cargando diagrama...</span>
		</output>
	);
}
