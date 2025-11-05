/**
 * Vidrios La Equidad - Colombia Preset
 *
 * Cliente: Vidrios La Equidad
 * País: Colombia
 * Región: Valle del Cauca, Quindío y Risaralda
 * Industria: Fabricación e instalación de ventanas, puertas y divisiones en aluminio, vidrio y PVC
 * Mercado: Residencial, comercial e institucional
 *
 * Datos basados en:
 * - Web scraping https://vidrioslaequidad.com/
 * - Mercado colombiano (precios en COP)
 * - 5+ años de experiencia
 * - 500+ clientes satisfechos
 * - 1100+ proyectos completados
 *
 * Arquitectura: Single-Tenant
 * - Cada cliente tiene su propia instancia de Glasify + DB
 * - TenantConfig singleton configurado para Colombia (COP, es-CO, America/Bogota)
 * - Datos completamente independientes de otros clientes
 *
 * Contenido:
 * - 2 proveedores de perfiles: Aluminio Nacional, Deceuninck (PVC)
 * - 10 tipos de vidrio: claro, reflectivos, templado, laminado, DVH, Low-E, esmerilado, acústico, antibalas
 * - 9 modelos de ventanas: corredizos aluminio (3), abatibles aluminio (3), PVC Deceuninck (3)
 * - 6 servicios: instalación, sellado, desmonte, ajuste, protección, visita técnica
 * - 5 soluciones de vidrio: uso general, seguridad, térmico, acústico, decorativo
 *
 * @version 1.0.0
 * @date 2025-01-25
 * @author Andres
 */

import type { SeedPreset } from "../../seeders/seed-orchestrator";
import { vidriosLaEquidadGlassSolutions } from "../vidrios-la-equidad/glass-solutions.data";
import { vidriosLaEquidadGlassTypes } from "../vidrios-la-equidad/glass-types.data";
import { vidriosLaEquidadAluminumCasementModels } from "../vidrios-la-equidad/models-aluminum-casement.data";
import { vidriosLaEquidadAluminumSlidingModels } from "../vidrios-la-equidad/models-aluminum-sliding.data";
import { vidriosLaEquidadPVCModels } from "../vidrios-la-equidad/models-pvc-deceuninck.data";
import { vidriosLaEquidadProfileSuppliers } from "../vidrios-la-equidad/profile-suppliers.data";
import { vidriosLaEquidadServices } from "../vidrios-la-equidad/services.data";

/**
 * Preset completo para Vidrios La Equidad
 *
 * Uso:
 * ```bash
 * pnpm seed --preset=vidrios-la-equidad-colombia
 * ```
 *
 * Nota: Este preset REEMPLAZA completamente los datos del tenant.
 * Ejecutar solo en instancia dedicada de Vidrios La Equidad.
 */
export const vidriosLaEquidadColombiaPreset: SeedPreset = {
  description:
    "Vidrios La Equidad - Fabricante e instalador de ventanas, puertas y divisiones en Valle del Cauca",

  // Soluciones de vidrio (5)
  glassSolutions: vidriosLaEquidadGlassSolutions,

  // Tipos de vidrio (10)
  glassTypes: vidriosLaEquidadGlassTypes,

  // Modelos de ventanas/puertas (9)
  models: [
    ...vidriosLaEquidadAluminumSlidingModels,
    ...vidriosLaEquidadAluminumCasementModels,
    ...vidriosLaEquidadPVCModels,
  ],

  name: "vidrios-la-equidad-colombia",

  // Proveedores de perfiles (2)
  profileSuppliers: vidriosLaEquidadProfileSuppliers,

  // Servicios (6)
  services: vidriosLaEquidadServices,
};
