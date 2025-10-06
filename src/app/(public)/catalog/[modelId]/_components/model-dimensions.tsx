import { Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ModelDimensions } from '../_types/model.types';

type ModelDimensionsProps = {
  dimensions: ModelDimensions;
};

export function ModelDimensionsCard({ dimensions }: ModelDimensionsProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Maximize2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Dimensiones Permitidas</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ancho mínimo:</span>
          <span className="font-medium">{dimensions.minWidth}mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ancho máximo:</span>
          <span className="font-medium">{dimensions.maxWidth}mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Alto mínimo:</span>
          <span className="font-medium">{dimensions.minHeight}mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Alto máximo:</span>
          <span className="font-medium">{dimensions.maxHeight}mm</span>
        </div>
      </div>
    </Card>
  );
}
