'use client';

/**
 * Design Renderer Component
 *
 * Renders AdaptedDesign using Konva canvas library.
 *
 * Architecture:
 * - Client Component (uses Konva which requires browser APIs)
 * - React.memo for performance optimization
 * - Lazy loading with Intersection Observer (planned for next iteration)
 * - Error boundary integration for render failures
 *
 * Props:
 * - design: AdaptedDesign with all values in px
 * - width: Container width in px
 * - height: Container height in px
 * - onShapeClick?: Optional click handler for shapes
 */

import React from 'react';
import { Circle, Layer, Line, Rect, Stage } from 'react-konva';
import type { AdaptedDesign } from '@/lib/design/types';

/**
 * Props for DesignRenderer component
 */
type DesignRendererProps = {
  className?: string;
  design: AdaptedDesign;
  height: number;
  onShapeClick?: (shapeId: string) => void;
  width: number;
};

/**
 * Renders a design using Konva canvas
 *
 * @param props - Component props with design and dimensions
 * @returns Konva Stage with rendered design
 */
function DesignRendererComponent(props: DesignRendererProps) {
  const { className, design, height, onShapeClick, width } = props;

  // Sort shapes by layer (z-index)
  const sortedShapes = [...design.shapes].sort((a, b) => a.layer - b.layer);

  return (
    <div aria-label="Diseño de modelo" className={className} role="img">
      <Stage height={height} width={width}>
        <Layer>
          {sortedShapes.map((shape, index) => {
            const shapeId = `${shape.type}-${shape.role}-${index}`;

            // Common props for all shapes
            const commonProps = {
              onClick: () => onShapeClick?.(shapeId),
              opacity: shape.style.opacity ?? 1,
              stroke: shape.style.stroke,
              strokeWidth: shape.style.strokeWidth,
            };

            // Render based on shape type
            switch (shape.type) {
              case 'rect':
                return (
                  <Rect
                    key={shapeId}
                    {...commonProps}
                    cornerRadius={shape.style.cornerRadius}
                    fill={shape.style.fill}
                    height={shape.height}
                    width={shape.width}
                    x={shape.x}
                    y={shape.y}
                  />
                );

              case 'circle':
                return (
                  <Circle
                    key={shapeId}
                    {...commonProps}
                    fill={shape.style.fill}
                    radius={shape.width / 2}
                    x={shape.x + shape.width / 2}
                    y={shape.y + shape.height / 2}
                  />
                );

              case 'line':
                return (
                  <Line
                    key={shapeId}
                    {...commonProps}
                    points={[shape.x, shape.y, shape.x + shape.width, shape.y + shape.height]}
                    stroke={shape.style.stroke ?? shape.style.fill}
                  />
                );

              case 'path':
                // For now, path rendering is simplified
                // TODO: Add proper path data parsing
                return (
                  <Rect
                    key={shapeId}
                    {...commonProps}
                    fill={shape.style.fill}
                    height={shape.height}
                    width={shape.width}
                    x={shape.x}
                    y={shape.y}
                  />
                );

              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
}

/**
 * Memoized version of DesignRenderer for performance
 * Only re-renders when design, width, or height changes
 */
export const DesignRenderer = React.memo(DesignRendererComponent);
