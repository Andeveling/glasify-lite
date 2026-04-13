'use client'

import { useMemo } from 'react'
import { parsePattern } from '@/domain/design'
import type { DesignRenderProps } from '@/domain/design'
import { cn } from '@/lib/utils'

const DEFAULT_FRAME_COLOR = '#e6e6e6'
const DEFAULT_GLASS_COLOR = '#87CEEB'
const GLASS_OPACITY = 0.6
const DEFAULT_SIZE = { width: 280, height: 210 }
const FRAME_PADDING = 8

function getFrameThickness(style: string): number {
  switch (style) {
    case 'double':
      return 6
    case 'premium':
      return 8
    default:
      return 4
  }
}

function getInnerDimensions(
  width: number,
  height: number,
  thickness: number,
): { innerWidth: number; innerHeight: number; innerX: number; innerY: number } {
  const innerX = FRAME_PADDING
  const innerY = FRAME_PADDING
  const innerWidth = width - FRAME_PADDING * 2
  const innerHeight = height - FRAME_PADDING * 2
  return { innerWidth, innerHeight, innerX, innerY }
}

function DesignRenderer({
  template,
  frameColor = DEFAULT_FRAME_COLOR,
  glassColor = DEFAULT_GLASS_COLOR,
  dimensions,
  size = DEFAULT_SIZE,
  showDimensions = false,
  className,
}: DesignRenderProps & { className?: string }) {
  const svgContent = useMemo(() => {
    const { width, height } = size
    const { innerWidth, innerHeight, innerX, innerY } = getInnerDimensions(
      width,
      height,
      getFrameThickness(template.frameConfig.profileStyle),
    )

    const panels = parsePattern(template.pattern)
    const firstPanel = panels[0]
    const panelWidth = firstPanel ? innerWidth * firstPanel.ratio : innerWidth

    return (
      <svg
        className={cn('w-full h-auto', className)}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
          >
            <path d="M 0 0 L 6 2 L 0 4 Z" fill={frameColor} />
          </marker>
        </defs>

        {/* Outer frame */}
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          fill="none"
          stroke={frameColor}
          strokeWidth={getFrameThickness(template.frameConfig.profileStyle)}
          rx={1}
        />

        {/* Inner area */}
        <rect
          x={innerX}
          y={innerY}
          width={innerWidth}
          height={innerHeight}
          fill="none"
          stroke={frameColor}
          strokeWidth={1}
        />

        {/* Panels: glass + dividers */}
        {panels.map((panel) => {
          const x = innerX + panel.index * panelWidth
          const isLast = panel.index === panels.length - 1

          return (
            <g key={panel.index}>
              {/* Glass pane */}
              <rect
                x={x + 2}
                y={innerY + 2}
                width={panelWidth - 4}
                height={innerHeight - 4}
                fill={glassColor}
                opacity={GLASS_OPACITY}
              />

              {/* Divider line between panels */}
              {!isLast && (
                <line
                  x1={x + panelWidth}
                  y1={innerY}
                  x2={x + panelWidth}
                  y2={innerY + innerHeight}
                  stroke={frameColor}
                  strokeWidth={2}
                />
              )}

              {/* Handle (only on movable panels) */}
              {template.showHandles && panel.type === 'movable' && (
                <>
                  <ellipse
                    cx={panel.index % 2 === 0 ? x + 6 : x + panelWidth - 6}
                    cy={innerY + innerHeight / 2}
                    rx={3}
                    ry={10}
                    fill={frameColor}
                    stroke={frameColor}
                    strokeWidth={0.5}
                  />
                </>
              )}

              {/* Opening arrow (only on movable panels) */}
              {template.showArrows && panel.type === 'movable' && (
                <line
                  x1={x + panelWidth * 0.3}
                  y1={innerY + innerHeight * 0.7}
                  x2={x + panelWidth * 0.7}
                  y2={innerY + innerHeight * 0.7}
                  stroke={frameColor}
                  strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                  markerStart="url(#arrowhead)"
                />
              )}
            </g>
          )
        })}

        {/* Optional dimensions */}
        {showDimensions && dimensions && (
          <g className="text-xs">
            {/* Width dimension */}
            <line
              x1={innerX}
              y1={height - 4}
              x2={innerX + innerWidth}
              y2={height - 4}
              stroke={frameColor}
              strokeWidth={1}
            />
            <line x1={innerX} y1={height - 8} x2={innerX} y2={height} stroke={frameColor} strokeWidth={1} />
            <line x1={innerX + innerWidth} y1={height - 8} x2={innerX + innerWidth} y2={height} stroke={frameColor} strokeWidth={1} />
            <text
              x={innerX + innerWidth / 2}
              y={height - 8}
              textAnchor="middle"
              fill={frameColor}
              fontSize={10}
            >
              {dimensions.widthMm}
            </text>

            {/* Height dimension */}
            <line
              x1={4}
              y1={innerY}
              x2={4}
              y2={innerY + innerHeight}
              stroke={frameColor}
              strokeWidth={1}
            />
            <line x1={0} y1={innerY} x2={8} y2={innerY} stroke={frameColor} strokeWidth={1} />
            <line x1={0} y1={innerY + innerHeight} x2={8} y2={innerY + innerHeight} stroke={frameColor} strokeWidth={1} />
            <text
              x={4}
              y={innerY + innerHeight / 2}
              textAnchor="middle"
              fill={frameColor}
              fontSize={10}
              transform={`rotate(-90, 4, ${innerY + innerHeight / 2})`}
            >
              {dimensions.heightMm}
            </text>
          </g>
        )}
      </svg>
    )
  }, [template, frameColor, glassColor, dimensions, showDimensions, size, className])

  return svgContent
}

export { DesignRenderer }
