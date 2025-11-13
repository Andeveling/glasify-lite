// Presets y diccionarios para suppliers
export const GLASS_SUPPLIER_PRESETS = [
  "Vidriera Nacional S.A.",
  "Guardian Glass Panamá",
  "Saint-Gobain",
  "Pilkington",
  "Vitro",
  "AGC Glass",
  "Cristalería Moderna",
  "Vidrios Lux",
  "Vidrios del Pacífico",
  "Vidrios y Soluciones",
];

export const SUPPLIER_CODES: Record<string, string> = {
  "Vidriera Nacional S.A.": "VNAT",
  "Guardian Glass Panamá": "GGPA",
  "Saint-Gobain": "SGOB",
  Pilkington: "PILK",
  Vitro: "VITR",
  "AGC Glass": "AGCG",
  "Cristalería Moderna": "CRMO",
  "Vidrios Lux": "VLUX",
  "Vidrios del Pacífico": "VDPA",
  "Vidrios y Soluciones": "VYSO",
};

export const SUPPLIER_COUNTRIES: Record<string, string> = {
  "Vidriera Nacional S.A.": "Panamá",
  "Guardian Glass Panamá": "Panamá",
  "Saint-Gobain": "Francia",
  Pilkington: "Reino Unido",
  Vitro: "México",
  "AGC Glass": "Japón",
  "Cristalería Moderna": "Colombia",
  "Vidrios Lux": "Colombia",
  "Vidrios del Pacífico": "Chile",
  "Vidrios y Soluciones": "Argentina",
};

/**
 * @file GlassSupplier Factory
 * @description Generates type-safe test data for GlassSupplier seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 */

import type { NewGlassSupplier } from "@/server/db/schemas/glass-supplier.schema";
import { glassSupplierInsertSchema } from "@/server/db/schemas/glass-supplier.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Constants
const ACTIVE_PROBABILITY = 0.95; // 95% active by default

// Phone generation constants
const PHONE_PREFIX_BASE = 300;
const PHONE_PREFIX_RANGE = 50;
const PHONE_NUMBER_LENGTH = 7;
const PHONE_NUMBER_MAX = 10_000_000;

// Code generation constants
const CODE_PREFIX_MAX_LENGTH = 4;
const CODE_SUFFIX_LENGTH = 2;
const CODE_SUFFIX_MAX = 100;

// Helper: Random array element
function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

// Helper: Random boolean with probability
function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Generate realistic supplier name
 */
function generateSupplierName(): string {
  return randomElement(GLASS_SUPPLIER_PRESETS);
}

/**
 * Generate supplier code (uppercase alphanumeric)
 */
function generateSupplierCode(name?: string): string {
  // Use predefined code if exists
  if (name && name in SUPPLIER_CODES) {
    return SUPPLIER_CODES[name as keyof typeof SUPPLIER_CODES] ?? "";
  }

  // Generate random code
  const prefix = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, CODE_PREFIX_MAX_LENGTH)
    : "GS";

  const suffix = Math.floor(Math.random() * CODE_SUFFIX_MAX)
    .toString()
    .padStart(CODE_SUFFIX_LENGTH, "0");
  return `${prefix}${suffix}`;
}

/**
 * Generate supplier country
 */
function generateCountry(name?: string): string | undefined {
  // Use predefined country if exists
  if (name && name in SUPPLIER_COUNTRIES) {
    return SUPPLIER_COUNTRIES[name as keyof typeof SUPPLIER_COUNTRIES];
  }

  const countries = [
    "Colombia",
    "Estados Unidos",
    "México",
    "Brasil",
    "Chile",
    "Argentina",
    "Perú",
    "España",
    "China",
    "Alemania",
  ];

  return randomElement(countries);
}

/**
 * Generate supplier website
 */
function generateWebsite(name: string): string {
  const domain = name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[áà]/g, "a")
    .replace(/[éè]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[óò]/g, "o")
    .replace(/[úù]/g, "u")
    .replace(/[^a-z0-9]/g, "");

  const tlds = [".com", ".com.co", ".co", ".mx", ".com.mx"];
  return `https://${domain}${randomElement(tlds)}`;
}

/**
 * Generate contact email
 */
function generateEmail(name: string): string {
  const domain = name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[áà]/g, "a")
    .replace(/[éè]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[óò]/g, "o")
    .replace(/[úù]/g, "u")
    .replace(/[^a-z0-9]/g, "");

  const prefixes = ["info", "ventas", "contacto", "sales", "support"];
  const tlds = [".com", ".com.co"];

  return `${randomElement(prefixes)}@${domain}${randomElement(tlds)}`;
}

/**
 * Generate contact phone (Colombian format)
 */
function generatePhone(): string {
  // Colombian mobile format: 300-350 + 7 digits
  const prefix =
    PHONE_PREFIX_BASE + Math.floor(Math.random() * PHONE_PREFIX_RANGE);
  const number = Math.floor(Math.random() * PHONE_NUMBER_MAX)
    .toString()
    .padStart(PHONE_NUMBER_LENGTH, "0");
  return `${prefix}${number}`;
}

/**
 * Generate notes
 */
function generateNotes(): string {
  const notes = [
    "Proveedor principal de vidrios templados",
    "Especializado en vidrios laminados de seguridad",
    "Distribuidor autorizado de vidrios low-e",
    "Proveedor de vidrios decorativos y arquitectónicos",
    "Especializado en soluciones de control solar",
    "Proveedor de vidrios acústicos y térmicos",
  ];

  return randomElement(notes);
}

/**
 * Generate a single GlassSupplier
 *
 * @param options - Factory options
 * @returns FactoryResult with generated or error data
 *
 * @example
 * ```typescript
 * const result = generateGlassSupplier();
 * if (result.success) {
 *   console.log(result.data); // { name: 'Vidrios Lux', code: 'VLUX', ... }
 * }
 * ```
 */
export function generateGlassSupplier(
  options?: FactoryOptions<NewGlassSupplier>
): FactoryResult<NewGlassSupplier> {
  const name = options?.overrides?.name ?? generateSupplierName();

  const defaults: NewGlassSupplier = {
    name,
    code: generateSupplierCode(name),
    country: generateCountry(name),
    website: generateWebsite(name),
    contactEmail: generateEmail(name),
    contactPhone: generatePhone(),
    isActive: randomBoolean(ACTIVE_PROBABILITY) ? "true" : "false",
    notes: generateNotes(),
    tenantConfigId: "1", // default for seed
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = glassSupplierInsertSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((err) => ({
          code: err.code,
          context: {
            expected: "expected" in err ? err.expected : undefined,
            received: "received" in err ? err.received : undefined,
          },
          message: err.message,
          path: err.path.map(String),
        })),
      };
    }
    return createSuccessResult(parsed.data);
  }

  return createSuccessResult(data);
}

/**
 * Generate multiple GlassSuppliers
 *
 * @param count - Number of GlassSuppliers to generate
 * @param options - Factory options for all instances
 * @returns Array of FactoryResult (one per generated entity)
 *
 * @example
 * ```typescript
 * const results = generateGlassSuppliers(5);
 * const successful = results.filter(r => r.success);
 * const data = successful.map(r => r.data);
 * ```
 */
export function generateGlassSuppliers(
  count: number,
  options?: FactoryOptions<NewGlassSupplier>
): FactoryResult<NewGlassSupplier>[] {
  return Array.from({ length: count }, () => generateGlassSupplier(options));
}

/**
 * Generate a batch of valid GlassSuppliers (only successful results)
 * Filters out validation failures automatically
 *
 * @param count - Number of valid GlassSuppliers to generate
 * @param options - Factory options
 * @returns Array of validated GlassSupplier data (guaranteed valid)
 *
 * @example
 * ```typescript
 * const suppliers = generateGlassSupplierBatch(10);
 * // All 10 are guaranteed to be valid
 * ```
 */
export function generateGlassSupplierBatch(
  count: number,
  options?: FactoryOptions<NewGlassSupplier>
): NewGlassSupplier[] {
  const results = generateGlassSuppliers(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<NewGlassSupplier> & {
        success: true;
        data: NewGlassSupplier;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate a GlassSupplier with preset name
 *
 * @param name - Specific supplier name from presets
 * @param options - Additional factory options
 * @returns FactoryResult with generated data
 *
 * @example
 * ```typescript
 * const result = generatePresetGlassSupplier('Saint-Gobain');
 * // Uses predefined code and country for Saint-Gobain
 * ```
 */
export function generatePresetGlassSupplier(
  name: (typeof GLASS_SUPPLIER_PRESETS)[number],
  options?: FactoryOptions<NewGlassSupplier>
): FactoryResult<NewGlassSupplier> {
  return generateGlassSupplier({
    ...options,
    overrides: {
      name,
      code:
        name in SUPPLIER_CODES
          ? SUPPLIER_CODES[name as keyof typeof SUPPLIER_CODES]
          : undefined,
      country:
        name in SUPPLIER_COUNTRIES
          ? SUPPLIER_COUNTRIES[name as keyof typeof SUPPLIER_COUNTRIES]
          : undefined,
      ...options?.overrides,
    },
  });
}

/**
 * Generate only active GlassSuppliers
 *
 * @param count - Number of active suppliers to generate
 * @param options - Additional factory options
 * @returns Array of active GlassSupplier data
 *
 * @example
 * ```typescript
 * const activeSuppliers = generateActiveGlassSupplierBatch(5);
 * // All 5 are guaranteed to have isActive = "true"
 * ```
 */
export function generateActiveGlassSupplierBatch(
  count: number,
  options?: FactoryOptions<NewGlassSupplier>
): NewGlassSupplier[] {
  return generateGlassSupplierBatch(count, {
    ...options,
    overrides: {
      isActive: "true",
      ...options?.overrides,
    },
  });
}
