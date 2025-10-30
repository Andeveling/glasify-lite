/**
 * Step 3: Glass Solution Selector
 * Card grid for selecting glass solution with icons
 */

"use client";

import type { UseFormReturn } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Layers,
  Shield,
  Snowflake,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { WizardFormData } from "../../../_utils/wizard-form.utils";

type GlassSolution = {
  id: string;
  key: string;
  name: string;
  nameEs: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
};

type GlassStepProps = {
  form: UseFormReturn<WizardFormData>;
  availableSolutions: GlassSolution[];
};

/**
 * Icon mapping for glass solutions
 * Maps icon names from DB to Lucide icon components
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Snowflake,
  Volume2,
  Zap,
  Sparkles,
  Home,
  Layers,
};

/**
 * Get Lucide icon component by name
 * Falls back to Layers icon if icon name not found
 */
function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) {
    return Layers;
  }
  return ICON_MAP[iconName] ?? Layers;
}

/**
 * GlassStep Component
 * Step 3 of wizard - glass solution selection
 */
export function GlassStep({ form, availableSolutions }: GlassStepProps) {
  const selectedSolutionId = form.watch("glassSolutionId");
  const error = form.formState.errors.glassSolutionId;

  const handleSolutionSelect = (solutionId: string) => {
    form.setValue("glassSolutionId", solutionId, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-base">Tipo de vidrio</h3>
        <p className="text-muted-foreground text-sm">
          Selecciona la solución de vidrio que mejor se adapte a tus necesidades
        </p>
      </div>

      <RadioGroup
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        onValueChange={handleSolutionSelect}
        value={selectedSolutionId}
      >
        {availableSolutions.map((solution) => {
          const Icon = getIconComponent(solution.icon);
          const isSelected = selectedSolutionId === solution.id;

          return (
            <Label
              className="cursor-pointer"
              htmlFor={`solution-${solution.id}`}
              key={solution.id}
            >
              <Card
                className={cn(
                  "transition-all hover:border-primary",
                  isSelected && "border-primary bg-primary/5",
                  error && !isSelected && "border-destructive"
                )}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Icon className="h-6 w-6 text-primary" />
                    <RadioGroupItem
                      className="min-h-[44px] min-w-[44px]"
                      id={`solution-${solution.id}`}
                      value={solution.id}
                    />
                  </div>
                  <CardTitle className="text-base">{solution.nameEs}</CardTitle>
                </CardHeader>
                {solution.description && (
                  <CardContent>
                    <CardDescription className="text-sm">
                      {solution.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      {error && (
        <p
          className="text-destructive text-sm"
          id="glass-solution-error"
          role="alert"
        >
          {error.message}
        </p>
      )}

      {availableSolutions.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No hay soluciones de vidrio disponibles para este modelo.
          </p>
        </div>
      )}
    </div>
  );
}
