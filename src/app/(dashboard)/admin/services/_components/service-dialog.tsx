/**
 * Service Dialog Component
 *
 * Modal dialog for creating and editing Service entities.
 * Wraps ServiceForm in a Dialog component.
 *
 * Pattern: Dialog-based CRUD (no separate pages)
 * Reason: Service form is simple and fits well in a modal
 *
 * Architecture (SOLID):
 * - This component focuses on UI composition and user interaction
 * - Form state management delegated to useServiceForm hook
 * - Mutation logic delegated to useServiceMutations hook
 * - Follows Single Responsibility Principle
 *
 * Features:
 * - Optimistic updates with loading states
 * - Toast notifications
 * - Cache invalidation after mutations
 */

"use client";

import type { Service, ServiceType } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from "@/lib/validations/admin/service.schema";
import { useServiceForm } from "../_hooks/use-service-form";
import { useServiceMutations } from "../_hooks/use-service-mutations";

type ServiceDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Service;
};

/**
 * Service type options (Spanish labels)
 */
const SERVICE_TYPE_OPTIONS: {
  label: string;
  value: ServiceType;
  description: string;
}[] = [
  {
    description: "Precio fijo independiente de dimensiones",
    label: "Fijo",
    value: "fixed",
  },
  {
    description: "Calculado por área del producto (m²)",
    label: "Área",
    value: "area",
  },
  {
    description: "Calculado por perímetro del producto (ml)",
    label: "Perímetro",
    value: "perimeter",
  },
];

export function ServiceDialog({
  mode,
  open,
  onOpenChange,
  defaultValues,
}: ServiceDialogProps) {
  // Custom hooks for separation of concerns
  const { form, handleTypeChange } = useServiceForm({
    defaultValues,
    mode,
    open,
  });

  const { handleCreate, handleUpdate, isPending } = useServiceMutations({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  // Handle form submission - routes to create or update
  const handleSubmit = (formData: Parameters<typeof handleCreate>[0]) => {
    if (mode === "create") {
      handleCreate(formData);
    } else if (defaultValues?.id) {
      handleUpdate(defaultValues.id, formData);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuevo Servicio" : "Editar Servicio"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crea un nuevo servicio adicional para cotizaciones"
              : "Actualiza la información del servicio"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Service Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nombre del Servicio *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full"
                      disabled={isPending}
                      maxLength={MAX_NAME_LENGTH}
                      placeholder="Ej: Instalación, Entrega, Medición"
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo {MIN_NAME_LENGTH} caracteres, máximo{" "}
                    {MAX_NAME_LENGTH}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tipo de Servicio *</FormLabel>
                  <Select
                    defaultValue={field.value}
                    disabled={isPending}
                    onValueChange={handleTypeChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo de cálculo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Determina cómo se calcula el costo del servicio (la unidad
                    se asigna automáticamente)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Unit - Hidden field (auto-assigned by type) */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {/* Service Rate */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tarifa *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full"
                      disabled={isPending}
                      min="0.01"
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                    />
                  </FormControl>
                  <FormDescription>
                    Costo del servicio por unidad (debe ser mayor a cero)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Crear Servicio" : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
