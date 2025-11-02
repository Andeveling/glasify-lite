/**
 * QuoteStatusBadge Component
 *
 * Atom component that displays quote status with appropriate styling,
 * icons, and color variants. Used throughout the quote UI for consistent
 * status representation.
 *
 * @module app/(dashboard)/quotes/_components/quote-status-badge
 */

import type { QuoteStatus } from "@prisma/client";
import { FileText, Send, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type QuoteStatusBadgeProps = {
	status: QuoteStatus;
};

/**
 * Configuration for each quote status
 * Defines visual appearance and user-facing text
 */
const statusConfig = {
	canceled: {
		icon: XCircle,
		label: "Cancelada",
		variant: "destructive" as const,
	},
	draft: {
		icon: FileText,
		label: "Borrador",
		variant: "secondary" as const,
	},
	sent: {
		icon: Send,
		label: "Enviada",
		variant: "default" as const,
	},
} satisfies Record<
	QuoteStatus,
	{
		variant: "default" | "secondary" | "destructive" | "outline";
		label: string;
		icon: React.ComponentType<{ className?: string }>;
	}
>;

/**
 * QuoteStatusBadge - Visual indicator for quote status
 *
 * Displays quote status with appropriate color, icon, and label.
 * Follows shadcn/ui Badge component patterns with custom styling.
 *
 * @example
 * ```tsx
 * <QuoteStatusBadge status="draft" />
 * <QuoteStatusBadge status="sent" />
 * <QuoteStatusBadge status="canceled" />
 * ```
 */
export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<Badge className="gap-1.5" variant={config.variant}>
			<Icon className="h-3 w-3" />
			{config.label}
		</Badge>
	);
}
