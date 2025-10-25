/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Model Designs Seeder
 *
 * Seeds predefined 2D model designs for visualization in catalog and forms.
 * Supports idempotent seeding - designs are upserted by name.
 *
 * Design structure:
 * - Designs are JSON configurations with metadata, dimensions, constraints, and shapes
 * - Shapes are Konva-compatible definitions (rect, circle, line, path)
 * - Designs adapt to model dimensions parametrically
 * - Material type determines color (PVC=white, ALUMINUM=gray, WOOD=brown, MIXED=light gray)
 */

import type { ModelType } from '@prisma/client';
import type { StoredDesignConfig } from '../../src/lib/design/types';
import { db } from '../../src/server/db';

/**
 * Result of a seeding operation
 */
interface SeedResult {
  seeded: number;
  skipped: number;
  errors: Array<{ message: string; context?: unknown }>;
}

/**
 * Create a basic fixed window design configuration
 */
function createFixedWindowDesign(): StoredDesignConfig {
  return {
    constraints: {
      frameThicknessMax: 80,
      frameThicknessMin: 40,
      glassMargin: 10,
    },
    dimensions: {
      baseHeight: 1200,
      baseWidth: 1000,
    },
    metadata: {
      author: 'System',
      createdAt: new Date().toISOString(),
      description: 'Simple fixed window with frame and glass panel',
      id: 'fixed-window-simple',
      name: 'fixed-window-simple',
      nameEs: 'Ventana Fija Simple',
      type: 'fixed_window',
    },
    shapes: [
      {
        id: 'outer-frame',
        layer: 0,
        position: { x: 0, y: 0 },
        role: 'frame',
        size: { height: { percent: 1 }, width: { percent: 1 } },
        style: {
          cornerRadius: 4,
          fill: 'material',
          stroke: '#333',
          strokeWidth: 2,
        },
        type: 'rect',
      },
      {
        id: 'glass-panel',
        layer: 1,
        position: { x: 50, y: 50 },
        role: 'glass',
        size: { height: 'fill', width: 'fill' },
        style: {
          cornerRadius: 2,
          fill: '#E0F7FA',
          opacity: 0.7,
          stroke: '#00838F',
          strokeWidth: 1,
        },
        type: 'rect',
      },
    ],
    version: '1.0',
  };
}

/**
 * Create a sliding horizontal window design configuration
 */
function createSlidingWindowHorizontalDesign(): StoredDesignConfig {
  return {
    constraints: {
      frameThicknessMax: 85,
      frameThicknessMin: 45,
      glassMargin: 10,
    },
    dimensions: {
      baseHeight: 1000,
      baseWidth: 1400,
    },
    metadata: {
      author: 'System',
      createdAt: new Date().toISOString(),
      description: 'Horizontal sliding window with two panes',
      id: 'sliding-window-horizontal-simple',
      name: 'sliding-window-horizontal-simple',
      nameEs: 'Ventana Corredera Horizontal',
      type: 'sliding_window_horizontal',
    },
    shapes: [
      {
        id: 'outer-frame',
        layer: 0,
        position: { x: 0, y: 0 },
        role: 'frame',
        size: { height: { percent: 1 }, width: { percent: 1 } },
        style: {
          cornerRadius: 4,
          fill: 'material',
          stroke: '#333',
          strokeWidth: 2,
        },
        type: 'rect',
      },
      {
        id: 'glass-left',
        layer: 1,
        position: { x: 50, y: 50 },
        role: 'glass',
        size: { height: 'fill', width: { percent: 0.5 } },
        style: {
          fill: '#E0F7FA',
          opacity: 0.7,
          stroke: '#00838F',
          strokeWidth: 1,
        },
        type: 'rect',
      },
      {
        id: 'glass-right',
        layer: 1,
        position: { x: { percent: 0.5 }, y: 50 },
        role: 'glass',
        size: { height: 'fill', width: { percent: 0.5 } },
        style: {
          fill: '#E0F7FA',
          opacity: 0.7,
          stroke: '#00838F',
          strokeWidth: 1,
        },
        type: 'rect',
      },
      {
        id: 'handle-left',
        layer: 2,
        position: { x: { percent: 0.4 }, y: { percent: 0.5 } },
        role: 'handle',
        size: { height: 20, width: 20 },
        style: {
          fill: '#C0C0C0',
          stroke: '#666',
          strokeWidth: 1,
        },
        type: 'circle',
      },
      {
        id: 'handle-right',
        layer: 2,
        position: { x: { percent: 0.8 }, y: { percent: 0.5 } },
        role: 'handle',
        size: { height: 20, width: 20 },
        style: {
          fill: '#C0C0C0',
          stroke: '#666',
          strokeWidth: 1,
        },
        type: 'circle',
      },
    ],
    version: '1.0',
  };
}

/**
 * Create a single door design configuration
 */
function createSingleDoorDesign(): StoredDesignConfig {
  return {
    constraints: {
      frameThicknessMax: 90,
      frameThicknessMin: 50,
      glassMargin: 15,
    },
    dimensions: {
      baseHeight: 2100,
      baseWidth: 900,
    },
    metadata: {
      author: 'System',
      createdAt: new Date().toISOString(),
      description: 'Standard single door with frame',
      id: 'single-door-simple',
      name: 'single-door-simple',
      nameEs: 'Puerta Estándar Simple',
      type: 'single_door',
    },
    shapes: [
      {
        id: 'outer-frame',
        layer: 0,
        position: { x: 0, y: 0 },
        role: 'frame',
        size: { height: { percent: 1 }, width: { percent: 1 } },
        style: {
          cornerRadius: 4,
          fill: 'material',
          stroke: '#333',
          strokeWidth: 2,
        },
        type: 'rect',
      },
      {
        id: 'glass-panel',
        layer: 1,
        position: { x: 60, y: 60 },
        role: 'glass',
        size: { height: 'fill', width: 'fill' },
        style: {
          cornerRadius: 2,
          fill: '#E0F7FA',
          opacity: 0.7,
          stroke: '#00838F',
          strokeWidth: 2,
        },
        type: 'rect',
      },
      {
        id: 'handle',
        layer: 2,
        position: { x: { percent: 0.9 }, y: { percent: 0.5 } },
        role: 'handle',
        size: { height: 25, width: 25 },
        style: {
          fill: '#C0C0C0',
          stroke: '#666',
          strokeWidth: 1,
        },
        type: 'circle',
      },
      {
        id: 'hinge-top',
        layer: 1,
        position: { x: 10, y: 30 },
        role: 'hinge',
        size: { height: 30, width: 15 },
        style: {
          fill: '#888',
          stroke: '#333',
          strokeWidth: 1,
        },
        type: 'rect',
      },
      {
        id: 'hinge-bottom',
        layer: 1,
        position: { x: 10, y: { percent: 0.9 } },
        role: 'hinge',
        size: { height: 30, width: 15 },
        style: {
          fill: '#888',
          stroke: '#333',
          strokeWidth: 1,
        },
        type: 'rect',
      },
    ],
    version: '1.0',
  };
}

/**
 * Seed model designs
 */
export async function seedModelDesigns(): Promise<SeedResult> {
  const result: SeedResult = {
    errors: [],
    seeded: 0,
    skipped: 0,
  };

  const designs = [
    {
      config: createFixedWindowDesign(),
      name: 'fixed-window-simple',
      nameEs: 'Ventana Fija Simple',
      type: 'fixed_window' as ModelType,
    },
    {
      config: createSlidingWindowHorizontalDesign(),
      name: 'sliding-window-horizontal-simple',
      nameEs: 'Ventana Corredera Horizontal',
      type: 'sliding_window_horizontal' as ModelType,
    },
    {
      config: createSingleDoorDesign(),
      name: 'single-door-simple',
      nameEs: 'Puerta Estándar Simple',
      type: 'single_door' as ModelType,
    },
  ];

  for (const design of designs) {
    try {
      // Check if design already exists
      const existing = await db.modelDesign.findUnique({
        where: { name: design.name },
      });

      if (existing) {
        result.skipped += 1;
        continue;
      }

      // Create new design
      await db.modelDesign.create({
        data: {
          config: design.config,
          displayOrder: result.seeded,
          isActive: true,
          name: design.name,
          nameEs: design.nameEs,
          type: design.type,
        },
      });

      result.seeded += 1;
    } catch (error) {
      result.errors.push({
        context: error,
        message: `Failed to seed design "${design.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return result;
}
