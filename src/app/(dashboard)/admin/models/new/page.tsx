/**
 * Create Model Page (US9 - T087)
 *
 * Server Component that renders the form for creating a new model
 *
 * Route: /admin/models/new
 */

import type { Metadata } from "next";
import { ModelForm } from "../_components/model-form";

export const metadata: Metadata = {
  title: "Crear Modelo | Admin",
};

export default function NewModelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Crear Modelo</h1>
        <p className="text-muted-foreground">
          Crea un nuevo modelo de ventana o puerta
        </p>
      </div>

      <ModelForm mode="create" />
    </div>
  );
}
