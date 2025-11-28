/**
 * Quote Generation Drawer Component
 *
 * Drawer component for quote generation with modular architecture.
 * Follows SOLID principles with separated concerns:
 * - Schema: `_schemas/quote-generation.schema.ts`
 * - Hook: `_hooks/use-quote-generation-form.ts`
 * - Fields: `_components/quote-form-fields.tsx`
 *
 * Features:
 * - Compact drawer UI (bottom on mobile, right on desktop)
 * - Loading states and redirecting overlay
 * - Session verification
 * - Auto-closes and redirects on success
 *
 * @module app/(public)/cart/_components/quote-generation-drawer
 */

"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "@/lib/auth-client";
import { useQuoteGenerationForm } from "../_hooks/use-quote-generation-form";
import { QuoteFormFields } from "./quote-form-fields";

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
 */
export function QuoteGenerationDrawer({ trigger }: QuoteGenerationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Session verification
  const { data: session, error: sessionError } = useSession();

  // Form hook with all logic encapsulated
  const {
    form,
    isSubmitting,
    isRedirecting,
    cartItems,
    cartSummary,
    handleSubmit,
    canSubmit,
  } = useQuoteGenerationForm({
    onClose: () => setIsOpen(false),
  });

  // Close drawer if session is lost while open
  useEffect(() => {
    const hasValidSession = Boolean(session?.user) && !sessionError;

    if (isOpen && !hasValidSession) {
      setIsOpen(false);
      toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
  }, [session, sessionError, isOpen]);

  // Handle drawer open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <>
      {/* Redirecting Overlay */}
      {isRedirecting && <RedirectingOverlay />}

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
                  Proporciona los detalles de entrega para generar tu cotización
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
              <form className="p-4" onSubmit={(e) => e.preventDefault()}>
                <QuoteFormFields
                  cartItemCount={cartItems.length}
                  cartTotal={cartSummary.total}
                  form={form}
                  isDisabled={isSubmitting}
                />
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
                disabled={!canSubmit}
                onClick={handleSubmit}
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

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Redirecting Overlay
 *
 * Full-screen overlay shown while redirecting after successful submission
 */
function RedirectingOverlay() {
  return (
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
  );
}
