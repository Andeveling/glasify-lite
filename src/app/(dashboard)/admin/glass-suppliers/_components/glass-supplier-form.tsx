/**
 * Glass Supplier Form Component (US5 - T038)
 *
 * Reusable form for creating and editing GlassSupplier entities.
 * Handles validation, submission, and error states.
 *
 * @see /specs/011-admin-catalog-management/ (User Story 5)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { GlassSupplier } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createGlassSupplierSchema,
  MAX_CODE_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  MIN_CODE_LENGTH,
  MIN_COUNTRY_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PHONE_LENGTH,
} from '@/lib/validations/admin/glass-supplier.schema';
import { api } from '@/trpc/react';

type GlassSupplierFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: GlassSupplier;
};

type FormValues = {
  name: string;
  code?: string;
  country?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  isActive?: boolean;
};

export function GlassSupplierForm({ mode, defaultValues }: GlassSupplierFormProps) {
  const router = useRouter();

  // React Hook Form
  const form = useForm<FormValues>({
    defaultValues: {
      code: defaultValues?.code ?? '',
      contactEmail: defaultValues?.contactEmail ?? '',
      contactPhone: defaultValues?.contactPhone ?? '',
      country: defaultValues?.country ?? '',
      isActive: defaultValues?.isActive ?? true,
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? '',
      website: defaultValues?.website ?? '',
    },
    resolver: zodResolver(createGlassSupplierSchema),
  });

  // Create mutation
  const createMutation = api.admin['glass-supplier'].create.useMutation({
    onError: (err: { message?: string }) => {
      toast.error('Error al crear proveedor', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor creado', {
        description: 'El proveedor se creó correctamente',
      });
      router.push('/admin/glass-suppliers');
      router.refresh();
    },
  });

  // Update mutation
  const updateMutation = api.admin['glass-supplier'].update.useMutation({
    onError: (err: { message?: string }) => {
      toast.error('Error al actualizar proveedor', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor actualizado', {
        description: 'Los cambios se guardaron correctamente',
      });
      router.push('/admin/glass-suppliers');
      router.refresh();
    },
  });

  // Handle form submission
  const handleSubmit = (formData: FormValues) => {
    // Clean up optional fields (convert empty strings to undefined)
    const cleanedData = {
      code: formData.code?.trim() || undefined,
      contactEmail: formData.contactEmail?.trim() || undefined,
      contactPhone: formData.contactPhone?.trim() || undefined,
      country: formData.country?.trim() || undefined,
      isActive: formData.isActive,
      name: formData.name,
      notes: formData.notes?.trim() || undefined,
      website: formData.website?.trim() || undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(cleanedData);
    } else if (defaultValues?.id) {
      updateMutation.mutate({
        data: cleanedData,
        id: defaultValues.id,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nuevo Proveedor de Vidrio' : 'Editar Proveedor de Vidrio'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Crea un nuevo fabricante de vidrio'
            : 'Actualiza la información del proveedor de vidrio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información Básica</h3>

              {/* Supplier Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Proveedor *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        maxLength={MAX_NAME_LENGTH}
                        placeholder="Ej: Guardian Glass, Saint-Gobain, Pilkington"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre del fabricante de vidrio ({MIN_NAME_LENGTH}-{MAX_NAME_LENGTH} caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Supplier Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        maxLength={MAX_CODE_LENGTH}
                        placeholder="Ej: GRD, SGB, PLK"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Código corto único ({MIN_CODE_LENGTH}-{MAX_CODE_LENGTH} caracteres, mayúsculas y números)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        maxLength={MAX_COUNTRY_LENGTH}
                        placeholder="Ej: USA, Germany, China"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      País donde está basado el proveedor ({MIN_COUNTRY_LENGTH}-{MAX_COUNTRY_LENGTH} caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información de Contacto</h3>

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="https://www.example.com"
                        type="url"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>URL del sitio web oficial (debe comenzar con http:// o https://)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Email */}
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contacto (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="contacto@proveedor.com"
                        type="email"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Email para órdenes e inquietudes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Phone */}
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Contacto (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        maxLength={MAX_PHONE_LENGTH}
                        placeholder="+1 555 0123 4567"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Número de teléfono de contacto ({MIN_PHONE_LENGTH}-{MAX_PHONE_LENGTH} caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información Adicional</h3>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isPending}
                        placeholder="Información adicional sobre el proveedor..."
                        rows={4}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Notas o información adicional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} disabled={isPending} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Proveedor Activo</FormLabel>
                      <FormDescription>
                        Los proveedores activos están disponibles para asignar a nuevos tipos de vidrio
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === 'create' ? 'Crear Proveedor' : 'Guardar Cambios'}
              </Button>
              <Button disabled={isPending} onClick={() => router.back()} type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
