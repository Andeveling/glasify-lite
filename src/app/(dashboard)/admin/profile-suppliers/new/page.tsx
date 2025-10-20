import type { Metadata } from 'next';

import { ProfileSupplierForm } from '../_components/profile-supplier-form';

export const metadata: Metadata = {
  description: 'Crear nuevo proveedor de perfiles para ventanas y puertas',
  title: 'Nuevo Proveedor de Perfiles | Glasify',
};

/**
 * New Profile Supplier Page
 *
 * Server Component wrapper for creating a new ProfileSupplier.
 *
 * @see /specs/011-admin-catalog-management/ (User Story 4, Task T028)
 */
export default function NewProfileSupplierPage() {
  return (
    <div className="container mx-auto py-8">
      <ProfileSupplierForm mode="create" />
    </div>
  );
}
