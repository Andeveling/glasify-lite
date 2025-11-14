/**
 * Profile Supplier Dialog Component
 *
 * Modal dialog for creating and editing ProfileSupplier entities.
 *
 * Pattern: Dialog-based CRUD (no separate pages)
 * Reason: ProfileSupplier form is simple and fits well in a modal
 *
 * Architecture (SOLID):
 * - This component focuses on UI composition and user interaction
 * - Form state management delegated to useProfileSupplierForm hook
 * - Mutation logic delegated to useProfileSupplierMutations hook
 * - Follows Single Responsibility Principle
 *
 * Features:
 * - Optimistic updates with loading states
 * - Toast notifications
 * - Cache invalidation after mutations
 */

"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import type { MaterialType, ProfileSupplier } from "@prisma/client";
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from "@/lib/validations/admin/profile-supplier.schema";
import { useProfileSupplierForm } from "../_hooks/use-profile-supplier-form";
import { useProfileSupplierMutations } from "../_hooks/use-profile-supplier-mutations";

type ProfileSupplierDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: ProfileSupplier;
};

/**
 * Material type options (Spanish labels)
 */
const MATERIAL_TYPE_OPTIONS: { label: string; value: MaterialType }[] = [
  { label: "PVC", value: "PVC" },
  { label: "Aluminio", value: "ALUMINUM" },
  { label: "Madera", value: "WOOD" },
  { label: "Mixto", value: "MIXED" },
];

export function ProfileSupplierDialog({
  mode,
  open,
  onOpenChange,
  defaultValues,
}: ProfileSupplierDialogProps) {
  // Custom hooks for separation of concerns
  const { form } = useProfileSupplierForm({ defaultValues, mode, open });

  const { handleCreate, handleUpdate, isPending } = useProfileSupplierMutations(
    {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    }
  );

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
            {mode === "create"
              ? "Nuevo Proveedor de Perfiles"
              : "Editar Proveedor de Perfiles"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crea un nuevo proveedor de perfiles para ventanas y puertas"
              : "Actualiza la información del proveedor de perfiles"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Supplier Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nombre del Proveedor *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full"
                      disabled={isPending}
                      maxLength={MAX_NAME_LENGTH}
                      placeholder="Ej: Rehau, Deceuninck, Azembla"
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

            {/* Material Type */}
            <FormField
              control={form.control}
              name="materialType"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tipo de Material *</FormLabel>
                  <Select
                    defaultValue={field.value}
                    disabled={isPending}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo de material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MATERIAL_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Material principal del proveedor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full resize-none"
                      disabled={isPending}
                      maxLength={500}
                      placeholder="Información adicional sobre el proveedor (opcional)"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Máximo 500 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={isPending}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Proveedor Activo</FormLabel>
                    <FormDescription>
                      El proveedor estará disponible para selección en
                      cotizaciones
                    </FormDescription>
                  </div>
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
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === "create" ? "Crear Proveedor" : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
