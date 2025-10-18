'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { PhoneInput } from '@/components/ui/phone-input';

/**
 * Contact information schema matching backend validation
 * Phone: E164 format (international format with country code)
 * Email: Automatically filled from session, not editable
 */
const contactSchema = z.object({
  contactEmail: z.email('Correo electrónico inválido'),
  contactPhone: z.string().min(1, 'El teléfono es requerido'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormValues) => void;
  defaultValues?: Partial<ContactFormValues>;
  isLoading?: boolean;
}

/**
 * Unified modal to capture or confirm contact information before sending quote
 * - Email: Auto-filled from authenticated user session (read-only)
 * - Phone: International format input with country selector (PhoneInput component)
 * - Pre-fills existing phone data if available
 *
 * @example
 * ```tsx
 * <ContactInfoModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={(data) => sendQuote(data)}
 *   defaultValues={{ contactPhone: quote.contactPhone }}
 *   isLoading={isPending}
 * />
 * ```
 */
export function ContactInfoModal({ open, onClose, onSubmit, defaultValues, isLoading = false }: ContactInfoModalProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? '';

  const form = useForm<ContactFormValues>({
    defaultValues: {
      contactEmail: userEmail,
      contactPhone: defaultValues?.contactPhone ?? '',
    },
    resolver: zodResolver(contactSchema),
  });

  // Update email when session changes or modal opens
  useEffect(() => {
    if (open && userEmail) {
      form.setValue('contactEmail', userEmail);
    }
  }, [ open, userEmail, form ]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Información de Contacto</DialogTitle>
          <DialogDescription>
            Confirma tu información de contacto para que el fabricante pueda responder tu cotización.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email - Read-only, from session */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      disabled={isLoading}
                      placeholder="tu@email.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este es tu correo registrado, pero puedes modificarlo si deseas que la respuesta llegue a otro
                    contacto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone - International format input */}
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      defaultCountry="CO"
                      disabled={isLoading}
                      placeholder="Ingresa tu número de teléfono"
                    />
                  </FormControl>
                  <FormDescription>
                    Selecciona tu país y escribe tu número. Ejemplo: 300 123 4567 (Colombia)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button disabled={isLoading} onClick={handleClose} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? 'Enviando...' : 'Enviar Cotización'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
