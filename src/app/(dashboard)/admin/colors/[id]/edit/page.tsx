/**
 * Edit Color Page
 *
 * Server Component - Edit existing color in catalog
 *
 * Route: /admin/colors/[id]/edit
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server-client";
import { ColorForm } from "../../_components/color-form";

export const metadata: Metadata = {
  description: "Editar color del catálogo",
  title: "Editar Color | Admin",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditColorPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch color data server-side
  let color: Awaited<ReturnType<typeof api.admin.colors.getById>>;
  try {
    color = await api.admin.colors.getById({ id });
  } catch {
    // Color not found - show 404
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Color</h1>
        <p className="text-muted-foreground">
          Modifica los datos del color "{color.name}"
        </p>
      </div>

      {/* Color Form */}
      <ColorForm
        defaultValues={{
          id: color.id,
          name: color.name,
          ralCode: color.ralCode,
          hexCode: color.hexCode,
          isActive: color.isActive,
        }}
        mode="edit"
      />
    </div>
  );
}
