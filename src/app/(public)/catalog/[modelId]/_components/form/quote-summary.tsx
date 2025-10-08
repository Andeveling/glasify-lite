'use client';

import { AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type QuoteSummaryProps = {
  basePrice: number;
  calculatedPrice?: number;
  currency: string;
  error?: string;
  isCalculating?: boolean;
};

export function QuoteSummary({ basePrice, calculatedPrice, currency, error, isCalculating }: QuoteSummaryProps) {
  const displayPrice = calculatedPrice ?? basePrice;

  // Determine helper text based on state
  let helperText = 'El precio final se calculará según tus especificaciones';
  if (error) {
    helperText = 'Ajusta los valores para calcular el precio';
  } else if (calculatedPrice) {
    helperText = 'Precio calculado según tus especificaciones';
  }

  // Render price display
  let priceDisplay: React.ReactNode;
  if (isCalculating) {
    priceDisplay = (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-lg text-muted-foreground">Calculando...</span>
      </div>
    );
  } else if (error) {
    priceDisplay = (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-destructive text-lg">{error}</span>
      </div>
    );
  } else {
    priceDisplay = (
      <>
        <span className="font-bold text-2xl">
          ${displayPrice.toFixed(2)} {currency}
        </span>
        <span className="text-muted-foreground text-sm">
          {calculatedPrice ? 'precio calculado' : 'precio estimado'}
        </span>
      </>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            {priceDisplay}
          </div>
          <p className="mt-1 text-muted-foreground text-xs">{helperText}</p>
        </div>
        <Button className="sm:w-auto" disabled={isCalculating || !!error} size="lg" type="submit">
          Añadir a Cotización
        </Button>
      </div>
    </Card>
  );
}
