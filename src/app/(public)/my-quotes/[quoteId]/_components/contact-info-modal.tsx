'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import { Spinner } from '@/components/ui/spinner';

/**
 * Contact information schema matching backend validation
 * Phone: Colombian format (+57) or US format (+1), 10-15 digits
 * Email: Optional but must be valid if provided
 */
const contactSchema = z.object({
  contactEmail: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  contactPhone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Formato de teléfono inválido. Ejemplo: +573001234567 o +12125551234'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormValues) => void;
  defaultValues?: Partial<ContactFormValues>;
  isLoading?: boolean;
  /** Whether the quote is being redirected after successful send */
  isRedirecting?: boolean;
}

/**
 * Modal to capture or confirm contact information before sending quote
 * Pre-fills existing contact data if available
 * Validates phone format (Colombian/US) and optional email
 */
export function ContactInfoModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
  isLoading = false,
  isRedirecting = false,
}: ContactInfoModalProps) {
  const form = useForm<ContactFormValues>({
    defaultValues: {
      contactEmail: defaultValues?.contactEmail ?? '',
      contactPhone: defaultValues?.contactPhone ?? '',
    },
    resolver: zodResolver(contactSchema),
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const handleClose = () => {
    if (!(isLoading || isRedirecting)) {
      form.reset();
      onClose();
    }
  };

  return (
    <>
      {/* Redirecting Overlay (shows after successful send, before redirect) */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-lg">Cotización Enviada</p>
              <p className="text-muted-foreground text-sm">Actualizando vista...</p>
            </div>
          </div>
        </div>
      )}

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
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+573001234567" {...field} autoComplete="tel" disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Incluye el código de país. Ejemplo: +57 para Colombia, +1 para EE.UU.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tu@email.com"
                        type="email"
                        {...field}
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Email alternativo para recibir respuestas del fabricante.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button disabled={isLoading} onClick={handleClose} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Cotización'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
