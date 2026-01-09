/**
 * Vitro Rojas - Colors
 *
 * Colores estándar para perfiles de aluminio Extralum en Panamá
 * Basado en catálogo de acabados de aluminio para ventanas y puertas
 *
 * Incluye:
 * - Natural (anodizado natural/plata) - Color más común y económico
 * - Blanco (RAL 9010) - Popular para proyectos residenciales modernos
 * - Gris (RAL 7016 Antracita) - Tendencia en diseño contemporáneo
 * - Negro (RAL 9005 Mate) - Premium, líneas minimalistas
 * - Bronce (acabado anodizado) - Clásico para edificios comerciales
 * - Madera (laminado símil madera) - Imitación de madera para interiores
 *
 * @version 1.0.0
 * @date 2025-11-24
 */

import type { Prisma } from "@prisma/client";

/**
 * Colores estándar Vitro Rojas
 * Compatible con perfiles Extralum (aluminio)
 */
export const vitroRojasColors: Prisma.ColorCreateInput[] = [
  {
    hexCode: "#C0C0C0",
    isActive: true,
    name: "Natural",
    ralCode: "RAL 9006",
  },
  {
    hexCode: "#F3F3E9",
    isActive: true,
    name: "Blanco",
    ralCode: "RAL 9010",
  },
  {
    hexCode: "#384043",
    isActive: true,
    name: "Gris",
    ralCode: "RAL 7016",
  },
  {
    hexCode: "#101010",
    isActive: true,
    name: "Negro",
    ralCode: "RAL 9005",
  },
  {
    hexCode: "#8C6239",
    isActive: true,
    name: "Bronce",
    ralCode: null, // Acabado anodizado, no tiene RAL estándar
  },
  {
    hexCode: "#8B4513",
    isActive: true,
    name: "Madera",
    ralCode: null, // Laminado, no tiene RAL estándar
  },
];
