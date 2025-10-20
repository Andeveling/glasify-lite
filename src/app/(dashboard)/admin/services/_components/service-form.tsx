/**
 * Service Form Component (US10 - T096)
 *
 * Reusable form for creating and editing Service entities.
 * Handles validation, submission, and error states.
 *
 * @see /specs/011-admin-catalog-management/ (User Story 10)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Service, ServiceType, ServiceUnit } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createServiceSchema, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@/lib/validations/admin/service.schema';
import { api } from '@/trpc/react';

type ServiceFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: Service;
};

type FormValues = {
  name: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: number;
};

/**
 * Service type options (Spanish labels)
 */
const SERVICE_TYPE_OPTIONS: { label: string; value: ServiceType; description: string }[] = [
  { description: 'Precio fijo independiente de dimensiones', label: 'Fijo', value: 'fixed' },
  { description: 'Calculado por área del producto (m²)', label: 'Área', value: 'area' },
  { description: 'Calculado por perímetro del producto (ml)', label: 'Perímetro', value: 'perimeter' },
];

export function ServiceForm({ mode, defaultValues }: ServiceFormProps) {
  const router = useRouter();

  // React Hook Form
  const form = useForm<FormValues>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      rate: defaultValues?.rate?.toNumber() ?? 0,
      type: defaultValues?.type ?? 'fixed',
      unit: defaultValues?.unit ?? 'unit',
    },
    resolver: zodResolver(createServiceSchema),
  });

  // Auto-assign unit based on service type
  const handleTypeChange = (type: ServiceType) => {
    form.setValue('type', type);

    // Map type to unit automatically
    const typeToUnitMap: Record<ServiceType, ServiceUnit> = {
      area: 'sqm',
      fixed: 'unit',
      perimeter: 'ml',
    };

    form.setValue('unit', typeToUnitMap[type]);
  };

  // Create mutation
  const createMutation = api.admin.service.create.useMutation({
    onError: (err) => {
      toast.error('Error al crear servicio', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Servicio creado correctamente');
      router.push('/admin/services');
      router.refresh();
    },
  });

  // Update mutation
  const updateMutation = api.admin.service.update.useMutation({
    onError: (err) => {
      toast.error('Error al actualizar servicio', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Servicio actualizado correctamente');
      router.push('/admin/services');
      router.refresh();
    },
  });

  // Handle form submission
  const handleSubmit = (formData: FormValues) => {
    if (mode === 'create') {
      createMutation.mutate(formData);
    } else if (defaultValues?.id) {
      updateMutation.mutate({
        data: formData,
        id: defaultValues.id,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Crea un nuevo servicio adicional para cotizaciones'
            : 'Actualiza la información del servicio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
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
                    Mínimo {MIN_NAME_LENGTH} caracteres, máximo {MAX_NAME_LENGTH}
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
                  <Select defaultValue={field.value} disabled={isPending} onValueChange={handleTypeChange}>
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
                            <span className="text-muted-foreground text-xs">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Determina cómo se calcula el costo del servicio (la unidad se asigna automáticamente)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Unit - Hidden field (auto-assigned by type) */}
            <FormField control={form.control} name="unit" render={({ field }) => <input type="hidden" {...field} />} />

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
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                    />
                  </FormControl>
                  <FormDescription>Costo del servicio por unidad (debe ser mayor a cero)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
              </Button>
              <Button
                disabled={isPending}
                onClick={() => router.push('/admin/services')}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
