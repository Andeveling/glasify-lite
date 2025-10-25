/**
 * Design Adapter Service
 *
 * Transforms StoredDesignConfig (stored in database) into AdaptedDesign (ready for rendering).
 *
 * Responsibilities:
 * - Convert relative positioning (%) to absolute pixels
 * - Resolve material color placeholders to hex colors
 * - Validate shapes are complete before returning
 * - Handle constraint-based parametric adaptation
 *
 * Architecture:
 * - Pure business logic (no framework dependencies)
 * - Server-side only (uses Winston logger)
 * - Throws errors for invalid configs (handled by caller)
 */

import type { MaterialType } from '@prisma/client';
import { getMaterialColor } from '@/lib/design/material-colors';
import type { AdaptedDesign, ShapeDefinition, StoredDesignConfig } from '@/lib/design/types';
import { validateDesignConfig } from '@/lib/design/validation';
import logger from '@/lib/logger';

/**
 * Adaptation error class for better error handling
 */
export class DesignAdaptationError extends Error {
  readonly designId: string;
  readonly cause?: unknown;

  constructor(message: string, designId: string, cause?: unknown) {
    super(message);
    this.name = 'DesignAdaptationError';
    this.designId = designId;
    this.cause = cause;
  }
}

/**
 * Adapt a stored design configuration to an adapted design ready for rendering.
 *
 * @param config - The stored design configuration (JSON from database)
 * @param baseWidth - Target width in pixels for rendering
 * @param baseHeight - Target height in pixels for rendering
 * @param material - Material type for resolving 'material' color placeholders
 * @returns Adapted design with all values in pixels and colors resolved
 * @throws {DesignAdaptationError} If config is invalid or adaptation fails
 */
export function adaptDesign(
  config: unknown,
  baseWidth: number,
  baseHeight: number,
  material: MaterialType
): AdaptedDesign {
  try {
    // Step 1: Validate config structure with Zod
    const validatedConfig = validateDesignConfig(config);

    logger.debug('Adapting design', {
      baseHeight,
      baseWidth,
      designId: validatedConfig.metadata.id,
      material,
    });

    // Step 2: Get material color for 'material' placeholder resolution
    const materialColor = getMaterialColor(material);

    // Step 3: Adapt each shape
    const adaptedShapes = validatedConfig.shapes.map((shape) =>
      adaptShape({
        config: validatedConfig,
        materialColor,
        shape,
        targetHeight: baseHeight,
        targetWidth: baseWidth,
      })
    ); // Step 4: Build adapted design
    const adaptedDesign: AdaptedDesign = {
      ...validatedConfig,
      height: baseHeight,
      shapes: adaptedShapes,
      width: baseWidth,
    };

    logger.info('Design adapted successfully', {
      designId: validatedConfig.metadata.id,
      shapeCount: adaptedShapes.length,
    });

    return adaptedDesign;
  } catch (error) {
    const designId =
      typeof config === 'object' && config !== null && 'metadata' in config
        ? String((config.metadata as { id?: string })?.id ?? 'unknown')
        : 'unknown';

    logger.error('Design adaptation failed', {
      designId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new DesignAdaptationError(
      `Failed to adapt design: ${error instanceof Error ? error.message : String(error)}`,
      designId,
      error
    );
  }
}

/**
 * Options for adapting a shape
 */
type AdaptShapeOptions = {
  config: StoredDesignConfig;
  materialColor: string;
  shape: ShapeDefinition;
  targetHeight: number;
  targetWidth: number;
};

/**
 * Adapt a single shape from relative to absolute values
 * Returns flat structure with x, y, width, height (not nested position/size)
 */
function adaptShape(options: AdaptShapeOptions): AdaptedDesign['shapes'][number] {
  const { config, materialColor, shape, targetHeight, targetWidth } = options;

  // Adapt position
  const x = adaptPositionValue(shape.position.x, targetWidth);
  const y = adaptPositionValue(shape.position.y, targetHeight);

  // Adapt size with constraint awareness
  const width = adaptSizeValue(shape.size.width, targetWidth, config);
  const height = adaptSizeValue(shape.size.height, targetHeight, config);

  // Resolve material color if needed
  const fill = shape.style.fill === 'material' ? materialColor : (shape.style.fill ?? '#000000');

  return {
    height,
    layer: shape.layer,
    role: shape.role,
    style: {
      cornerRadius: shape.style.cornerRadius,
      fill,
      opacity: shape.style.opacity,
      stroke: shape.style.stroke,
      strokeWidth: shape.style.strokeWidth,
    },
    type: shape.type,
    width,
    x,
    y,
  };
}

/**
 * Adapt position value from relative or absolute to absolute pixels
 */
function adaptPositionValue(value: number | { percent: number }, base: number): number {
  if (typeof value === 'number') {
    return value; // Already absolute
  }
  return value.percent * base; // Convert % to px
}

/**
 * Adapt size value from relative, absolute, or 'fill' to absolute pixels
 */
function adaptSizeValue(
  value: number | { percent: number } | 'fill',
  base: number,
  config: StoredDesignConfig
): number {
  if (value === 'fill') {
    // 'fill' means remaining space after frame thickness and glass margin
    const frameThickness = config.constraints.frameThicknessMin; // Use min as default
    const glassMargin = config.constraints.glassMargin;
    return base - frameThickness * 2 - glassMargin * 2;
  }

  if (typeof value === 'number') {
    return value; // Already absolute
  }

  return value.percent * base; // Convert % to px
}

/**
 * Default export for service
 */
export default {
  adaptDesign,
};
