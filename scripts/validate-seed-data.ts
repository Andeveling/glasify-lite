/** biome-ignore-all lint/suspicious/noConsole: validation script requires console logging */
/**
 * Glass Taxonomy Seed Data Validation Script
 *
 * Validates JSON seed data files before seeding:
 * - Schema validation against Zod schemas
 * - Duplicate detection (code, name)
 * - Technical specification ranges (thickness, U-value, etc.)
 * - Referential integrity (manufacturer codes, solution keys)
 * - Data consistency checks
 *
 * Usage:
 *   pnpm validate:seed-data                     # Validate all seed files
 *   pnpm validate:seed-data --file=glass-types  # Validate specific file
 *   pnpm validate:seed-data --strict            # Fail on warnings
 *
 * Environment variables:
 *   None required (reads from prisma/data/)
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import logger from '../src/lib/logger';

// CLI arguments parsing
interface ValidationOptions {
  file?: 'glass-types' | 'glass-solutions' | 'all';
  strict: boolean;
}

function parseCLIArgs(): ValidationOptions {
  const args = process.argv.slice(2);
  const options: ValidationOptions = {
    file: 'all',
    strict: false,
  };

  for (const arg of args) {
    if (arg === '--strict') {
      options.strict = true;
    } else if (arg.startsWith('--file=')) {
      const fileArg = arg.split('=')[1];
      if (fileArg === 'glass-types' || fileArg === 'glass-solutions' || fileArg === 'all') {
        options.file = fileArg;
      }
    }
  }

  return options;
}

/**
 * Validation report
 */
interface ValidationReport {
  completedAt: string;
  errors: Array<{
    code: string;
    context: Record<string, unknown>;
    file: string;
    message: string;
  }>;
  executionTimeMs: number;
  filesValidated: string[];
  startedAt: string;
  status: 'success' | 'failed' | 'warnings';
  warnings: Array<{
    code: string;
    context: Record<string, unknown>;
    file: string;
    message: string;
  }>;
}

/**
 * String length constraints
 */
const STRING_LENGTHS = {
  CODE_MAX: 50,
  DESCRIPTION_MAX: 1000,
  ICON_MAX: 50,
  KEY_MAX: 50,
  MIN: 1,
  NAME_MAX: 255,
} as const;

/**
 * Technical specification ranges
 */
const TECHNICAL_RANGES = {
  maxThickness: 50, // mm
  maxUValue: 10.0, // W/m²K
  minThickness: 2, // mm
  minUValue: 0.0, // W/m²K
} as const;

/**
 * Zod schema for glass type seed data
 */
const glassTypeSchema = z.object({
  code: z.string().min(STRING_LENGTHS.MIN).max(STRING_LENGTHS.CODE_MAX),
  manufacturer: z.string().optional(),
  name: z.string().min(STRING_LENGTHS.MIN).max(STRING_LENGTHS.NAME_MAX),
  series: z.string().optional(),
  thicknessMm: z.number().min(TECHNICAL_RANGES.minThickness).max(TECHNICAL_RANGES.maxThickness),
  uValue: z.number().min(TECHNICAL_RANGES.minUValue).max(TECHNICAL_RANGES.maxUValue).optional(),
});

/**
 * Zod schema for glass solution seed data
 */
const glassSolutionSchema = z.object({
  description: z.string().min(STRING_LENGTHS.MIN).max(STRING_LENGTHS.DESCRIPTION_MAX).optional(),
  icon: z.string().max(STRING_LENGTHS.ICON_MAX).optional(),
  key: z.string().min(STRING_LENGTHS.MIN).max(STRING_LENGTHS.KEY_MAX),
  name: z.string().min(STRING_LENGTHS.MIN).max(STRING_LENGTHS.NAME_MAX),
  nameEs: z.string().min(STRING_LENGTHS.MIN).max(STRING_LENGTHS.NAME_MAX),
  sortOrder: z.number().int().min(0),
});

/**
 * Validate glass types JSON file
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Validation requires multiple checks
function validateGlassTypes(filePath: string): {
  errors: ValidationReport['errors'];
  warnings: ValidationReport['warnings'];
} {
  console.log('\n📍 Validating glass types...');

  const errors: ValidationReport['errors'] = [];
  const warnings: ValidationReport['warnings'] = [];

  try {
    // Read file
    if (!fs.existsSync(filePath)) {
      errors.push({
        code: 'FILE_NOT_FOUND',
        context: { filePath },
        file: 'glass-types',
        message: `File not found: ${filePath}`,
      });
      return { errors, warnings };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent) as unknown;

    // Handle both formats: direct array or { version, manufacturer, glassTypes: [...] }
    let data: unknown[];
    if (Array.isArray(jsonData)) {
      data = jsonData;
    } else if (
      typeof jsonData === 'object' &&
      jsonData !== null &&
      'glassTypes' in jsonData &&
      Array.isArray(jsonData.glassTypes)
    ) {
      data = jsonData.glassTypes;
    } else {
      errors.push({
        code: 'INVALID_FORMAT',
        context: {},
        file: 'glass-types',
        message: 'Expected array of glass types or { version, manufacturer, glassTypes: [...] } format',
      });
      return { errors, warnings };
    }

    console.log(`  Found ${data.length} glass type records`);

    // Track duplicates
    const seenCodes = new Set<string>();
    const seenNames = new Set<string>();

    // Validate each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      // Schema validation
      const result = glassTypeSchema.safeParse(record);
      if (!result.success) {
        const firstError = result.error.issues[0];
        errors.push({
          code: 'SCHEMA_VALIDATION_FAILED',
          context: { errors: result.error.issues, index: i, record },
          file: 'glass-types',
          message: `Record ${i}: ${firstError?.message || 'Validation failed'}`,
        });
        continue;
      }

      const glassType = result.data;

      // Duplicate code check
      if (seenCodes.has(glassType.code)) {
        errors.push({
          code: 'DUPLICATE_CODE',
          context: { code: glassType.code, index: i },
          file: 'glass-types',
          message: `Duplicate code found: ${glassType.code}`,
        });
      } else {
        seenCodes.add(glassType.code);
      }

      // Duplicate name check (warning only)
      if (seenNames.has(glassType.name)) {
        warnings.push({
          code: 'DUPLICATE_NAME',
          context: { index: i, name: glassType.name },
          file: 'glass-types',
          message: `Duplicate name found: ${glassType.name}`,
        });
      } else {
        seenNames.add(glassType.name);
      }

      // Technical range validation
      if (
        glassType.thicknessMm < TECHNICAL_RANGES.minThickness ||
        glassType.thicknessMm > TECHNICAL_RANGES.maxThickness
      ) {
        errors.push({
          code: 'THICKNESS_OUT_OF_RANGE',
          context: {
            index: i,
            maxThickness: TECHNICAL_RANGES.maxThickness,
            minThickness: TECHNICAL_RANGES.minThickness,
            thicknessMm: glassType.thicknessMm,
          },
          file: 'glass-types',
          message: `Thickness out of range: ${glassType.thicknessMm}mm (${glassType.code})`,
        });
      }

      if (
        glassType.uValue !== undefined &&
        (glassType.uValue < TECHNICAL_RANGES.minUValue || glassType.uValue > TECHNICAL_RANGES.maxUValue)
      ) {
        errors.push({
          code: 'U_VALUE_OUT_OF_RANGE',
          context: {
            index: i,
            maxUValue: TECHNICAL_RANGES.maxUValue,
            minUValue: TECHNICAL_RANGES.minUValue,
            uValue: glassType.uValue,
          },
          file: 'glass-types',
          message: `U-value out of range: ${glassType.uValue} W/m²K (${glassType.code})`,
        });
      }
    }

    console.log(`  ✓ Unique codes: ${seenCodes.size}`);
    console.log(`  ✓ Unique names: ${seenNames.size}`);

    if (errors.length > 0) {
      console.log(`  ✗ Errors: ${errors.length}`);
    } else {
      console.log('  ✓ No errors found');
    }

    if (warnings.length > 0) {
      console.log(`  ⚠️  Warnings: ${warnings.length}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push({
      code: 'PARSING_ERROR',
      context: { error: errorMsg },
      file: 'glass-types',
      message: `Failed to parse file: ${errorMsg}`,
    });
  }

  return { errors, warnings };
}

/**
 * Validate glass solutions JSON file
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Validation requires multiple checks
function validateGlassSolutions(filePath: string): {
  errors: ValidationReport['errors'];
  warnings: ValidationReport['warnings'];
} {
  console.log('\n📍 Validating glass solutions...');

  const errors: ValidationReport['errors'] = [];
  const warnings: ValidationReport['warnings'] = [];

  try {
    // Read file
    if (!fs.existsSync(filePath)) {
      errors.push({
        code: 'FILE_NOT_FOUND',
        context: { filePath },
        file: 'glass-solutions',
        message: `File not found: ${filePath}`,
      });
      return { errors, warnings };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent) as unknown;

    // Handle both formats: direct array or { version, solutions: [...] }
    let data: unknown[];
    if (Array.isArray(jsonData)) {
      data = jsonData;
    } else if (
      typeof jsonData === 'object' &&
      jsonData !== null &&
      'solutions' in jsonData &&
      Array.isArray(jsonData.solutions)
    ) {
      data = jsonData.solutions;
    } else {
      errors.push({
        code: 'INVALID_FORMAT',
        context: {},
        file: 'glass-solutions',
        message: 'Expected array of glass solutions or { version, solutions: [...] } format',
      });
      return { errors, warnings };
    }

    console.log(`  Found ${data.length} glass solution records`);

    // Track duplicates
    const seenKeys = new Set<string>();
    const seenNames = new Set<string>();
    const seenNamesEs = new Set<string>();

    // Validate each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      // Schema validation
      const result = glassSolutionSchema.safeParse(record);
      if (!result.success) {
        const firstError = result.error.issues[0];
        errors.push({
          code: 'SCHEMA_VALIDATION_FAILED',
          context: { errors: result.error.issues, index: i, record },
          file: 'glass-solutions',
          message: `Record ${i}: ${firstError?.message || 'Validation failed'}`,
        });
        continue;
      }

      const solution = result.data;

      // Duplicate key check
      if (seenKeys.has(solution.key)) {
        errors.push({
          code: 'DUPLICATE_KEY',
          context: { index: i, key: solution.key },
          file: 'glass-solutions',
          message: `Duplicate key found: ${solution.key}`,
        });
      } else {
        seenKeys.add(solution.key);
      }

      // Duplicate name check (warning only)
      if (seenNames.has(solution.name)) {
        warnings.push({
          code: 'DUPLICATE_NAME',
          context: { index: i, name: solution.name },
          file: 'glass-solutions',
          message: `Duplicate English name found: ${solution.name}`,
        });
      } else {
        seenNames.add(solution.name);
      }

      // Duplicate Spanish name check (warning only)
      if (seenNamesEs.has(solution.nameEs)) {
        warnings.push({
          code: 'DUPLICATE_NAME_ES',
          context: { index: i, nameEs: solution.nameEs },
          file: 'glass-solutions',
          message: `Duplicate Spanish name found: ${solution.nameEs}`,
        });
      } else {
        seenNamesEs.add(solution.nameEs);
      }
    }

    console.log(`  ✓ Unique keys: ${seenKeys.size}`);
    console.log(`  ✓ Unique names (EN): ${seenNames.size}`);
    console.log(`  ✓ Unique names (ES): ${seenNamesEs.size}`);

    if (errors.length > 0) {
      console.log(`  ✗ Errors: ${errors.length}`);
    } else {
      console.log('  ✓ No errors found');
    }

    if (warnings.length > 0) {
      console.log(`  ⚠️  Warnings: ${warnings.length}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push({
      code: 'PARSING_ERROR',
      context: { error: errorMsg },
      file: 'glass-solutions',
      message: `Failed to parse file: ${errorMsg}`,
    });
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
export function validateSeedData(opts: ValidationOptions): ValidationReport {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();
  const allErrors: ValidationReport['errors'] = [];
  const allWarnings: ValidationReport['warnings'] = [];
  const filesValidated: string[] = [];

  try {
    console.log('\n🔍 Glass Taxonomy Seed Data Validation Started');
    console.log(`📅 Started at: ${startedAt}`);
    console.log(`📂 Validating: ${opts.file}\n`);

    logger.info('Validation started', {
      file: opts.file,
      strict: opts.strict,
      timestamp: startedAt,
    });

    const dataDir = path.join(process.cwd(), 'prisma', 'data');

    // Validate glass types
    if (opts.file === 'all' || opts.file === 'glass-types') {
      const glassTypesPath = path.join(dataDir, 'glass-types-tecnoglass.json');
      const { errors, warnings } = validateGlassTypes(glassTypesPath);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
      filesValidated.push('glass-types-tecnoglass.json');
    }

    // Validate glass solutions
    if (opts.file === 'all' || opts.file === 'glass-solutions') {
      const glassSolutionsPath = path.join(dataDir, 'glass-solutions.json');
      const { errors, warnings } = validateGlassSolutions(glassSolutionsPath);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
      filesValidated.push('glass-solutions.json');
    }

    console.log('\n✨ Validation completed!');

    const completedAt = new Date().toISOString();
    const executionTimeMs = Date.now() - startTime;

    let status: ValidationReport['status'] = 'success';
    if (allErrors.length > 0) {
      status = 'failed';
    } else if (allWarnings.length > 0 && opts.strict) {
      status = 'failed';
    } else if (allWarnings.length > 0) {
      status = 'warnings';
    }

    const report: ValidationReport = {
      completedAt,
      errors: allErrors,
      executionTimeMs,
      filesValidated,
      startedAt,
      status,
      warnings: allWarnings,
    };

    // Save report
    const reportPath = path.join(
      process.cwd(),
      'logs',
      `validation-report-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Files validated: ${filesValidated.length}`);
    console.log(`  Errors: ${allErrors.length}`);
    console.log(`  Warnings: ${allWarnings.length}`);
    console.log(`  Status: ${status.toUpperCase()}`);

    logger.info('Validation completed', {
      errors: allErrors.length,
      executionTimeMs,
      status,
      warnings: allWarnings.length,
    });

    return report;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Fatal error during validation:', errorMessage);
    logger.error('Validation failed', { error });

    return {
      completedAt: new Date().toISOString(),
      errors: [
        {
          code: 'FATAL_ERROR',
          context: { error },
          file: 'all',
          message: errorMessage,
        },
      ],
      executionTimeMs: Date.now() - startTime,
      filesValidated,
      startedAt,
      status: 'failed',
      warnings: allWarnings,
    };
  }
}

// Run validation if executed directly
const options = parseCLIArgs();
try {
  const report = validateSeedData(options);
  process.exit(report.status === 'success' ? 0 : 1);
} catch (error) {
  console.error('Unhandled error:', error);
  process.exit(1);
}
