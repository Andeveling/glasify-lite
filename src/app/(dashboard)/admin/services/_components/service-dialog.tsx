/**
 * Service Dialog Component
 *
 * Modal dialog for creating and editing Service entities.
 * Wraps ServiceForm in a Dialog component.
 *
 * Pattern: Dialog-based CRUD (no separate pages)
 * Reason: Service form is simple and fits well in a modal
 *
 * Features:
 * - Optimistic updates with loading states
 * - Toast notifications
 * - Cache invalidation after mutations
 */
/** biome-ignore-all assist/source/useSortedKeys: TypeScript necesita que onMutate se defina primero para inferir el tipo del contexto que luego se usa en onError. */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Service, ServiceType, ServiceUnit } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createServiceSchema, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@/lib/validations/admin/service.schema';
import { api } from '@/trpc/react';

type ServiceDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ServiceDialog({ mode, open, onOpenChange, defaultValues }: ServiceDialogProps) {
  const utils = api.useUtils();
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
      fixed: 'unit',
      area: 'sqm',
      perimeter: 'ml',
    };

    form.setValue('unit', typeToUnitMap[ type ]);
  };

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        name: defaultValues.name,
        rate: defaultValues.rate.toNumber(),
        type: defaultValues.type,
        unit: defaultValues.unit,
      });
    } else if (open && mode === 'create') {
      form.reset({
        name: '',
        rate: 0,
        type: 'fixed',
        unit: 'unit',
      });
    }
  }, [ open, defaultValues, mode, form ]);

  // Create mutation with optimistic update
  const createMutation = api.admin.service.create.useMutation({
    onMutate: () => {
      toast.loading('Creando servicio...', { id: 'create-service' });
    },
    onError: (err) => {
      toast.error('Error al crear servicio', {
        description: err.message,
        id: 'create-service',
      });
    },
    onSuccess: () => {
      toast.success('Servicio creado correctamente', { id: 'create-service' });
      onOpenChange(false);
      form.reset();
    },
    onSettled: () => {
      // Invalidate cache and refresh server data
      void utils.admin.service.list.invalidate();
      router.refresh();
    },
  });

  // Update mutation with optimistic update
  const updateMutation = api.admin.service.update.useMutation({
    onMutate: () => {
      toast.loading('Actualizando servicio...', { id: 'update-service' });
    },
    onError: (err) => {
      toast.error('Error al actualizar servicio', {
        description: err.message,
        id: 'update-service',
      });
    },
    onSuccess: () => {
      toast.success('Servicio actualizado correctamente', { id: 'update-service' });
      onOpenChange(false);
      form.reset();
    },
    onSettled: () => {
      // Invalidate cache and refresh server data
      void utils.admin.service.list.invalidate();
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Crea un nuevo servicio adicional para cotizaciones'
              : 'Actualiza la información del servicio'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
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

            <DialogFooter>
              <Button disabled={isPending} onClick={() => onOpenChange(false)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
