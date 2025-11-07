"use client";

import { Building2, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Model } from "../_types/model.types";
import { MATERIAL_BENEFITS } from "../_utils/material-benefits";

type ProfileSupplierCardProps = {
  model: Model;
};

/**
 * Displays profile supplier information with material type and benefits
 * Handles NULL supplier gracefully by showing "Proveedor no especificado"
 *
 * User Story 2: Understand Profile Supplier Details (Priority P1)
 * User Story 5: Compare Material Types (Priority P3)
 * - Emphasizes material-specific advantages for easy comparison
 * - PVC focus: Thermal insulation and low maintenance
 * - Aluminum focus: Structural strength and large dimensions
 */
export function ProfileSupplierCard({ model }: ProfileSupplierCardProps) {
  const { profileSupplier } = model;

  // Handle NULL supplier case
  if (!profileSupplier) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-5 w-5" />
          <h3 className="font-semibold">Proveedor de Perfiles</h3>
        </div>
        <p className="mt-3 text-muted-foreground text-sm">
          Proveedor no especificado
        </p>
      </Card>
    );
  }

  const { name, materialType } = profileSupplier;
  const benefits = MATERIAL_BENEFITS[materialType];

  // Map materialType enum to Spanish display text
  const materialTypeLabels: Record<string, string> = {
    ALUMINUM: "Aluminio",
    MIXED: "Mixto",
    PVC: "PVC",
    WOOD: "Madera",
  };

  // Material-specific emphasis for comparison
  const materialEmphasis: Record<string, string> = {
    ALUMINUM: "Máxima resistencia y capacidad estructural",
    MIXED: "Versatilidad y balance de propiedades",
    PVC: "Aislamiento térmico y acústico excepcional",
    WOOD: "Calidez natural y sustentabilidad",
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Proveedor de Perfiles</h3>
      </div>

      <div className="space-y-4">
        {/* Supplier Name */}
        <div>
          <h4 className="font-medium text-lg">{name}</h4>
        </div>

        {/* Material Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Material:</span>
          <Badge variant="secondary">
            {materialTypeLabels[materialType] || materialType}
          </Badge>
        </div>

        {/* Material Emphasis (User Story 5: Comparison) */}
        <div className="rounded-md bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="font-medium text-primary text-sm">
              {materialEmphasis[materialType]}
            </p>
          </div>
        </div>

        {/* Material-Specific Benefits */}
        <div className="border-t pt-3">
          <h5 className="mb-2 font-medium text-sm">Ventajas del Material</h5>
          <ul className="space-y-1.5">
            {benefits.map((benefit) => (
              <li
                className="flex items-start gap-2 text-muted-foreground text-sm"
                key={benefit}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
