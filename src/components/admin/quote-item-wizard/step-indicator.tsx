'use client'

import { Check } from 'lucide-react'

interface StepIndicatorProps {
  totalSteps: number
  currentStep: number
  visitedSteps?: Set<number>
}

const STEP_LABELS = ['Dimensiones', 'Modelo', 'Material', 'Servicios', 'Confirmar'] as const

export function StepIndicator({
  totalSteps,
  currentStep,
  visitedSteps = new Set(),
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso del wizard" className="py-6">
      <ol className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, idx) => {
          const isActive = idx === currentStep
          const isCompleted = visitedSteps.has(idx) && idx < currentStep
          const stepKey = `step-${STEP_LABELS[idx]}-${idx}`

          return (
            <li key={stepKey} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                      : isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/50 text-muted-foreground'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{idx + 1}</span>}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  {STEP_LABELS[idx]}
                </span>
              </div>
              {idx < totalSteps - 1 && (
                <div
                  className={`h-[2px] w-12 mt-[-20px] transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
