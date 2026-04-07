/**
 * Admin Quote Creation Page
 *
 * Admin page for creating quotes directly from catalog items.
 * Provides a form for selecting models, glass types, dimensions, and quantities.
 *
 * Route: /admin/quotes/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { AdminQuoteCreationForm } from "./_components/admin-quote-creation-form";

export const metadata: Metadata = {
  title: "Nueva Cotización | Admin",
  description: "Crear una nueva cotización directamente desde el catálogo",
};

export default function NewQuotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Nueva Cotización</h1>
        <p className="text-muted-foreground">
          Crea una cotización directamente desde el catálogo de productos
        </p>
      </div>

      <AdminQuoteCreationForm />
    </div>
  );
}
