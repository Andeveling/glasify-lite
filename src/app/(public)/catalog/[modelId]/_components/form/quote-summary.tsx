"use client";

import {
  AlertCircle,
  CheckCircle,
  Loader2,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { formatCurrency } from "@/app/_utils/format-currency.util";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuoteSummaryProps = {
  basePrice: number;
  calculatedPrice?: number;
  currency: string;
  error?: string;
  isCalculating?: boolean;
  justAddedToCart?: boolean;
};

/**
 * Field labels in Spanish for better UX
 */
const FIELD_LABELS: Record<string, string> = {
  additionalServices: "Servicios adicionales",
  glassType: "Tipo de cristal",
  height: "Alto",
  quantity: "Cantidad",
  solution: "Solución",
  width: "Ancho",
};

export function QuoteSummary({
  basePrice,
  calculatedPrice,
  currency,
  error,
  isCalculating,
  justAddedToCart = false,
}: QuoteSummaryProps) {
  const {
    formState: { errors, isValid },
  } = useFormContext();

  const displayPrice = calculatedPrice ?? basePrice;
  const hasValidCalculation = calculatedPrice !== undefined && !error;
  const hasFormErrors = Object.keys(errors).length > 0;

  // ✅ Enhanced UX: Extract form errors for explicit display
  const getFormErrors = (): Array<{ field: string; message: string }> =>
    Object.entries(errors).map(([field, fieldError]) => ({
      field: FIELD_LABELS[field] || field,
      message: fieldError?.message?.toString() || "Campo inválido",
    }));

  // ✅ Enhanced UX: Dynamic state calculation
  const getCardState = () => {
    if (error || hasFormErrors) {
      return "error";
    }
    if (hasValidCalculation && isValid) {
      return "success";
    }
    return "idle";
  };

  const getStatusContent = () => {
    // Priority 1: Form validation errors
    if (hasFormErrors) {
      return {
        helperText: "Completa todos los campos requeridos correctamente",
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      };
    }

    // Priority 2: Calculation errors
    if (error) {
      return {
        helperText: "Ajusta los valores para calcular el precio",
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      };
    }

    // Priority 3: Calculating state
    if (isCalculating) {
      return {
        helperText: "Calculando precio en tiempo real...",
        icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
      };
    }

    // Priority 4: Success state
    if (hasValidCalculation && isValid) {
      return {
        helperText: "Precio calculado según tus especificaciones",
        icon: <CheckCircle className="h-4 w-4 text-success" />,
      };
    }

    return {
      helperText: "El precio final se calculará según tus especificaciones",
      icon: null,
    };
  };

  const getPriceDisplay = () => {
    if (isCalculating) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Calculando...</span>
          </div>
          <span className="text-muted-foreground text-xs">
            Precio actualizado en tiempo real...
          </span>
        </div>
      );
    }

    if (error || hasFormErrors) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-8 text-destructive" />
            <span className="text-destructive text-lg">
              {error || "Formulario incompleto"}
            </span>
          </div>
          <span className="text-muted-foreground text-xs">
            Revisa los errores a continuación
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "font-bold text-2xl transition-colors",
            hasValidCalculation ? "text-primary" : "text-foreground"
          )}
        >
          {formatCurrency(displayPrice, {
            currency,
            decimals: 0,
            locale: "es-CO",
          })}
        </span>
        <span className="text-muted-foreground text-xs">
          {hasValidCalculation ? "Precio calculado" : "Precio base estimado"}
        </span>
      </div>
    );
  };

  const getButtonText = () => {
    if (justAddedToCart) {
      return "Agregado al carrito";
    }
    if (isCalculating) {
      return "Calculando...";
    }
    return "Agregar al carrito";
  };

  const statusContent = getStatusContent();
  const priceDisplay = getPriceDisplay();
  const cardState = getCardState();
  const formErrors = getFormErrors();
  const canSubmit =
    isValid &&
    hasValidCalculation &&
    !isCalculating &&
    !error &&
    !justAddedToCart;

  return (
    <Card
      className={cn("border-2 p-6 transition-all duration-200", {
        "border-destructive/50 bg-destructive/5": cardState === "error",
        "border-success/50 bg-success/5": cardState === "success",
      })}
      data-state={cardState}
    >
      <div className="flex flex-col gap-4">
        {/* Price and Status Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">{priceDisplay}</div>
            <div className="mt-2 flex items-center gap-2">
              {statusContent.icon}
              <p className="text-muted-foreground text-xs">
                {statusContent.helperText}
              </p>
            </div>
          </div>
          <Button
            className={cn("transition-all duration-200 sm:w-auto", {
              "cursor-not-allowed opacity-50": !canSubmit,
            })}
            disabled={!canSubmit}
            size="lg"
            type="submit"
          >
            <ShoppingCart className="mr-2 size-5" />
            {getButtonText()}
          </Button>
        </div>

        {/* Error List - Only show when button is disabled due to form errors */}
        {hasFormErrors && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-destructive text-sm">
                  Por qué no puedes añadir a cotización:
                </p>
                <ul className="space-y-1">
                  {formErrors.map((formError) => (
                    <li
                      className="flex items-start gap-2 text-destructive/90 text-sm"
                      key={formError.field}
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                      <span>
                        <strong>{formError.field}:</strong> {formError.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Error - Only show when there's a calculation error (not form errors) */}
        {error && !hasFormErrors && (
          <div className="rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--color-warning-foreground)] text-sm">
                  Error de cálculo:
                </p>
                <p className="mt-1 text-[var(--color-warning-foreground)]/80 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
