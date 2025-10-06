'use client';

import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type QuoteSummaryProps = {
  basePrice: number;
  currency: string;
};

export function QuoteSummary({ basePrice, currency }: QuoteSummaryProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="font-bold text-2xl">
              ${basePrice.toFixed(2)} {currency}
            </span>
            <span className="text-muted-foreground text-sm">precio estimado</span>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">El precio final se calculará según tus especificaciones</p>
        </div>
        <Button className="sm:w-auto" size="lg" type="submit">
          Añadir a Cotización
        </Button>
      </div>
    </Card>
  );
}
