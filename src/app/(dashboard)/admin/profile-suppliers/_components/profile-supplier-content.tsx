/**
 * Profile Suppliers Content Component
 *
 * Client wrapper for Profile Suppliers page that manages dialog state.
 * Separates server data fetching (page.tsx) from client interactivity.
 *
 * Responsibilities:
 * - Manage create/edit dialog state
 * - Pass handlers to filters and list
 * - Render filters and list
 */

'use client';

import type { ProfileSupplier } from '@prisma/client';
import { useState } from 'react';
import { ProfileSupplierDialog } from './profile-supplier-dialog';
import { ProfileSupplierFilters } from './profile-supplier-filters';
import { ProfileSupplierList } from './profile-supplier-list';

type ProfileSupplierContentProps = {
  initialData: Parameters<typeof ProfileSupplierList>[0]['initialData'];
  searchParams: Parameters<typeof ProfileSupplierList>[0]['searchParams'];
};

export function ProfileSupplierContent({ initialData, searchParams }: ProfileSupplierContentProps) {
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedSupplier, setSelectedSupplier] = useState<ProfileSupplier | undefined>(undefined);

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedSupplier(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (supplier: ProfileSupplier) => {
    setDialogMode('edit');
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  return (
    <>
      {/* Create/Edit Dialog */}
      <ProfileSupplierDialog
        defaultValues={selectedSupplier}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />

      {/* Filters with create button */}
      <ProfileSupplierFilters onCreateClick={handleCreateClick} searchParams={searchParams} />

      {/* Profile Suppliers List */}
      <ProfileSupplierList initialData={initialData} onEditClick={handleEditClick} searchParams={searchParams} />
    </>
  );
}
