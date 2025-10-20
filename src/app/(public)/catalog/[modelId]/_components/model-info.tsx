import Image from 'next/image';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Card } from '@/components/ui/card';
import type { Model } from '../_types/model.types';

type ModelInfoProps = {
  model: Model;
};

export function ModelInfo({ model }: ModelInfoProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted">
        <Image
          alt={model.name}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          src={'/placeholder.webp'}
        />
      </div>
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-balance font-semibold text-xl">{model.name}</h2>
          <p className="text-muted-foreground text-sm">{model.manufacturer}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-bold text-3xl">{formatCurrency(model.basePrice)}</span>
          <span className="text-muted-foreground text-sm">precio base</span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">{model.description}</p>
      </div>
    </Card>
  );
}
