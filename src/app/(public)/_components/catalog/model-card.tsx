'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const MAX_VISIBLE_GLASS_TYPES = 3;

type ModelCardProps = {
  id: string;
  name: string;
  manufacturer: string;
  range: {
    width: [number, number];
    height: [number, number];
  };
  basePrice: string;
  compatibleGlassTypes: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  onSelect?: (modelId: string) => void;
};

export function ModelCard({
  id,
  name,
  manufacturer,
  range,
  basePrice,
  compatibleGlassTypes,
  onSelect,
}: ModelCardProps) {
  const formatRange = (rangeValues: [number, number]) => `${rangeValues[0]}mm - ${rangeValues[1]}mm`;

  return (
    <Card
      aria-label={`Modelo ${name} de ${manufacturer}`}
      className="group cursor-pointer border-primary/50 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
      onClick={() => onSelect?.(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
              {name}
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">{manufacturer}</CardDescription>
          </div>
          <Badge className="ml-2 whitespace-nowrap font-medium" variant="secondary">
            {formatCurrency(basePrice)} base
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-sm">Ancho</p>
            <p className="font-semibold text-foreground text-sm">{formatRange(range.width)}</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-sm">Alto</p>
            <p className="font-semibold text-foreground text-sm">{formatRange(range.height)}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-sm">Vidrios compatibles</p>
          <div className="flex flex-wrap gap-1.5">
            {compatibleGlassTypes.slice(0, MAX_VISIBLE_GLASS_TYPES).map((glassType) => (
              <Badge className="font-normal text-xs" key={glassType.id} variant="outline">
                {glassType.name}
              </Badge>
            ))}
            {compatibleGlassTypes.length > MAX_VISIBLE_GLASS_TYPES && (
              <Badge className="font-normal text-xs" variant="outline">
                +{compatibleGlassTypes.length - MAX_VISIBLE_GLASS_TYPES} más
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            className="w-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(id);
            }}
            size="sm"
            variant="outline"
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
