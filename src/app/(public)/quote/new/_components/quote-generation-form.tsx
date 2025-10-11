'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCart } from '@/app/(public)/cart/_hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CartItem } from '@/types/cart.types';

// Validation constants (aligned with contract schema)
const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_PROJECT_ADDRESS_LENGTH = 200;
const MAX_POSTAL_CODE_LENGTH = 20;
const MAX_PHONE_LENGTH = 20;

/**
 * Quote generation form schema
 *
 * Zod schema as single source of truth for validation.
 * Validates project address fields required for quote generation.
 */
const quoteGenerationFormSchema = z.object({
  contactPhone: z.string().max(MAX_PHONE_LENGTH, 'Teléfono muy largo').optional(),
  projectCity: z.string().min(1, 'Ciudad es requerida').max(MAX_PROJECT_ADDRESS_LENGTH, 'Ciudad muy larga'),
  projectName: z.string().max(MAX_PROJECT_NAME_LENGTH, 'Nombre muy largo').optional(),
  projectPostalCode: z
    .string()
    .min(1, 'Código postal es requerido')
    .max(MAX_POSTAL_CODE_LENGTH, 'Código postal muy largo'),
  projectState: z.string().min(1, 'Estado/Provincia es requerido').max(MAX_PROJECT_ADDRESS_LENGTH, 'Estado muy largo'),
  projectStreet: z.string().min(1, 'Calle es requerida').max(MAX_PROJECT_ADDRESS_LENGTH, 'Calle muy larga'),
});

type QuoteGenerationFormValues = z.infer<typeof quoteGenerationFormSchema>;

type QuoteGenerationFormProps = {
  /** Server action for quote generation */
  onSubmit: (
    data: QuoteGenerationFormValues,
    cartItems: CartItem[]
  ) => Promise<{
    success: boolean;
    quoteId?: string;
    error?: string;
  }>;

  /** Callback when quote is successfully created */
  onSuccess?: (quoteId: string) => void;
};

/**
 * Quote Generation Form Component
 *
 * Renders a form for authenticated users to provide project details
 * and generate a formal quote from their cart items.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Progressive enhancement (works without JS via form action)
 * - Real-time validation with Spanish error messages
 * - Structured address fields (street, city, state, postal code)
 * - Optional project name and contact phone
 *
 * @example
 * ```tsx
 * <QuoteGenerationForm
 *   cartItems={cartItems}
 *   manufacturerId={manufacturerId}
 *   onSubmit={generateQuoteAction}
 *   onSuccess={(quoteId) => router.push(`/quotes/${quoteId}`)}
 * />
 * ```
 */
export default function QuoteGenerationForm({ onSubmit, onSuccess }: QuoteGenerationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items: cartItems, clearCart } = useCart();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Carrito vacío', {
        description: 'Agrega items al carrito antes de generar una cotización',
      });
      router.push('/catalog');
    }
  }, [cartItems.length, router]);

  // React Hook Form with Zod resolver
  const form = useForm<QuoteGenerationFormValues>({
    defaultValues: {
      contactPhone: '',
      projectCity: '',
      projectName: '',
      projectPostalCode: '',
      projectState: '',
      projectStreet: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
    resolver: zodResolver(quoteGenerationFormSchema),
  });

  const handleSubmit = async (values: QuoteGenerationFormValues) => {
    try {
      setIsSubmitting(true);

      // Call server action with form data and cart items
      // Server action will get manufacturerId from first cart item's model
      const result = await onSubmit(values, cartItems);

      if (result.success && result.quoteId) {
        toast.success('Cotización Creada', {
          description: 'Tu cotización ha sido generada exitosamente',
        });

        // Clear cart after successful quote generation
        clearCart();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.quoteId);
        } else {
          // Default: redirect to quote detail
          router.push(`/quotes/${result.quoteId}`);
        }
      } else {
        // Handle error from server action
        toast.error('Error', {
          description: result.error ?? 'Error al generar la cotización. Por favor intenta nuevamente.',
        });

        form.setError('root', {
          message: result.error ?? 'Error al generar la cotización',
        });
      }
    } catch {
      toast.error('Error', {
        description: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
      });

      form.setError('root', {
        message: 'Error al generar la cotización. Por favor intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Project Name (optional) */}
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proyecto (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Edificio Residencial Fase 1"
                  {...field}
                  disabled={isSubmitting}
                  maxLength={MAX_PROJECT_NAME_LENGTH}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Street */}
        <FormField
          control={form.control}
          name="projectStreet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calle *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Av. Principal 123"
                  {...field}
                  disabled={isSubmitting}
                  maxLength={MAX_PROJECT_ADDRESS_LENGTH}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Two-column grid for City and State */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Project City */}
          <FormField
            control={form.control}
            name="projectCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Bogotá"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={MAX_PROJECT_ADDRESS_LENGTH}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project State */}
          <FormField
            control={form.control}
            name="projectState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado/Provincia *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Cundinamarca"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={MAX_PROJECT_ADDRESS_LENGTH}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Two-column grid for Postal Code and Phone */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Project Postal Code */}
          <FormField
            control={form.control}
            name="projectPostalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 110111"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={MAX_POSTAL_CODE_LENGTH}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Phone (optional) */}
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono de Contacto (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: +57 300 123 4567"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={MAX_PHONE_LENGTH}
                    type="tel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Root error display */}
        {form.formState.errors.root && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-4">
          <Button disabled={isSubmitting} onClick={() => router.back()} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isSubmitting || cartItems.length === 0} type="submit">
            {isSubmitting ? 'Generando Cotización...' : 'Generar Cotización'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
