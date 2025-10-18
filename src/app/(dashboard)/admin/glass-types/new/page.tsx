/**
 * New Glass Type Page (US8 - T072)
 *
 * Server Component wrapper for glass type creation form
 *
 * Route: /admin/glass-types/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { GlassTypeForm } from '../_components/glass-type-form';

export const metadata: Metadata = {
  description: 'Crear un nuevo tipo de vidrio con sus soluciones y características',
  title: 'Nuevo Tipo de Vidrio | Admin',
};

export default function NewGlassTypePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Nuevo Tipo de Vidrio</h1>
        <p className="text-muted-foreground">Crea un nuevo tipo de vidrio con sus soluciones y características</p>
      </div>

      <GlassTypeForm mode="create" />
    </div>
  );
}
