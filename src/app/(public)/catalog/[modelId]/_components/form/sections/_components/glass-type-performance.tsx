'use client'

import { Shield, Snowflake, Volume2 } from 'lucide-react'
import { PerformanceBar } from '@/components/ui/performance-bar'

/**
 * Glass Type Performance Component (Molecule)
 *
 * Displays performance indicators (security, thermal, acoustic) as visual bars.
 * Atomic Design: Molecule that composes multiple PerformanceBar atoms.
 *
 * ## Visual Layout
 * ```
 * 🛡️ [████████░░] 4/5  <- Security
 * ❄️  [██████████] 5/5  <- Thermal
 * 🔊 [██████░░░░] 3/5  <- Acoustic
 * ```
 */

type GlassTypePerformanceProps = {
  acoustic: number
  security: number
  thermal: number
}

export function GlassTypePerformance({ acoustic, security, thermal }: GlassTypePerformanceProps) {
  return (
    <div className="w-full space-y-2">
      <PerformanceBar
        icon={Shield}
        max={5}
        tooltip="Protección contra impactos y roturas"
        value={security}
      />
      <PerformanceBar
        icon={Snowflake}
        max={5}
        tooltip="Aislamiento y eficiencia energética"
        value={thermal}
      />
      <PerformanceBar
        icon={Volume2}
        max={5}
        tooltip="Reducción de ruido exterior"
        value={acoustic}
      />
    </div>
  )
}
