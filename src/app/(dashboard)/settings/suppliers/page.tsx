import type { Metadata } from "next";
import { api } from "@/trpc/server-client";
import { SettingsSuppliersContent } from "./_components/settings-suppliers-content";

export const metadata: Metadata = {
	description:
		"Administra los fabricantes de perfiles (PVC, Aluminio, Madera, etc.)",
	title: "Proveedores de Perfiles | Glasify",
};

/**
 * Profile Supplier Management Page
 *
 * Server Component that fetches initial data and renders the client component.
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md (TASK-037)
 */
export default async function ProfileSuppliersPage() {
	const initialData = await api.admin["profile-supplier"].list({
		isActive: "all",
		limit: 100,
		page: 1,
		sortBy: "name",
		sortOrder: "asc",
	});

	return <SettingsSuppliersContent initialData={initialData} />;
}
