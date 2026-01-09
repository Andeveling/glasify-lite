/**
 * Quote Form Fields Component
 *
 * Organism component that renders all quote generation form fields.
 * Follows Atomic Design - composed of molecules (form fields) and atoms (inputs).
 *
 * Fields:
 * 1. Cart Summary (read-only display)
 * 2. Project Name (optional)
 * 3. Delivery Address (geocoding picker - required)
 * 4. Delivery Reference (optional instructions)
 * 5. Contact Phone (required)
 *
 * @module app/(public)/cart/_components/quote-form-fields
 */

"use client";

import type { UseFormReturn } from "react-hook-form";
import { DeliveryAddressPicker } from "@/app/(dashboard)/admin/quotes/_components/delivery-address-picker";
import type { ProjectAddressInput } from "@/app/(dashboard)/admin/quotes/_types/address.types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { useTenantConfig } from "@/providers/tenant-config-provider";
import type { QuoteGenerationFormValues } from "../_schemas/quote-generation.schema";

// ============================================================================
// Types
// ============================================================================

type QuoteFormFieldsProps = {
  /** React Hook Form instance */
  form: UseFormReturn<QuoteGenerationFormValues>;
  /** Whether form is disabled (submitting) */
  isDisabled?: boolean;
  /** Cart item count for summary */
  cartItemCount: number;
  /** Cart total for summary */
  cartTotal: number;
};

// ============================================================================
// Constants
// ============================================================================

const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_REFERENCE_LENGTH = 200;

// ============================================================================
// Component
// ============================================================================

/**
 * Quote Form Fields
 *
 * Renders all form fields for quote generation in a clean, organized layout.
 *
 * @example
 * ```tsx
 * <QuoteFormFields
 *   form={form}
 *   isDisabled={isSubmitting}
 *   cartItemCount={3}
 *   cartTotal={1500000}
 * />
 * ```
 */
export function QuoteFormFields({
  form,
  isDisabled = false,
  cartItemCount,
  cartTotal,
}: QuoteFormFieldsProps) {
  const tenantConfig = useTenantConfig();

  return (
    <div className="space-y-4">
      {/* Cart Summary (read-only) */}
      <CartSummaryCard
        itemCount={cartItemCount}
        tenantConfig={tenantConfig}
        total={cartTotal}
      />

      {/* Project Name (optional) */}
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Proyecto (opcional)</FormLabel>
            <FormControl>
              <Input
                disabled={isDisabled}
                maxLength={MAX_PROJECT_NAME_LENGTH}
                placeholder="Ej: Edificio Residencial Fase 1"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Un nombre para identificar tu proyecto internamente
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Delivery Address (geocoding - required) */}
      <FormField
        control={form.control}
        name="deliveryAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Dirección de Entrega <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <DeliveryAddressPicker
                disabled={isDisabled}
                error={form.formState.errors.deliveryAddress?.message}
                onChangeAction={(address: Partial<ProjectAddressInput>) => {
                  field.onChange(address);
                }}
                placeholder="Buscar dirección..."
                value={field.value}
              />
            </FormControl>
            <FormDescription>
              Busca y selecciona la dirección donde entregaremos tu pedido
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Delivery Reference (optional) */}
      <FormField
        control={form.control}
        name="deliveryReference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referencia de Entrega (opcional)</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none"
                disabled={isDisabled}
                maxLength={MAX_REFERENCE_LENGTH}
                placeholder="Ej: Frente a la estación de servicio, portón verde"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Instrucciones adicionales para encontrar la ubicación
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Contact Phone (required) */}
      <FormField
        control={form.control}
        name="contactPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Teléfono de Contacto <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <PhoneInput
                disabled={isDisabled}
                placeholder="+57 300 123 4567"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Número donde podemos contactarte para coordinar la entrega
            </FormDescription>
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
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

type CartSummaryCardProps = {
  itemCount: number;
  total: number;
  tenantConfig: ReturnType<typeof useTenantConfig>;
};

/**
 * Cart Summary Card
 *
 * Displays a compact summary of cart contents
 */
function CartSummaryCard({
  itemCount,
  total,
  tenantConfig,
}: CartSummaryCardProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Items en el carrito</p>
          <p className="text-muted-foreground text-xs">
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-sm">Total</p>
          <p className="font-bold text-lg">
            {formatCurrency(total, { context: tenantConfig })}
          </p>
        </div>
      </div>
    </div>
  );
}
