import type { SeedPreset } from "../../seeders/seed-orchestrator";
import { vitroRojasColors } from "../clients/vitro-rojas/colors.data";
import { vitroRojasGlassSolutions } from "../clients/vitro-rojas/glass-solutions.data";
import { vitroRojasGlassTypeSolutionMappings } from "../clients/vitro-rojas/glass-type-solution-mappings.data";
import { vitroRojasGlassTypes } from "../clients/vitro-rojas/glass-types.data";
import { vitroRojasCasementModels } from "../clients/vitro-rojas/models-casement.data";
import { vitroRojasSlidingModels } from "../clients/vitro-rojas/models-sliding.data";
import { vitroRojasProfileSuppliers } from "../clients/vitro-rojas/profile-suppliers.data";
import { vitroRojasServices } from "../clients/vitro-rojas/services.data";

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
