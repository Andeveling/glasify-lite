/** biome-ignore-all lint/suspicious/noConsole: simplemente es un seed de prueba */
import type { GlassType, PerformanceRating, PrismaClient } from '@prisma/client';

/**
 * Glass Solutions Seed Data
 * Based on international standards: EN 12600, ISO 717-1, ISO 10077, EN 356
 */

// Rating thresholds
const RATING_EXCELLENT = 5;
const RATING_VERY_GOOD = 4;
const RATING_GOOD = 3;
const RATING_STANDARD = 2;

// Thickness thresholds (mm)
const THICKNESS_STANDARD = 6;
const THICKNESS_DVH_MIN = 10;
const THICKNESS_DVH_THICK = 20;

// Solution definitions with Spanish names and icons
export const glassSolutions = [
  {
    description: 'Protección contra impactos, rotura y acceso no autorizado',
    icon: 'Shield',
    key: 'security',
    name: 'Security',
    nameEs: 'Seguridad',
    sortOrder: 1,
  },
  {
    description: 'Reducción de pérdida de calor y mejora de eficiencia térmica',
    icon: 'Snowflake',
    key: 'thermal_insulation',
    name: 'Thermal Insulation',
    nameEs: 'Aislamiento Térmico',
    sortOrder: 2,
  },
  {
    description: 'Reducción de ruido exterior para mayor confort acústico',
    icon: 'Volume2',
    key: 'sound_insulation',
    name: 'Sound Insulation',
    nameEs: 'Insonorización',
    sortOrder: 3,
  },
  {
    description: 'Ahorro energético mediante tecnología Low-E y doble/triple acristalamiento',
    icon: 'Zap',
    key: 'energy_efficiency',
    name: 'Energy Efficiency',
    nameEs: 'Eficiencia Energética',
    sortOrder: 4,
  },
  {
    description: 'Estética, privacidad y elementos decorativos',
    icon: 'Sparkles',
    key: 'decorative',
    name: 'Decorative',
    nameEs: 'Decorativo',
    sortOrder: 5,
  },
  {
    description: 'Solución estándar para uso general',
    icon: 'Home',
    key: 'general',
    name: 'General Purpose',
    nameEs: 'Uso General',
    sortOrder: 6,
  },
] as const;

/**
 * Calculate security rating based on EN 12600 and EN 356 standards
 *
 * Factors:
 * - Tempered glass: +1 point (EN 12600 Class C)
 * - Laminated: +2 points (EN 356 P1A-P5A)
 * - Thickness >= 6mm: +1 point
 * - Laminated + Tempered: +1 bonus point (EN 356 P6B+)
 *
 * Score mapping:
 * - 1: Basic (single float glass)
 * - 2: Standard (tempered 6mm)
 * - 3: Good (laminated simple)
 * - 4: Very Good (laminated tempered)
 * - 5: Excellent (multi-layer laminated tempered)
 */
function calculateSecurityRating(
  glass: Pick<GlassType, 'isTempered' | 'isLaminated' | 'thicknessMm'>
): PerformanceRating {
  let score = 1;

  if (glass.isTempered) score += 1;
  if (glass.isLaminated) score += 2;
  if (glass.thicknessMm >= THICKNESS_STANDARD) score += 1;
  if (glass.isLaminated && glass.isTempered) score += 1; // Bonus for combination

  if (score >= RATING_EXCELLENT) return 'excellent';
  if (score >= RATING_VERY_GOOD) return 'very_good';
  if (score >= RATING_GOOD) return 'good';
  if (score >= RATING_STANDARD) return 'standard';
  return 'basic';
}

/**
 * Calculate sound insulation rating based on ISO 717-1 (Rw index)
 *
 * Estimated Rw values:
 * - Single glazing 4mm: ~28 dB
 * - Single glazing 6mm: ~30 dB
 * - Laminated 6+6mm: ~35 dB
 * - DVH (double glazing): ~32-38 dB
 * - Laminated DVH: ~40-45 dB
 *
 * Rating thresholds:
 * - 1 (Poor): 25-29 dB
 * - 2 (Fair): 30-34 dB
 * - 3 (Good): 35-39 dB
 * - 4 (Very Good): 40-44 dB
 * - 5 (Excellent): 45+ dB
 */
function calculateSoundInsulationRating(
  glass: Pick<GlassType, 'isLaminated' | 'thicknessMm' | 'isTripleGlazed'>
): PerformanceRating {
  let score = 1;

  // Base score from thickness
  if (glass.thicknessMm >= THICKNESS_STANDARD) score += 1;
  if (glass.thicknessMm >= THICKNESS_DVH_MIN) score += 1;

  // Laminated glass significantly improves acoustic performance
  if (glass.isLaminated) score += 2;

  // Triple glazing with air/gas chambers
  if (glass.isTripleGlazed) score += 1;

  if (score >= RATING_EXCELLENT) return 'excellent';
  if (score >= RATING_VERY_GOOD) return 'very_good';
  if (score >= RATING_GOOD) return 'good';
  if (score >= RATING_STANDARD) return 'standard';
  return 'basic';
}

/**
 * Calculate thermal insulation rating based on ISO 10077 (U-value)
 *
 * Typical U-values (W/m²·K):
 * - Single glazing: 5.8
 * - Double glazing (DVH): 2.8-3.0
 * - DVH with Low-E: 1.6-2.0
 * - Triple glazing: 1.2-1.6
 * - Triple Low-E with argon: 0.5-1.0
 *
 * Rating thresholds:
 * - 1 (Basic): U > 4.5
 * - 2 (Standard): U 2.8-4.5
 * - 3 (Good): U 2.0-2.7
 * - 4 (Very Good): U 1.2-1.9
 * - 5 (Excellent): U < 1.2
 */
function calculateThermalInsulationRating(
  glass: Pick<GlassType, 'isLowE' | 'isTripleGlazed' | 'thicknessMm'>
): PerformanceRating {
  let score = 1;

  // Thicker glass or DVH configuration
  if (glass.thicknessMm >= THICKNESS_DVH_MIN) score += 1; // Likely DVH
  if (glass.thicknessMm >= THICKNESS_DVH_THICK) score += 1; // Definitely DVH

  // Low-E coating significantly reduces U-value
  if (glass.isLowE) score += 2;

  // Triple glazing
  if (glass.isTripleGlazed) score += 1;

  if (score >= RATING_EXCELLENT) return 'excellent';
  if (score >= RATING_VERY_GOOD) return 'very_good';
  if (score >= RATING_GOOD) return 'good';
  if (score >= RATING_STANDARD) return 'standard';
  return 'basic';
}

/**
 * Calculate energy efficiency rating based on Low-E coating and glazing configuration
 *
 * Factors:
 * - Low-E coating: Primary factor
 * - Triple glazing: Enhanced performance
 * - DVH (double glazing): Standard improvement
 */
function calculateEnergyEfficiencyRating(
  glass: Pick<GlassType, 'isLowE' | 'isTripleGlazed' | 'thicknessMm'>
): PerformanceRating {
  let score = 1;

  if (glass.thicknessMm >= THICKNESS_DVH_MIN) score += 1; // DVH
  if (glass.isLowE) score += 2; // Low-E is key for energy efficiency
  if (glass.isTripleGlazed) score += 1;
  if (glass.isLowE && glass.isTripleGlazed) score += 1; // Bonus

  if (score >= RATING_EXCELLENT) return 'excellent';
  if (score >= RATING_VERY_GOOD) return 'very_good';
  if (score >= RATING_GOOD) return 'good';
  if (score >= RATING_STANDARD) return 'standard';
  return 'basic';
}

/**
 * Assign solutions to a glass type based on its characteristics
 * Returns array of { solutionKey, performanceRating, isPrimary }
 */
export function calculateGlassSolutions(
  glass: Pick<GlassType, 'purpose' | 'isTempered' | 'isLaminated' | 'isLowE' | 'isTripleGlazed' | 'thicknessMm'>
): Array<{ isPrimary: boolean; performanceRating: PerformanceRating; solutionKey: string }> {
  const solutions: Array<{ isPrimary: boolean; performanceRating: PerformanceRating; solutionKey: string }> = [];

  // Security rating (all glasses have some level of security)
  const securityRating = calculateSecurityRating(glass);
  if (securityRating !== 'basic' || glass.purpose === 'security') {
    solutions.push({
      isPrimary: glass.purpose === 'security',
      performanceRating: securityRating,
      solutionKey: 'security',
    });
  }

  // Sound insulation (laminated or thick glass)
  if (glass.isLaminated || glass.thicknessMm >= THICKNESS_STANDARD) {
    const soundRating = calculateSoundInsulationRating(glass);
    solutions.push({
      isPrimary: false, // Rarely the primary purpose
      performanceRating: soundRating,
      solutionKey: 'sound_insulation',
    });
  }

  // Thermal insulation (DVH, Low-E, triple glazing)
  if (glass.thicknessMm >= THICKNESS_DVH_MIN || glass.isLowE || glass.isTripleGlazed) {
    const thermalRating = calculateThermalInsulationRating(glass);
    solutions.push({
      isPrimary: glass.purpose === 'insulation',
      performanceRating: thermalRating,
      solutionKey: 'thermal_insulation',
    });
  }

  // Energy efficiency (Low-E is key indicator)
  if (glass.isLowE || glass.isTripleGlazed) {
    const energyRating = calculateEnergyEfficiencyRating(glass);
    solutions.push({
      isPrimary: false, // Related to thermal but distinct
      performanceRating: energyRating,
      solutionKey: 'energy_efficiency',
    });
  }

  // Decorative
  if (glass.purpose === 'decorative') {
    solutions.push({
      isPrimary: true,
      performanceRating: 'standard', // Decorative doesn't have performance grades
      solutionKey: 'decorative',
    });
  }

  // General purpose (fallback for simple glasses)
  if (glass.purpose === 'general' || solutions.length === 0) {
    solutions.push({
      isPrimary: glass.purpose === 'general',
      performanceRating: 'standard',
      solutionKey: 'general',
    });
  }

  // Ensure at least one solution is primary
  if (!solutions.some((s) => s.isPrimary) && solutions.length > 0) {
    // biome-ignore lint/style/noNonNullAssertion: we check length > 0
    solutions[0]!.isPrimary = true;
  }

  return solutions;
}

/**
 * Seed glass solutions and assign them to existing glass types
 */
export async function seedGlassSolutions(prisma: PrismaClient) {
  console.log('🔄 Seeding glass solutions...');

  // Create solution categories
  const createdSolutions = await Promise.all(
    glassSolutions.map((solution) =>
      prisma.glassSolution.upsert({
        create: solution,
        update: solution,
        where: { key: solution.key },
      })
    )
  );

  console.log(`✅ Created/updated ${createdSolutions.length} glass solutions`);

  // Get all existing glass types
  const glassTypes = await prisma.glassType.findMany({
    select: {
      id: true,
      isLaminated: true,
      isLowE: true,
      isTempered: true,
      isTripleGlazed: true,
      name: true,
      purpose: true,
      thicknessMm: true,
    },
  });

  console.log(`🔄 Assigning solutions to ${glassTypes.length} glass types...`);

  let assignmentCount = 0;

  // Assign solutions to each glass type
  for (const glassType of glassTypes) {
    const solutionAssignments = calculateGlassSolutions(glassType);

    for (const assignment of solutionAssignments) {
      const solution = createdSolutions.find((s) => s.key === assignment.solutionKey);
      if (!solution) continue;

      // Check if assignment already exists
      const existing = await prisma.glassTypeSolution.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated unique constraint name
          glassTypeId_solutionId: {
            glassTypeId: glassType.id,
            solutionId: solution.id,
          },
        },
      });

      if (existing) {
        // Update existing
        await prisma.glassTypeSolution.update({
          data: {
            isPrimary: assignment.isPrimary,
            performanceRating: assignment.performanceRating,
          },
          where: { id: existing.id },
        });
      } else {
        // Create new
        await prisma.glassTypeSolution.create({
          data: {
            glassTypeId: glassType.id,
            isPrimary: assignment.isPrimary,
            performanceRating: assignment.performanceRating,
            solutionId: solution.id,
          },
        });
      }

      assignmentCount++;
    }
  }

  console.log(`✅ Created/updated ${assignmentCount} glass-solution assignments`);

  // Log summary
  console.log('\n📊 Solutions Summary:');
  for (const solution of createdSolutions) {
    const count = await prisma.glassTypeSolution.count({
      where: { solutionId: solution.id },
    });
    console.log(`   ${solution.nameEs} (${solution.key}): ${count} glasses`);
  }
}
