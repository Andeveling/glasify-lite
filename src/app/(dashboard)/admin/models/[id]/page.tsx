/**
 * Edit Model Page (US9 - T088)
 *
 * Server Component that fetches model data and renders the edit form
 * Includes cost breakdown and price history
 *
 * Route: /admin/models/[id]
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { ModelForm } from '../_components/model-form';

type EditModelPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Editar Modelo | Admin',
};

export default async function EditModelPage({ params }: EditModelPageProps) {
  const { id } = await params;

  // Fetch model with all relations (cost breakdown, price history)
  const model = await api.admin.model[ 'get-by-id' ]({ id });

  if (!model) {
    notFound();
  }

  // Transform Decimal fields to numbers for form
  const defaultValues = {
    accessoryPrice: model.accessoryPrice?.toNumber() ?? null,
    basePrice: model.basePrice.toNumber(),
    compatibleGlassTypeIds: model.compatibleGlassTypeIds,
    costNotes: model.costNotes,
    costPerMmHeight: model.costPerMmHeight.toNumber(),
    costPerMmWidth: model.costPerMmWidth.toNumber(),
    glassDiscountHeightMm: model.glassDiscountHeightMm,
    glassDiscountWidthMm: model.glassDiscountWidthMm,
    id: model.id,
    lastCostReviewDate: model.lastCostReviewDate,
    maxHeightMm: model.maxHeightMm,
    maxWidthMm: model.maxWidthMm,
    minHeightMm: model.minHeightMm,
    minWidthMm: model.minWidthMm,
    name: model.name,
    profileSupplierId: model.profileSupplierId,
    profitMarginPercentage: model.profitMarginPercentage?.toNumber() ?? null,
    status: model.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Modelo</h1>
        <p className="text-muted-foreground">
          Edita el modelo <span className="font-medium">{model.name}</span>
        </p>
      </div>

      <ModelForm initialData={defaultValues} mode="edit" modelId={model.id} />

      {/* Price History Section */}
      {model.priceHistory && model.priceHistory.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Historial de Precios</h2>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-sm">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Precio Base</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Costo/mm Ancho</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Costo/mm Alto</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Razón</th>
                </tr>
              </thead>
              <tbody>
                {model.priceHistory.map((history) => (
                  <tr className="border-b last:border-0" key={history.id}>
                    <td className="px-4 py-3 text-sm">
                      {new Date(history.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">${history.basePrice.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-sm">${history.costPerMmWidth.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-sm">${history.costPerMmHeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{history.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cost Breakdown Section */}
      {model.costBreakdown && model.costBreakdown.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">Componentes de Costo</h2>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-sm">Componente</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Tipo de Costo</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Costo Unitario</th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Notas</th>
                </tr>
              </thead>
              <tbody>
                {model.costBreakdown.map((item) => (
                  <tr className="border-b last:border-0" key={item.id}>
                    <td className="px-4 py-3 font-medium text-sm">{item.component}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.costType === 'fixed' && 'Fijo'}
                      {item.costType === 'per_mm_width' && 'Por mm ancho'}
                      {item.costType === 'per_mm_height' && 'Por mm alto'}
                      {item.costType === 'per_sqm' && 'Por m²'}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">${item.unitCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
