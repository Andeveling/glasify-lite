/**
 * Quote Generation Drawer Component
 *
 * Drawer component that displays the quote generation form.
 * Triggered from CartSummary when user clicks "Generate Quote".
 *
 * Features:
 * - Compact drawer UI (bottom drawer on mobile, right drawer on desktop)
 * - React Hook Form with Zod validation
 * - toast.promise for feedback
 * - Loading states and redirecting overlay
 * - Cart summary visible in drawer
 * - Auto-closes and redirects on success
 * - Real-time session verification (prevents stale cache issues)
 *
 * @module app/(public)/cart/_components/quote-generation-drawer
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { generateQuoteFromCartAction } from "@/app/_actions/quote.actions";
import { DeliveryAddressPicker } from "@/app/(dashboard)/admin/quotes/_components/delivery-address-picker";
import { useCart } from "@/app/(public)/cart/_hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import { useTenantConfig } from "@/providers/tenant-config-provider";

// ============================================================================
// Validation Schema
// ============================================================================

const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_PROJECT_ADDRESS_LENGTH = 200;
const MAX_PHONE_LENGTH = 20;

const quoteGenerationFormSchema = z.object({
  contactPhone: z
    .string()
    .max(MAX_PHONE_LENGTH, "Teléfono muy largo")
    .optional(),
  deliveryAddress: z
    .object({
      city: z.string().nullish(),
      country: z.string().nullish(),
      district: z.string().nullish(),
      label: z.string().nullish(),
      latitude: z.number().nullish(),
      longitude: z.number().nullish(),
      postalCode: z.string().nullish(),
      reference: z.string().nullish(),
      region: z.string().nullish(),
      street: z.string().nullish(),
    })
    .optional(),
  projectCity: z
    .string()
    .min(1, "Ciudad es requerida")
    .max(MAX_PROJECT_ADDRESS_LENGTH, "Ciudad muy larga"),
  projectName: z
    .string()
    .max(MAX_PROJECT_NAME_LENGTH, "Nombre muy largo")
    .optional(),
  projectState: z
    .string()
    .min(1, "Estado/Provincia es requerido")
    .max(MAX_PROJECT_ADDRESS_LENGTH, "Estado muy largo"),
  projectStreet: z
    .string()
    .min(1, "Calle es requerida")
    .max(MAX_PROJECT_ADDRESS_LENGTH, "Calle muy larga"),
});

type QuoteGenerationFormValues = z.infer<typeof quoteGenerationFormSchema>;

// ============================================================================
// Types
// ============================================================================

export type QuoteGenerationDrawerProps = {
  /** Drawer trigger button */
  trigger: React.ReactNode;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Quote Generation Drawer
 *
 * Displays a drawer with quote generation form. Handles form submission,
 * cart clearing, and redirection to quote detail on success.
 *
 * @example
 * ```tsx
 * <QuoteGenerationDrawer
 *   trigger={<Button>Generar Cotización</Button>}
 * />
 * ```
 */
export function QuoteGenerationDrawer({ trigger }: QuoteGenerationDrawerProps) {
  const tenantConfig = useTenantConfig();
  const router = useRouter();
  const { items: cartItems, clearCart, summary } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // ✅ Session verification - prevents stale cache issues
  const { data: session, error: sessionError } = useSession();

  // ✅ Effect: Close drawer if session is lost while drawer is open
  useEffect(() => {
    const hasValidSession = !!session?.user && !sessionError;

    // If drawer is open but session is invalid, close it
    if (isOpen && !hasValidSession) {
      setIsOpen(false);
      toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
  }, [session, sessionError, isOpen]);

  const form = useForm<QuoteGenerationFormValues>({
    defaultValues: {
      contactPhone: "",
      deliveryAddress: undefined,
      projectCity: "",
      projectName: "",
      projectState: "",
      projectStreet: "",
    },
    mode: "onBlur",
    resolver: zodResolver(quoteGenerationFormSchema),
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset form when drawer closes
    if (!open) {
      form.reset();
    }
  };

  const handleSubmit = async (values: QuoteGenerationFormValues) => {
    await toast.promise(
      async () => {
        setIsSubmitting(true);

        try {
          const result = await generateQuoteFromCartAction(values, cartItems);

          if (result.success && result.quoteId) {
            clearCart();
            setIsRedirecting(true);

            // Close drawer
            setIsOpen(false);
            const delay = 500;
            // Small delay for UX (show success message)
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Redirect to quote detail
            router.push(`/my-quotes/${result.quoteId}`);

            return result.quoteId;
          }
          form.setError("root", {
            message: result.error ?? "Error al generar la cotización",
          });

          throw new Error(result.error ?? "Error al generar la cotización");
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        error: (error) =>
          error instanceof Error
            ? error.message
            : "Error al generar la cotización",
        loading: "Generando cotización...",
        success: "Cotización creada exitosamente. Redirigiendo...",
      }
    );
  };

  return (
    <>
      {/* Redirecting Overlay (full screen) */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-lg">Cotización Creada</p>
              <p className="text-muted-foreground text-sm">
                Redirigiendo a tu cotización...
              </p>
            </div>
          </div>
        </div>
      )}

      <Drawer
        direction={isDesktop ? "right" : "bottom"}
        onOpenChange={handleOpenChange}
        open={isOpen}
      >
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>

        <DrawerContent
          className={isDesktop ? "h-full max-w-2xl" : "max-h-[90vh]"}
        >
          <DrawerHeader className="border-b">
            <div className="flex items-start justify-between">
              <div>
                <DrawerTitle>Generar Cotización</DrawerTitle>
                <DrawerDescription>
                  Proporciona los detalles del proyecto para generar tu
                  cotización formal
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button className="h-8 w-8" size="icon" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <ScrollArea className="flex-1">
            <Form {...form}>
              <form
                className="space-y-4 p-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                {/* Cart Summary */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Items en el carrito</p>
                      <p className="text-muted-foreground text-xs">
                        {cartItems.length}{" "}
                        {cartItems.length === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">Total</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(summary.total, {
                          context: tenantConfig,
                        })}
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

                {/* Delivery Address with Geocoding (optional) */}
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dirección de Entrega con Geocodificación (opcional)
                      </FormLabel>
                      <FormControl>
                        <DeliveryAddressPicker
                          disabled={isSubmitting}
                          onChangeAction={(address) => {
                            field.onChange(address);
                          }}
                          placeholder="Buscar dirección..."
                          value={field.value}
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
                      <FormLabel>Dirección *</FormLabel>
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

                {/* City and State */}
                <FormField
                  control={form.control}
                  name="projectCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bogotá"
                          {...field}
                          disabled={isSubmitting}
                          maxLength={MAX_PROJECT_ADDRESS_LENGTH}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cundinamarca"
                          {...field}
                          disabled={isSubmitting}
                          maxLength={MAX_PROJECT_ADDRESS_LENGTH}
                        />
                      </FormControl>
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
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="+57 300 123 4567"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Root error display */}
                {form.formState.errors.root && (
                  <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </form>
            </Form>
          </ScrollArea>

          <DrawerFooter className="border-t">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button
                  className="flex-1"
                  disabled={isSubmitting}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </DrawerClose>
              <Button
                className="flex-1"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={form.handleSubmit(handleSubmit)}
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Generando...
                  </>
                ) : (
                  "Generar Cotización"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
