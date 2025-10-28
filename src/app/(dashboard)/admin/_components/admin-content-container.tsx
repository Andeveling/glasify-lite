import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminContentContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * Maximum width of the content area
   * @default '7xl' (80rem / 1280px)
   */
  maxWidth?: "full" | "7xl" | "6xl" | "5xl" | "4xl";
};

/**
 * Standardized Content Container for Admin Pages
 *
 * Provides consistent padding, max-width constraints, and responsive spacing
 * for all admin content areas. Ensures uniform layout across all admin pages.
 *
 * @example
 * ```tsx
 * <AdminContentContainer>
 *   <h1>Admin Page Title</h1>
 *   <DataTable />
 * </AdminContentContainer>
 * ```
 */
export const AdminContentContainer: FC<AdminContentContainerProps> = ({
  children,
  className,
  maxWidth = "7xl",
}) => {
  const maxWidthClasses = {
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 px-4 py-6",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};
