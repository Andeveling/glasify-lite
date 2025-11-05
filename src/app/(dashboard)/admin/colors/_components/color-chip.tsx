"use client";

import { cn } from "@/lib/utils";

type ColorChipProps = {
  hexCode: string;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * ColorChip - Reusable color preview component
 *
 * Displays a colored square with border and optional selected state
 * Used across admin and client UI for color visualization
 */
export function ColorChip({
  hexCode,
  size = "md",
  selected = false,
  className,
}: ColorChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2",
        sizeClasses[size],
        selected && "border-primary ring-2 ring-primary ring-offset-2",
        !selected && "border-border",
        className
      )}
      role="img"
      style={{ backgroundColor: hexCode }}
      title={hexCode}
    />
  );
}
