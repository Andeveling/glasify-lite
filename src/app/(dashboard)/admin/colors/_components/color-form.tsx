/**
 * Color Form Component
 *
 * Form for creating/editing colors with real-time hex preview
 * - React Hook Form + Zod validation
 * - Fields: name, ralCode (optional), hexCode, isActive
 * - Real-time ColorChip preview
 * - Optimistic UI with toast notifications
 *
 * Architecture:
 * - Custom hooks handle form state and mutations
 * - ColorChip provides visual feedback
 * - Main component orchestrates composition
 */

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { ColorUpdateInput } from "@/lib/validations/color";
import { useColorForm } from "../_hooks/use-color-form";
import { ColorChip } from "./color-chip";

type ColorFormProps = {
  mode: "create" | "edit";
  defaultValues?: ColorUpdateInput & { id: string };
};

/**
 * Main color form component
 * Handles creation and editing of colors with validation
 */
export function ColorForm({ mode, defaultValues }: ColorFormProps) {
  const router = useRouter();
  const { form, onSubmit, isLoading } = useColorForm({
    defaultValues,
    mode,
  });

  const hexCode = form.watch("hexCode");

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Crear Nuevo Color" : "Editar Color"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Completa los datos del nuevo color para el catálogo"
                : "Modifica los datos del color existente"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Preview */}
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <div className="flex flex-col items-center gap-3">
                <ColorChip hexCode={hexCode ?? "#000000"} size="lg" />
                <p className="font-medium text-muted-foreground text-sm">
                  Vista previa del color
                </p>
              </div>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Color *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Blanco, Negro Mate, Gris Antracita"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre descriptivo del color (único en el sistema)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RAL Code Field */}
            <FormField
              control={form.control}
              name="ralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código RAL (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: RAL 9010, RAL 7016"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Código RAL estándar en formato "RAL XXXX"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hex Code Field */}
            <FormField
              control={form.control}
              name="hexCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Hex *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="#FFFFFF"
                      type="text"
                      {...field}
                      className="font-mono uppercase"
                      maxLength={7}
                    />
                  </FormControl>
                  <FormDescription>
                    Código hexadecimal del color (formato #RRGGBB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Switch */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado Activo</FormLabel>
                    <FormDescription>
                      Los colores activos están disponibles para asignar a
                      modelos
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
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            disabled={isLoading}
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={isLoading} type="submit">
            {getButtonLabel(isLoading, mode)}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/**
 * Get button label based on loading state and form mode
 */
function getButtonLabel(isLoading: boolean, mode: "create" | "edit"): string {
  if (isLoading) {
    return "Guardando...";
  }
  return mode === "create" ? "Crear Color" : "Guardar Cambios";
}
