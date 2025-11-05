/**
 * Vitro Rojas S.A. - Panama Preset
 *
 * Cliente: Vitro Rojas S.A.
 * País: Panamá
 * Industria: Fabricación de ventanas y puertas de aluminio
 * Mercado: Residencial y comercial
 *
 * Datos basados en:
 * - Sistema de cotización Vitro Rojas (precios por m² + adicionales por vidrio)
 * - Especificaciones técnicas Extralum Panamá (VC Panamá, Europa Clásica, Europa Abatible)
 * - Mercado panameño (tipos de vidrio, proveedores locales)
 *
 * Arquitectura: Single-Tenant
 * - Cada cliente (Vitro Rojas) tiene su propia instancia de Glasify + DB
 * - TenantConfig singleton configurado para Panamá (USD, es-PA, America/Panama)
 * - Datos completamente independientes de otros clientes
 *
 * Contenido:
 * - 1 proveedor de perfiles: Extralum (aluminio)
 * - 2 proveedores de vidrio: locales de Panamá
 * - 11 tipos de vidrio: general (2), security (3), insulation (2), decorative (4)
 * - 9 modelos de ventanas: corredizos (6), abatibles (3)
 * - 5 servicios: instalación, sellado, desmonte, reposición, protección
 * - 4 soluciones de vidrio: uso general, seguridad, térmico, decorativo
 *
 * @version 1.0.0
 * @date 2025-01-21
 * @author Andres
 */

import type { SeedPreset } from "../../seeders/seed-orchestrator";
import { vitroRojasGlassSolutions } from "../vitro-rojas/glass-solutions.data";
import { vitroRojasGlassTypeSolutionMappings } from "../vitro-rojas/glass-type-solution-mappings.data";
import { vitroRojasGlassTypes } from "../vitro-rojas/glass-types.data";
import { vitroRojasCasementModels } from "../vitro-rojas/models-casement.data";
import { vitroRojasSlidingModels } from "../vitro-rojas/models-sliding.data";
import { vitroRojasProfileSuppliers } from "../vitro-rojas/profile-suppliers.data";
import { vitroRojasServices } from "../vitro-rojas/services.data";

/**
 * Preset completo para Vitro Rojas S.A.
 *
 * Uso:
 * ```bash
 * pnpm seed --preset=vitro-rojas-panama
 * ```
 *
 * Nota: Este preset REEMPLAZA completamente los datos del tenant.
 * Ejecutar solo en instancia dedicada de Vitro Rojas.
 */
export const vitroRojasPanamaPreset: SeedPreset = {
  description:
    "Vitro Rojas S.A. - Fabricante de ventanas y puertas de aluminio en Panamá",

  // Soluciones de vidrio (4)
  glassSolutions: vitroRojasGlassSolutions,

  // Tipos de vidrio (11)
  glassTypes: vitroRojasGlassTypes,

  // Relaciones glass type <-> solution (17)
  glassTypeSolutionMappings: vitroRojasGlassTypeSolutionMappings,

  // Modelos de ventanas/puertas (9)
  models: [...vitroRojasSlidingModels, ...vitroRojasCasementModels],
  name: "vitro-rojas-panama",

  // Proveedores de perfiles (1)
  profileSuppliers: vitroRojasProfileSuppliers,

  // Servicios (5)
  services: vitroRojasServices,
};
