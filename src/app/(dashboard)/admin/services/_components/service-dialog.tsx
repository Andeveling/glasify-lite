/**
 * Service Dialog Component
 *
 * Modal dialog for creating and editing Service entities.
 * Wraps ServiceForm in a Dialog component.
 *
 * Pattern: Dialog-based CRUD (no separate pages)
 * Reason: Service form is simple and fits well in a modal
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Service, ServiceType, ServiceUnit } from '@prisma/client';
import { Loader2 } from 'lucide-react';
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

/**
 * Service unit options (Spanish labels)
 */
const SERVICE_UNIT_OPTIONS: { label: string; value: ServiceUnit; description: string }[] = [
  { description: 'Precio por unidad', label: 'Unidad', value: 'unit' },
  { description: 'Precio por metro cuadrado', label: 'm² (metros cuadrados)', value: 'sqm' },
  { description: 'Precio por metro lineal', label: 'ml (metros lineales)', value: 'ml' },
];

export function ServiceDialog({ mode, open, onOpenChange, defaultValues }: ServiceDialogProps) {
  const utils = api.useUtils();

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

  // Create mutation
  const createMutation = api.admin.service.create.useMutation({
    onError: (err) => {
      toast.error('Error al crear servicio', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Servicio creado correctamente');
      onOpenChange(false);
      void utils.admin.service.list.invalidate();
      form.reset();
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
      onOpenChange(false);
      void utils.admin.service.list.invalidate();
      form.reset();
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
                <FormItem>
                  <FormLabel>Nombre del Servicio *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
                <FormItem>
                  <FormLabel>Tipo de Servicio *</FormLabel>
                  <Select defaultValue={field.value} disabled={isPending} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormDescription>Determina cómo se calcula el costo del servicio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de Medida *</FormLabel>
                  <Select defaultValue={field.value} disabled={isPending} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground text-xs">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Unidad en la que se factura el servicio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Rate */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarifa *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
