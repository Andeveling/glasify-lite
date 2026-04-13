import type { SeedPreset } from "../../seeders/seed-orchestrator";
import { vitroRojasColors } from "../vitro-rojas/colors.data";
import { vitroRojasGlassSolutions } from "../vitro-rojas/glass-solutions.data";
import { vitroRojasGlassTypeSolutionMappings } from "../vitro-rojas/glass-type-solution-mappings.data";
import { vitroRojasGlassTypes } from "../vitro-rojas/glass-types.data";
import { vitroRojasCasementModels } from "../vitro-rojas/models-casement.data";
import { vitroRojasSlidingModels } from "../vitro-rojas/models-sliding.data";
import { vitroRojasProfileSuppliers } from "../vitro-rojas/profile-suppliers.data";
import { vitroRojasServices } from "../vitro-rojas/services.data";

export const vitroRojasPanamaPreset: SeedPreset = {
  description:
    "Vitro Rojas S.A. - Fabricante de ventanas y puertas de aluminio en Panamá",
  colors: vitroRojasColors,
  glassSolutions: vitroRojasGlassSolutions,
  glassTypes: vitroRojasGlassTypes,
  glassTypeSolutionMappings: vitroRojasGlassTypeSolutionMappings,
  models: [...vitroRojasSlidingModels, ...vitroRojasCasementModels],
  name: "vitro-rojas-panama",
  profileSuppliers: vitroRojasProfileSuppliers,
  services: vitroRojasServices,
};
