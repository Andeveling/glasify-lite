"use client"

import { useMemo } from "react"
import type { DoorRenderProps, DoorTemplateConfig } from "@/domain/door"
import { cn } from "@/lib/utils"

const GLASS_OPACITY = 0.7
const DEFAULT_SIZE = { width: 200, height: 280 }
const FRAME_PADDING = 8
const HINGE_WIDTH = 6
const HANDLE_WIDTH = 6
const HANDLE_HEIGHT = 24

function getFrameThickness(style: string): number {
  switch (style) {
    case "double":
      return 6
    case "premium":
      return 8
    default:
      return 4
  }
}

function getHingeSide(openingType: string): "left" | "right" {
  if (openingType.includes("left")) return "left"
  return "right"
}

function getArcDirection(openingType: string): "cw" | "ccw" {
  if (openingType === "left_interior" || openingType === "left_exterior") {
    return "cw"
  }
  return "ccw"
}

function isInterior(openingType: string): boolean {
  return openingType.includes("interior")
}

function DoorRenderer({
  template,
  frameColor,
  glassColor,
  size = DEFAULT_SIZE,
  showOpeningArc = true,
  className,
}: DoorRenderProps) {
  const svgContent = useMemo(() => {
    const fc = frameColor ?? template.frameColor
    const gc = glassColor ?? template.glassColor
    const { width, height } = size
    const frameThickness = getFrameThickness(template.frameConfig.profileStyle)

    const hingeSide = getHingeSide(template.openingType)
    const interior = isInterior(template.openingType)
    const arcDirection = getArcDirection(template.openingType)

    const glassX = FRAME_PADDING + frameThickness
    const glassY = FRAME_PADDING + frameThickness
    const glassWidth = width - FRAME_PADDING * 2 - frameThickness * 2
    const glassHeight = height - FRAME_PADDING * 2 - frameThickness * 2

    const handleSide = hingeSide === "left" ? "right" : "left"
    const handleX = handleSide === "left"
      ? glassX + 10
      : glassX + glassWidth - 10 - HANDLE_WIDTH

    const traversalLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []

    if (template.traverseStyle === "horizontal" || template.traverseStyle === "grid") {
      for (let i = 1; i <= template.traverseCount; i++) {
        const y = glassY + (glassHeight * i) / (template.traverseCount + 1)
        traversalLines.push({ x1: glassX + 2, y1: y, x2: glassX + glassWidth - 2, y2: y })
      }
    }

    if (template.traverseStyle === "vertical" || template.traverseStyle === "grid") {
      const vCount = template.traverseStyle === "grid" ? 1 : template.traverseCount
      for (let i = 1; i <= vCount; i++) {
        const x = glassX + (glassWidth * i) / (vCount + 1)
        traversalLines.push({ x1: x, y1: glassY + 2, x2: x, y2: glassY + glassHeight - 2 })
      }
    }

    const arcPath = showOpeningArc
      ? (() => {
          const cx = hingeSide === "left" ? glassX : glassX + glassWidth
          const cy = glassY + glassHeight / 2
          const r = glassHeight * 0.7
          const startAngle = hingeSide === "left" ? 90 : 90
          const endAngle = hingeSide === "left" ? 0 : 180

          if (arcDirection === "cw") {
            return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
          } else {
            return `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx - r} ${cy}`
          }
        })()
      : null

    const hingePositions = [
      glassY + glassHeight * 0.2,
      glassY + glassHeight * 0.5,
      glassY + glassHeight * 0.8,
    ]

    return (
      <svg
        className={cn("w-full h-auto", className)}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={template.name}
      >
        <title>{template.name}</title>

        {showOpeningArc && arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke={fc}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.5}
          />
        )}

        <rect
          x={FRAME_PADDING}
          y={FRAME_PADDING}
          width={width - FRAME_PADDING * 2}
          height={height - FRAME_PADDING * 2}
          fill={fc}
        />

        <rect
          x={glassX}
          y={glassY}
          width={glassWidth}
          height={glassHeight}
          fill={gc}
          opacity={GLASS_OPACITY}
        />

        {traversalLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={fc}
            strokeWidth={2}
          />
        ))}

        {hingeSide === "left"
          ? hingePositions.map((y, i) => (
              <rect
                key={i}
                x={glassX - HINGE_WIDTH - 2}
                y={y - 4}
                width={HINGE_WIDTH}
                height={8}
                fill={fc}
                rx={1}
              />
            ))
          : hingePositions.map((y, i) => (
              <rect
                key={i}
                x={glassX + glassWidth + 2}
                y={y - 4}
                width={HINGE_WIDTH}
                height={8}
                fill={fc}
                rx={1}
              />
            ))}

        {template.handleStyle === "lever" && (
          <rect
            x={handleX}
            y={glassY + glassHeight / 2 - HANDLE_HEIGHT / 2}
            width={HANDLE_WIDTH}
            height={HANDLE_HEIGHT}
            fill={fc}
            rx={HANDLE_WIDTH / 2}
          />
        )}

        {template.handleStyle === "knob" && (
          <circle
            cx={handleX + HANDLE_WIDTH / 2}
            cy={glassY + glassHeight / 2}
            r={8}
            fill={fc}
          />
        )}

        {template.handleStyle === "pull" && (
          <ellipse
            cx={handleX + HANDLE_WIDTH / 2}
            cy={glassY + glassHeight / 2}
            rx={HANDLE_WIDTH / 2}
            ry={12}
            fill={fc}
          />
        )}

        {template.showLock && (
          <circle
            cx={handleX + HANDLE_WIDTH / 2}
            cy={glassY + glassHeight / 2 + HANDLE_HEIGHT / 2 + 8}
            r={3}
            fill={fc}
          />
        )}

        <rect
          x={FRAME_PADDING}
          y={FRAME_PADDING}
          width={width - FRAME_PADDING * 2}
          height={height - FRAME_PADDING * 2}
          fill="none"
          stroke={fc}
          strokeWidth={frameThickness}
          rx={1}
        />
      </svg>
    )
  }, [template, frameColor, glassColor, size, showOpeningArc, className])

  return svgContent
}

export { DoorRenderer }
