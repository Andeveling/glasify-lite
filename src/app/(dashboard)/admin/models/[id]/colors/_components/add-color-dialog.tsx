/**
 * Add Color Dialog Component
 *
 * Modal dialog for assigning colors to a model
 * - Visual color chips grid for selection
 * - Surcharge percentage input (0-100%)
 * - "Set as default" checkbox
 * - Form validation with Zod
 * - Optimistic UI with toast notifications
 *
 * Architecture:
 * - Client Component with Shadcn Dialog
 * - React Hook Form for form state
 * - tRPC mutation for assignment
 * - Two-step cache invalidation (invalidate + router.refresh)
 */

"use client";

import type { Color } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ColorChip } from "@/app/(dashboard)/admin/colors/_components/color-chip";
import { api } from "@/trpc/react";

// Form validation schema
const assignColorSchema = z.object({
  colorId: z.string().min(1, "Debes seleccionar un color"),
  surchargePercentage: z
    .number()
    .min(0, "El recargo debe ser mayor o igual a 0%")
    .max(100, "El recargo debe ser entre 0% y 100%"),
  isDefault: z.boolean(),
});

type AssignColorInput = z.infer<typeof assignColorSchema>;

type AddColorDialogProps = {
  modelId: string;
  availableColors: Color[];
  triggerLabel?: string;
};

/**
 * Dialog for adding a color to a model
 * Displays available colors in a visual grid
 */
export function AddColorDialog({
  modelId,
  availableColors,
  triggerLabel = "Agregar Color",
}: AddColorDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<AssignColorInput>({
    resolver: zodResolver(assignColorSchema),
    defaultValues: {
      colorId: "",
      surchargePercentage: 0,
      isDefault: false,
    },
  });

  const assignMutation = api.admin["model-colors"].assign.useMutation({
    onSuccess: () => {
      toast.success("Color asignado correctamente");
      void utils.admin["model-colors"].listByModel.invalidate();
      void utils.admin["model-colors"].getAvailableColors.invalidate();
      router.refresh();
      setOpen(false);
      form.reset();
      setSelectedColorId("");
    },
    onError: (error) => {
      toast.error(error.message || "Error al asignar color");
    },
  });

  const onSubmit = (data: AssignColorInput) => {
    assignMutation.mutate({
      modelId,
      ...data,
    });
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    form.setValue("colorId", colorId);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Color al Modelo</DialogTitle>
          <DialogDescription>
            Selecciona un color de la paleta y configura el recargo porcentual
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Color Selection Grid */}
            <FormField
              control={form.control as any}
              name="colorId"
              render={() => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-3">
                      {availableColors.length === 0 ? (
                        <p className="col-span-4 text-center text-muted-foreground">
                          No hay colores disponibles para asignar
                        </p>
                      ) : (
                        availableColors.map((color) => (
                          <button
                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary ${
                              selectedColorId === color.id
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                            key={color.id}
                            onClick={() => handleColorSelect(color.id)}
                            type="button"
                          >
                            <ColorChip hexCode={color.hexCode} size="lg" />
                            <span className="text-center text-xs font-medium">
                              {color.name}
                            </span>
                            {color.ralCode && (
                              <span className="text-muted-foreground text-xs">
                                {color.ralCode}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Surcharge Percentage Input */}
            <FormField
              control={form.control as any}
              name="surchargePercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recargo Porcentual *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        className="w-32"
                        max={100}
                        min={0}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
                        step={0.01}
                        type="number"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Recargo aplicado al precio base del modelo (0% - 100%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Set as Default Switch */}
            <FormField
              control={form.control as any}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Establecer como Color por Defecto
                    </FormLabel>
                    <FormDescription>
                      Este color se seleccionará automáticamente en nuevas
                      cotizaciones
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={assignMutation.isPending}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={assignMutation.isPending} type="submit">
                {assignMutation.isPending ? "Asignando..." : "Asignar Color"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
