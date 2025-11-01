/**
 * Model Colors Management Page
 *
 * Admin page for configuring colors assigned to a specific model
 * - SSR with force-dynamic for fresh data
 * - Lists all assigned colors with usage statistics
 * - Add new color assignments
 * - Edit surcharges inline
 * - Set default color
 * - Remove color assignments
 *
 * Route: /admin/models/[id]/colors
 * Access: Admin only (adminProcedure)
 */

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safeDecimalToNumber } from "@/lib/prisma-utils";
import { api } from "@/trpc/server-client";
import { AddColorDialog } from "./_components/add-color-dialog";
import { ModelColorsList } from "./_components/model-colors-list";

// Force SSR - no caching for admin dashboard
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const model = await api.admin.model["get-by-id"]({ id });
    return {
      title: `Colores - ${model.name} | Glasify Admin`,
      description: `Configuración de colores para el modelo ${model.name}`,
    };
  } catch {
    return {
      title: "Colores del Modelo | Glasify Admin",
      description: "Configuración de colores para modelo",
    };
  }
}

export default async function ModelColorsPage({ params }: PageProps) {
  const { id: modelId } = await params;

  try {
    // Fetch model details
    const model = await api.admin.model["get-by-id"]({ id: modelId });

    // Fetch assigned colors
    const modelColorsRaw = await api.admin["model-colors"].listByModel({
      modelId,
    });

    // Serialize Decimal fields for Client Component
    const modelColors = modelColorsRaw.map((mc) => ({
      ...mc,
      surchargePercentage: safeDecimalToNumber(mc.surchargePercentage),
    }));

    // Fetch available colors for assignment
    const availableColors = await api.admin["model-colors"].getAvailableColors({
      modelId,
    });

    return (
      <div className="container mx-auto space-y-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/admin/models">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Modelos
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="font-bold text-3xl tracking-tight">
            Colores del Modelo
          </h1>
          <p className="text-muted-foreground">
            Modelo: <span className="font-semibold">{model.name}</span>
          </p>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>
              Estado actual de la configuración de colores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Colores asignados:</span>
              <span className="font-semibold">{modelColors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Colores disponibles para asignar:
              </span>
              <span className="font-semibold">{availableColors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Color por defecto:</span>
              <span className="font-semibold">
                {modelColors.find(
                  (mc: { isDefault: boolean; color: { name: string } }) =>
                    mc.isDefault
                )?.color.name || "Ninguno"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Colors Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>Colores Configurados</CardTitle>
              <CardDescription>
                Gestiona los colores disponibles para este modelo con sus
                respectivos recargos
              </CardDescription>
            </div>
            <AddColorDialog
              availableColors={availableColors}
              modelId={modelId}
              triggerLabel="+ Agregar Color"
            />
          </CardHeader>
          <CardContent>
            <ModelColorsList initialColors={modelColors} modelId={modelId} />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="text-base">
              💡 Información sobre Colores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground text-sm">
            <ul className="list-inside list-disc space-y-1">
              <li>
                El <strong>recargo porcentual</strong> se aplica únicamente al
                precio base del modelo
              </li>
              <li>
                El <strong>color por defecto</strong> se selecciona
                automáticamente en nuevas cotizaciones
              </li>
              <li>
                Solo puede haber <strong>un color por defecto</strong> por
                modelo
              </li>
              <li>
                Los cambios de recargo se guardan automáticamente después de
                500ms
              </li>
              <li>Los colores inactivos no aparecen en el catálogo público</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    // Error is already logged by the tRPC procedure
    // Simply return 404 for end user
    notFound();
  }
}
