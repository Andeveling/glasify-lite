"use client";

import { Award, Layers, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Model } from "../_types/model.types";
import {
  formatPerformanceRating,
  MATERIAL_PERFORMANCE,
} from "../_utils/material-benefits";

type ModelSpecificationsProps = {
  model: Model;
};

/**
 * Displays technical specifications including material type,
 * performance ratings, and dimensional constraints
 */
export function ModelSpecifications({ model }: ModelSpecificationsProps) {
  const { profileSupplier, dimensions } = model;

  // If no supplier, cannot display material-based specs
  if (!profileSupplier) {
    return null;
  }

  const { materialType } = profileSupplier;
  const performance = MATERIAL_PERFORMANCE[materialType];

  // Format performance ratings to stars + labels
  const thermalRating = formatPerformanceRating(performance.thermal);
  const acousticRating = formatPerformanceRating(performance.acoustic);
  const structuralRating = formatPerformanceRating(performance.structural);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Especificaciones Técnicas</h3>
      </div>

      <div className="space-y-4">
        {/* Material Type Badge */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Material:</span>
          <Badge variant="secondary">{materialType}</Badge>
        </div>

        {/* Performance Ratings */}
        <div className="space-y-2.5">
          <PerformanceRating
            label="Aislamiento Térmico"
            rating={thermalRating.label}
            stars={thermalRating.stars}
          />
          <PerformanceRating
            label="Aislamiento Acústico"
            rating={acousticRating.label}
            stars={acousticRating.stars}
          />
          <PerformanceRating
            label="Resistencia Estructural"
            rating={structuralRating.label}
            stars={structuralRating.stars}
          />
        </div>

        {/* Dimensional Constraints */}
        <div className="border-t pt-3">
          <div className="mb-2 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              Capacidades Dimensionales
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Ancho</dt>
              <dd className="font-medium">
                {dimensions.minWidth} - {dimensions.maxWidth} mm
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Alto</dt>
              <dd className="font-medium">
                {dimensions.minHeight} - {dimensions.maxHeight} mm
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}

/**
 * Performance rating display with stars and label
 * Following "Don't Make Me Think" - visual + text for clarity
 */
function PerformanceRating({
  label,
  stars,
  rating,
}: {
  label: string;
  stars: number;
  rating: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div
          aria-label={`${stars} de 5 estrellas`}
          className="flex gap-0.5"
          role="img"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              aria-hidden="true"
              className={
                i < stars ? "text-yellow-500" : "text-muted-foreground/30"
              }
              // biome-ignore lint/suspicious/noArrayIndexKey: Rating stars are static presentational elements that never reorder, making array index as key safe.
              key={i}
            >
              ★
            </span>
          ))}
        </div>
        <span className="min-w-20 text-right text-xs">{rating}</span>
      </div>
    </div>
  );
}
