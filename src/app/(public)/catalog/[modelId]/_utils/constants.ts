import type { ServiceType } from "../_types/model.types";

/**
 * Retorna la etiqueta legible del tipo de servicio
 */
export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    area: "Por área (m²)",
    fixed: "Precio fijo",
    perimeter: "Por perímetro (ml)",
  };
  return labels[type];
}
