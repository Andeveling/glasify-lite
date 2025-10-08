'use client';

import { AlertCircle, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type QuoteSummaryProps = {
  basePrice: number;
  calculatedPrice?: number;
  currency: string;
  error?: string;
  isCalculating?: boolean;
};

export function QuoteSummary({ basePrice, calculatedPrice, currency, error, isCalculating }: QuoteSummaryProps) {
  const displayPrice = calculatedPrice ?? basePrice;
  const hasValidCalculation = calculatedPrice !== undefined && !error;

  // ✅ Enhanced UX: Dynamic state calculation
  const getCardState = () => {
    if (error) return 'error';
    if (hasValidCalculation) return 'success';
    return 'idle';
  };

  const getStatusContent = () => {
    if (error) {
      return {
        helperText: 'Ajusta los valores para calcular el precio',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      };
    }

    if (isCalculating) {
      return {
        helperText: 'Calculando precio en tiempo real...',
        icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
      };
    }

    if (hasValidCalculation) {
      return {
        helperText: 'Precio calculado según tus especificaciones',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      };
    }

    return {
      helperText: 'El precio final se calculará según tus especificaciones',
      icon: null,
    };
  };

  const getPriceDisplay = () => {
    if (isCalculating) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Calculando...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive text-lg">{error}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            'font-bold text-2xl transition-colors',
            hasValidCalculation ? 'text-primary' : 'text-foreground'
          )}
        >
          ${displayPrice.toFixed(2)} {currency}
        </span>
        <span className="text-muted-foreground text-xs">
          {hasValidCalculation ? 'precio calculado' : 'precio base estimado'}
        </span>
      </div>
    );
  };

  const statusContent = getStatusContent();
  const priceDisplay = getPriceDisplay();
  const cardState = getCardState();

  return (
    <Card className="border-2 p-6 transition-colors" data-state={cardState}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            {priceDisplay}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {statusContent.icon}
            <p className="text-muted-foreground text-xs">{statusContent.helperText}</p>
          </div>
        </div>
        <Button
          className="sm:w-auto"
          disabled={isCalculating || !!error || !hasValidCalculation}
          size="lg"
          type="submit"
        >
          {isCalculating ? 'Calculando...' : 'Añadir a Cotización'}
        </Button>
      </div>
    </Card>
  );
}
