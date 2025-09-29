'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const MAX_VISIBLE_VIDRIOS = 3;

type ModelCardProps = {
  id: string;
  nombre: string;
  fabricante: string;
  rango: {
    ancho: [number, number];
    alto: [number, number];
  };
  precioBase: string;
  compatibilidadesVidrio: Array<{
    id: string;
    nombre: string;
    tipo: string;
  }>;
  onSelect?: (modelId: string) => void;
};

export function ModelCard({
  id,
  nombre,
  fabricante,
  rango,
  precioBase,
  compatibilidadesVidrio,
  onSelect,
}: ModelCardProps) {
  const formatRange = (range: [number, number]) => `${range[0]}mm - ${range[1]}mm`;

  return (
    <Card
      aria-label={`Modelo ${nombre} de ${fabricante}`}
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
              {nombre}
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">{fabricante}</CardDescription>
          </div>
          <Badge className="ml-2 whitespace-nowrap font-medium" variant="secondary">
            {formatCurrency(precioBase)} base
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-sm">Ancho</p>
            <p className="font-semibold text-foreground text-sm">{formatRange(rango.ancho)}</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-sm">Alto</p>
            <p className="font-semibold text-foreground text-sm">{formatRange(rango.alto)}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-sm">Vidrios compatibles</p>
          <div className="flex flex-wrap gap-1.5">
            {compatibilidadesVidrio.slice(0, MAX_VISIBLE_VIDRIOS).map((vidrio) => (
              <Badge className="font-normal text-xs" key={vidrio.id} variant="outline">
                {vidrio.nombre}
              </Badge>
            ))}
            {compatibilidadesVidrio.length > MAX_VISIBLE_VIDRIOS && (
              <Badge className="font-normal text-xs" variant="outline">
                +{compatibilidadesVidrio.length - MAX_VISIBLE_VIDRIOS} más
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
