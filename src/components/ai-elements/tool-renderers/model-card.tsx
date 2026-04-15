"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { toolRendererRegistry } from "../tool-registry"

export interface ModelInfo {
  id: string
  name: string
  description?: string
  supported_modality?: string[]
}

export const ModelCard = (output: unknown) => {
  const models = output as ModelInfo[]

  if (!Array.isArray(models)) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Card
          key={model.id}
          className={cn(
            "flex flex-col gap-2 py-4 transition-colors hover:bg-muted/50",
          )}
        >
          <CardHeader className="px-4 py-0">
            <CardTitle className="text-base">{model.name}</CardTitle>
          </CardHeader>
          {model.description && (
            <CardContent className="px-4 py-0">
              <p className="text-sm text-muted-foreground">{model.description}</p>
            </CardContent>
          )}
          {model.supported_modality && model.supported_modality.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4">
              {model.supported_modality.map((modality) => (
                <span
                  key={modality}
                  className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {modality}
                </span>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// Auto-register at module load time
toolRendererRegistry.register("listModels", ModelCard)