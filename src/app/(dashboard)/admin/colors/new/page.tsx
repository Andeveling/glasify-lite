/**
 * New Color Page
 *
 * Server Component - Create new color in catalog
 *
 * Route: /admin/colors/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { ColorForm } from "../_components/color-form";

export const metadata: Metadata = {
  description: "Crear un nuevo color para el catálogo de modelos",
  title: "Nuevo Color | Admin",
};

export default function NewColorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Crear Nuevo Color</h1>
        <p className="text-muted-foreground">
          Agrega un nuevo color al catálogo para asignar a modelos de ventanas
        </p>
      </div>

      {/* Color Form */}
      <ColorForm mode="create" />
    </div>
  );
}
