import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * BackLink - Atomic Component
 *
 * Standardized back navigation component used across the application.
 * Provides consistent styling and behavior for "Volver a..." links.
 *
 * @example
 * // Simple back link
 * <BackLink href="/catalog">Volver al Catálogo</BackLink>
 *
 * @example
 * // With chevron icon
 * <BackLink href="/my-quotes" icon="chevron">Volver a mis cotizaciones</BackLink>
 *
 * @example
 * // Outline variant
 * <BackLink href="/quotes" variant="outline">Volver a cotizaciones</BackLink>
 */

const backLinkVariants = cva("inline-flex items-center gap-2", {
	defaultVariants: {
		icon: "arrow",
		variant: "ghost",
	},
	variants: {
		icon: {
			arrow: "",
			chevron: "",
			none: "",
		},
		variant: {
			ghost: "",
			link: "",
			outline: "",
		},
	},
});

export type BackLinkProps = {
	/** Target URL for navigation */
	href: string;
	/** Link text content */
	children: React.ReactNode;
	/** Icon variant to display */
	icon?: "arrow" | "chevron" | "none";
	/** Button variant style */
	variant?: "ghost" | "outline" | "link";
	/** Button size */
	size?: VariantProps<typeof buttonVariants>["size"];
	/** Additional CSS classes */
	className?: string;
};

export function BackLink({
	children,
	className,
	href,
	icon = "arrow",
	size = "sm",
	variant = "ghost",
}: BackLinkProps) {
	const IconComponent =
		icon === "chevron" ? ChevronLeft : icon === "arrow" ? ArrowLeft : null;

	return (
		<Button
			asChild
			className={cn(backLinkVariants({ variant }), className)}
			size={size}
			variant={variant}
		>
			<Link href={href}>
				{IconComponent && <IconComponent className="h-4 w-4" />}
				{children}
			</Link>
		</Button>
	);
}
