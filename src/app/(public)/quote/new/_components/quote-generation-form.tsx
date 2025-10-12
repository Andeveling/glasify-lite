'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import { PhoneInput } from '@/components/ui/phone-input';

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
 *   onSubmit={generateQuoteAction}
 *   onSuccess={(quoteId) => router.push(`/my-quotes/${quoteId}`)}
 * />
 * ```
 */
export default function QuoteGenerationForm({ onSubmit, onSuccess }: QuoteGenerationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCheckedCart, setHasCheckedCart] = useState(false);
  const { items: cartItems, clearCart, hydrated } = useCart();

  // React Hook Form with Zod resolver (MUST be before any conditional returns)
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

  // Redirect if cart is empty (only after hydration completes and only once)
  useEffect(() => {
    // Only check after hydration is complete
    if (!hydrated) {
      return;
    }

    // Skip if already checked (prevents multiple redirects)
    if (hasCheckedCart) {
      return;
    }

    // Mark as checked immediately to prevent duplicate checks
    setHasCheckedCart(true);

    // Wait one more tick to ensure cartItems has been updated from storage
    const timeoutId = setTimeout(() => {
      if (cartItems.length === 0) {
        toast.error('Carrito vacío', {
          description: 'Agrega items al carrito antes de generar una cotización',
        });
        router.push('/catalog');
      }
    }, 100); // Small delay to allow cartItems to sync

    return () => clearTimeout(timeoutId);
  }, [hydrated, hasCheckedCart, cartItems.length, router]);

  // Show loading state while cart is hydrating (AFTER all hooks)
  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex justify-end gap-4">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: QuoteGenerationFormValues) => {
    // Use toast.promise for better UX with loading, success, and error states
    await toast.promise(
      async () => {
        setIsSubmitting(true);

        try {
          // Call server action with form data and cart items
          const result = await onSubmit(values, cartItems);

          if (result.success && result.quoteId) {
            // Clear cart after successful quote generation
            clearCart();

            // Set redirecting state for visual feedback
            setIsRedirecting(true);

            // Call success callback or redirect
            if (onSuccess) {
              onSuccess(result.quoteId);
            } else {
              // Redirect to user's quotes page (not admin dashboard)
              router.push(`/my-quotes/${result.quoteId}`);
            }

            return result.quoteId; // Return value for toast.promise success
          } else {
            // Handle error from server action
            form.setError('root', {
              message: result.error ?? 'Error al generar la cotización',
            });

            throw new Error(result.error ?? 'Error al generar la cotización');
          }
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        error: (error) => {
          // Error state handled by toast.promise
          return error instanceof Error ? error.message : 'Error al generar la cotización';
        },
        loading: 'Generando cotización...',
        success: 'Cotización creada exitosamente. Redirigiendo...',
      }
    );
  };

  return (
    <Form {...form}>
      {/* Loading Overlay during redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-lg">Cotización Creada</p>
              <p className="text-muted-foreground text-sm">Redirigiendo a tu cotización...</p>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Cart Summary Info Card */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Items en el carrito</p>
              <p className="text-muted-foreground text-xs">
                {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} configurado
                {cartItems.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">Total</p>
              <p className="font-bold text-lg">
                {new Intl.NumberFormat('es-CO', {
                  currency: 'COP',
                  style: 'currency',
                }).format(cartItems.reduce((sum, item) => sum + item.subtotal, 0))}
              </p>
            </div>
          </div>
        </div>

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
                  <PhoneInput placeholder="Ej: +57 300 123 4567" {...field} disabled={isSubmitting} />
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
          <Button disabled={isSubmitting || isRedirecting} onClick={() => router.back()} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isSubmitting || isRedirecting || cartItems.length === 0} type="submit">
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              'Generar Cotización'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
