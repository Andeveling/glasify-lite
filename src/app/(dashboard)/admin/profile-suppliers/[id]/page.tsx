import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { ProfileSupplierForm } from '../_components/profile-supplier-form';

type EditProfileSupplierPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditProfileSupplierPageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = await api.admin['profile-supplier'].getById({ id });

  return {
    description: `Editar proveedor de perfiles: ${supplier?.name ?? 'No encontrado'}`,
    title: `Editar ${supplier?.name ?? 'Proveedor'} | Glasify`,
  };
}

/**
 * Edit Profile Supplier Page
 *
 * Server Component that fetches ProfileSupplier data and renders the edit form.
 *
 * @see /specs/011-admin-catalog-management/ (User Story 4, Task T029)
 */
export default async function EditProfileSupplierPage({ params }: EditProfileSupplierPageProps) {
  const { id } = await params;
  const supplier = await api.admin['profile-supplier'].getById({ id });

  if (!supplier) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <ProfileSupplierForm defaultValues={supplier} mode="edit" />
    </div>
  );
}
