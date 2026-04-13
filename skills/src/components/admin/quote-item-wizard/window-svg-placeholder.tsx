'use client'

import type * as React from 'react'
import { cn } from '@/lib/utils'

interface WindowSvgPlaceholderProps {
  width?: number
  height?: number
  className?: string
}

function WindowSvgPlaceholder({ width = 180, height = 120, className }: WindowSvgPlaceholderProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn('text-muted-foreground', className)}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="none"
        height={height}
        stroke="currentColor"
        strokeWidth={4}
        width={width}
        x={2}
        y={2}
      />
      <rect className="fill-muted" height={height - 16} width={width - 16} x={8} y={8} />
      <line
        stroke="currentColor"
        strokeWidth={2}
        x1={width / 2}
        x2={width / 2}
        y1={8}
        y2={height - 8}
      />
      <line
        stroke="currentColor"
        strokeWidth={2}
        x1={8}
        x2={width - 8}
        y1={height / 2}
        y2={height / 2}
      />
    </svg>
  )
}

export { WindowSvgPlaceholder }
