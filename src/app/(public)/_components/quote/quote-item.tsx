'use client';

import { Edit3, Package, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

type QuoteItemProps = {
  id: string;
  modelo: {
    nombre: string;
    fabricante: string;
  };
  dimensiones: {
    ancho: number;
    alto: number;
  };
  vidrio: {
    nombre: string;
    tipo: string;
  };
  servicios: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precio: string;
  }>;
  cantidad: number;
  subtotal: string;
  isEditable?: boolean;
  onEdit?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onQuantityChange?: (itemId: string, quantity: number) => void;
};

export function QuoteItem({
  id,
  modelo,
  dimensiones,
  vidrio,
  servicios,
  cantidad,
  subtotal,
  isEditable = false,
  onEdit,
  onDelete,
  onQuantityChange,
}: QuoteItemProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(newQuantity) && newQuantity >= 1 && onQuantityChange) {
      onQuantityChange(id, newQuantity);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="font-medium text-base text-foreground">{modelo.nombre}</CardTitle>
            <p className="text-muted-foreground text-sm">{modelo.fabricante}</p>
          </div>
          {isEditable && (
            <div className="flex gap-1">
              <Button
                aria-label={`Editar ítem ${modelo.nombre}`}
                className="h-8 w-8 p-0"
                onClick={handleEdit}
                size="sm"
                variant="ghost"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                aria-label={`Eliminar ítem ${modelo.nombre}`}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={handleDelete}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dimensiones */}
        <div>
          <Label className="font-medium text-muted-foreground text-xs">Dimensiones</Label>
          <p className="font-medium text-foreground text-sm">
            {dimensiones.ancho}mm × {dimensiones.alto}mm
          </p>
        </div>

        {/* Tipo de Vidrio */}
        <div>
          <Label className="font-medium text-muted-foreground text-xs">Vidrio</Label>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground text-sm">{vidrio.nombre}</p>
            <Badge className="text-xs" variant="outline">
              {vidrio.tipo}
            </Badge>
          </div>
        </div>

        {/* Servicios Adicionales */}
        {servicios.length > 0 && (
          <div>
            <Label className="font-medium text-muted-foreground text-xs">Servicios adicionales</Label>
            <div className="flex flex-wrap gap-1">
              {servicios.map((servicio) => (
                <Badge className="text-xs" key={servicio.id} variant="secondary">
                  <Package className="mr-1 h-3 w-3" />
                  {servicio.nombre} ({servicio.cantidad})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cantidad y Subtotal */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Label className="font-medium text-sm" htmlFor={`quantity-${id}`}>
              Cantidad:
            </Label>
            {isEditable ? (
              <Input
                aria-label={`Cantidad de ${modelo.nombre}`}
                className="h-8 w-20 text-sm"
                id={`quantity-${id}`}
                min="1"
                onChange={handleQuantityChange}
                type="number"
                value={cantidad}
              />
            ) : (
              <span className="font-medium text-sm">{cantidad}</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Subtotal</p>
            <p className="font-bold text-foreground text-lg">{formatCurrency(subtotal)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
