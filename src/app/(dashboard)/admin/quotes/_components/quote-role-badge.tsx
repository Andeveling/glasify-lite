/**
 * Quote Role Badge Component (US4 - T023)
 *
 * Displays role badge for quote creator
 * Only shows for admin/seller roles (not user)
 *
 * Features:
 * - Spanish labels (Admin, Vendedor)
 * - Different variant for each role
 * - Returns null for user role
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { ROLE_BADGE_CONFIG } from "../_constants/quote-status.constants";

type QuoteRoleBadgeProps = {
	role: "admin" | "seller" | "user";
};

export function QuoteRoleBadge({ role }: QuoteRoleBadgeProps) {
	const config = ROLE_BADGE_CONFIG[role];

	// Don't show badge for regular users
	if (!config) {
		return null;
	}

	return (
		<Badge className="ml-2" variant={config.variant}>
			{config.label}
		</Badge>
	);
}
