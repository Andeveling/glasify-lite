/**
 * Colors Content Component
 *
 * Client wrapper for Colors page that manages dialog state.
 * Separates server data fetching (page.tsx) from client interactivity.
 *
 * Responsibilities:
 * - Manage create dialog state
 * - Pass create handler to filters
 * - Render filters and list
 */

"use client";

import { useState } from "react";
import { ColorsFilters } from "./colors-filters";
import { ColorsList } from "./colors-list";

type ColorsContentProps = {
	initialData: Parameters<typeof ColorsList>[0]["initialData"];
	searchParams: Parameters<typeof ColorsList>[0]["searchParams"];
};

export function ColorsContent({
	initialData,
	searchParams,
}: ColorsContentProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const handleCreateClick = () => {
		setCreateDialogOpen(true);
	};

	// If create dialog is open, navigate to create page instead
	if (createDialogOpen) {
		window.location.href = "/admin/colors/new";
		return null;
	}

	return (
		<>
			{/* Filters with create button */}
			<ColorsFilters
				onCreateClickAction={handleCreateClick}
				searchParams={searchParams}
			/>

			{/* Colors List */}
			<ColorsList initialData={initialData} searchParams={searchParams} />
		</>
	);
}
