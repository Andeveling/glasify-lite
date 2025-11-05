/**
 * Services Content Component
 *
 * Client wrapper for Services page that manages dialog state.
 * Separates server data fetching (page.tsx) from client interactivity.
 *
 * Responsibilities:
 * - Manage create dialog state
 * - Pass create handler to filters
 * - Render filters and list
 */

"use client";

import { useState } from "react";
import { ServiceDialog } from "./service-dialog";
import { ServicesFilters } from "./services-filters";
import { ServicesList } from "./services-list";

type ServicesContentProps = {
  initialData: Parameters<typeof ServicesList>[0]["initialData"];
  searchParams: Parameters<typeof ServicesList>[0]["searchParams"];
};

export function ServicesContent({
  initialData,
  searchParams,
}: ServicesContentProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  return (
    <>
      {/* Create Dialog */}
      <ServiceDialog
        mode="create"
        onOpenChangeAction={setCreateDialogOpen}
        open={createDialogOpen}
      />

      {/* Filters with create button */}
      <ServicesFilters
        onCreateClick={handleCreateClick}
        searchParams={searchParams}
      />

      {/* Services List */}
      <ServicesList initialData={initialData} searchParams={searchParams} />
    </>
  );
}
