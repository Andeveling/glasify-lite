import type { ModelType } from '@prisma/client';

/**
 * Stored design configuration in database (JSON field)
 * Version 1.0 - Initial implementation
 */
export type StoredDesignConfig = {
  /** Schema version for future migrations */
  version: '1.0';

  metadata: {
    id: string;
    name: string;
    nameEs: string;
    description?: string;
    type: ModelType;
    author?: string;
    createdAt?: string;
  };

  /** Base dimensions for scaling reference (in mm) */
  dimensions: {
    baseWidth: number;
    baseHeight: number;
  };

  /** Adaptation constraints for parametric rendering */
  constraints: {
    /** Minimum frame thickness in mm (won't scale below this) */
    frameThicknessMin: number;
    /** Maximum frame thickness in mm (won't scale above this) */
    frameThicknessMax: number;
    /** Margin between frame and glass in mm */
    glassMargin: number;
  };

  /** Array of shapes to render (order matters for layering) */
  shapes: ShapeDefinition[];
};

/**
 * Individual shape definition
 */
export type ShapeDefinition = {
  /** Unique ID for debugging */
  id: string;

  /** Konva shape type */
  type: 'rect' | 'circle' | 'line' | 'path';

  /** Semantic role (affects adaptation logic) */
  role: 'frame' | 'glass' | 'handle' | 'hinge' | 'decorative';

  /** Z-index for rendering order (0 = back, higher = front) */
  layer: number;

  /** Position (supports absolute mm or relative %) */
  position: {
    x: number | { percent: number };
    y: number | { percent: number };
  };

  /** Size (supports absolute mm, relative %, or 'fill') */
  size: {
    width: number | { percent: number } | 'fill';
    height: number | { percent: number } | 'fill';
  };

  /** Visual styling */
  style: {
    /** Fill color (hex) or 'material' for dynamic color */
    fill?: string | 'material';
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    /** Corner radius for rectangles (in mm) */
    cornerRadius?: number;
  };
};

/**
 * Runtime adapted design after applying dimensions and material
 */
export type AdaptedDesign = {
  width: number; // px
  height: number; // px
  shapes: Array<{
    type: ShapeDefinition['type'];
    role: ShapeDefinition['role'];
    layer: number;
    x: number; // px
    y: number; // px
    width: number; // px
    height: number; // px
    style: {
      fill: string; // Resolved color (no 'material')
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
      cornerRadius?: number;
    };
  }>;
};
