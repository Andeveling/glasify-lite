'use client';

import { Calculator, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

type PriceCalculatorProps = {
  modelo: {
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
  };
  servicios: Array<{
    id: string;
    nombre: string;
    unidad: 'unidad' | 'm2' | 'ml';
    precio: string;
  }>;
  onAddToQuote: (item: {
    modeloId: string;
    anchoMm: number;
    altoMm: number;
    vidrioId: string;
    servicios: Array<{ serviceId: string; cantidad: number }>;
    cantidad: number;
    subtotal: string;
  }) => void;
};

const MOCK_CALCULATION_DELAY = 500;
const MM_TO_M2_CONVERSION = 1_000_000;

type CalculationResult = {
  subtotal: string;
  detalles: Record<string, string>;
};

export function PriceCalculator({ modelo, servicios, onAddToQuote }: PriceCalculatorProps) {
  const [formData, setFormData] = useState({
    altoMm: modelo.rango.alto[0],
    anchoMm: modelo.rango.ancho[0],
    cantidad: 1,
    serviciosSeleccionados: [] as Array<{ serviceId: string; cantidad: number }>,
    vidrioId: '',
  });

  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAddingToQuote, setIsAddingToQuote] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.anchoMm < modelo.rango.ancho[0] || formData.anchoMm > modelo.rango.ancho[1]) {
      newErrors.ancho = `Ancho debe estar entre ${modelo.rango.ancho[0]}mm y ${modelo.rango.ancho[1]}mm`;
    }

    if (formData.altoMm < modelo.rango.alto[0] || formData.altoMm > modelo.rango.alto[1]) {
      newErrors.alto = `Alto debe estar entre ${modelo.rango.alto[0]}mm y ${modelo.rango.alto[1]}mm`;
    }

    if (!formData.vidrioId) {
      newErrors.vidrio = 'Debe seleccionar un tipo de vidrio';
    }

    if (formData.cantidad < 1) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleServiceChange = (serviceId: string, cantidad: number) => {
    setFormData((prev) => ({
      ...prev,
      serviciosSeleccionados: prev.serviciosSeleccionados
        .filter((s) => s.serviceId !== serviceId)
        .concat(cantidad > 0 ? [{ cantidad, serviceId }] : []),
    }));
  };

  const calculatePrice = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCalculating(true);
    try {
      // Simulated API call - in real implementation, use tRPC
      await new Promise((resolve) => setTimeout(resolve, MOCK_CALCULATION_DELAY));

      const basePrice = Number.parseFloat(modelo.precioBase);
      const area = (formData.anchoMm * formData.altoMm) / MM_TO_M2_CONVERSION; // Convert to m²
      const serviceCost = formData.serviciosSeleccionados.reduce((total, servicio) => {
        const service = servicios.find((s) => s.id === servicio.serviceId);
        if (!service) {
          return total;
        }
        return total + Number.parseFloat(service.precio) * servicio.cantidad;
      }, 0);

      const subtotal = (basePrice + serviceCost) * formData.cantidad;

      setCalculation({
        detalles: {
          cantidad: formData.cantidad.toString(),
          dimensiones: `${formData.anchoMm}mm × ${formData.altoMm}mm (${area.toFixed(2)}m²)`,
          precioBase: formatCurrency(modelo.precioBase),
          servicios: serviceCost > 0 ? formatCurrency(serviceCost.toFixed(2)) : '---',
        },
        subtotal: subtotal.toFixed(2),
      });
    } catch (error) {
      // In a real app, use proper error reporting
      // console.error('Error calculating price:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAddToQuote = async () => {
    if (!(calculation && validateForm())) {
      return;
    }

    setIsAddingToQuote(true);
    try {
      await onAddToQuote({
        altoMm: formData.altoMm,
        anchoMm: formData.anchoMm,
        cantidad: formData.cantidad,
        modeloId: modelo.id,
        servicios: formData.serviciosSeleccionados,
        subtotal: calculation.subtotal,
        vidrioId: formData.vidrioId,
      });
    } catch (error) {
      // In a real app, use proper error reporting
      // console.error('Error adding to quote:', error);
    } finally {
      setIsAddingToQuote(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcular Precio
        </CardTitle>
        <CardDescription>Configure las especificaciones para obtener el precio del {modelo.nombre}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dimensiones */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ancho">
              Ancho (mm)
              <span className="ml-1 text-muted-foreground text-xs">
                ({modelo.rango.ancho[0]} - {modelo.rango.ancho[1]}mm)
              </span>
            </Label>
            <Input
              aria-describedby={errors.ancho ? 'ancho-error' : undefined}
              className={errors.ancho ? 'border-destructive' : ''}
              id="ancho"
              max={modelo.rango.ancho[1]}
              min={modelo.rango.ancho[0]}
              onChange={(e) => handleInputChange('anchoMm', Number.parseInt(e.target.value, 10) || 0)}
              type="number"
              value={formData.anchoMm}
            />
            {errors.ancho && (
              <p className="text-destructive text-sm" id="ancho-error">
                {errors.ancho}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alto">
              Alto (mm)
              <span className="ml-1 text-muted-foreground text-xs">
                ({modelo.rango.alto[0]} - {modelo.rango.alto[1]}mm)
              </span>
            </Label>
            <Input
              aria-describedby={errors.alto ? 'alto-error' : undefined}
              className={errors.alto ? 'border-destructive' : ''}
              id="alto"
              max={modelo.rango.alto[1]}
              min={modelo.rango.alto[0]}
              onChange={(e) => handleInputChange('altoMm', Number.parseInt(e.target.value, 10) || 0)}
              type="number"
              value={formData.altoMm}
            />
            {errors.alto && (
              <p className="text-destructive text-sm" id="alto-error">
                {errors.alto}
              </p>
            )}
          </div>
        </div>

        {/* Tipo de Vidrio */}
        <div className="space-y-2">
          <Label htmlFor="vidrio">Tipo de Vidrio</Label>
          <Select onValueChange={(value) => handleInputChange('vidrioId', value)} value={formData.vidrioId}>
            <SelectTrigger
              aria-describedby={errors.vidrio ? 'vidrio-error' : undefined}
              className={errors.vidrio ? 'border-destructive' : ''}
              id="vidrio"
            >
              <SelectValue placeholder="Seleccionar tipo de vidrio" />
            </SelectTrigger>
            <SelectContent>
              {modelo.compatibilidadesVidrio.map((vidrio) => (
                <SelectItem key={vidrio.id} value={vidrio.id}>
                  <div className="flex items-center gap-2">
                    <span>{vidrio.nombre}</span>
                    <Badge className="text-xs" variant="outline">
                      {vidrio.tipo}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vidrio && (
            <p className="text-destructive text-sm" id="vidrio-error">
              {errors.vidrio}
            </p>
          )}
        </div>

        {/* Servicios Adicionales */}
        {servicios.length > 0 && (
          <div className="space-y-3">
            <Label>Servicios Adicionales (Opcional)</Label>
            <div className="space-y-2">
              {servicios.map((servicio) => {
                const selected = formData.serviciosSeleccionados.find((s) => s.serviceId === servicio.id);
                return (
                  <div className="flex items-center justify-between rounded-lg border p-3" key={servicio.id}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{servicio.nombre}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(servicio.precio)} por {servicio.unidad}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-20 text-sm"
                        min="0"
                        onChange={(e) => handleServiceChange(servicio.id, Number.parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        type="number"
                        value={selected?.cantidad || 0}
                      />
                      <span className="w-8 text-muted-foreground text-xs">{servicio.unidad}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cantidad */}
        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            aria-describedby={errors.cantidad ? 'cantidad-error' : undefined}
            className={`w-32 ${errors.cantidad ? 'border-destructive' : ''}`}
            id="cantidad"
            min="1"
            onChange={(e) => handleInputChange('cantidad', Number.parseInt(e.target.value, 10) || 1)}
            type="number"
            value={formData.cantidad}
          />
          {errors.cantidad && (
            <p className="text-destructive text-sm" id="cantidad-error">
              {errors.cantidad}
            </p>
          )}
        </div>

        {/* Calculate Button */}
        <Button className="w-full" disabled={isCalculating} onClick={calculatePrice}>
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Precio
            </>
          )}
        </Button>

        {/* Results */}
        {calculation && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Detalles del Cálculo</h4>
              <div className="space-y-1">
                {Object.entries(calculation.detalles).map(([key, value]) => (
                  <div className="flex justify-between text-sm" key={key}>
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-muted-foreground text-sm">Subtotal</p>
                <p className="font-bold text-foreground text-lg">{formatCurrency(calculation.subtotal)}</p>
              </div>
              <Button disabled={isAddingToQuote} onClick={handleAddToQuote}>
                {isAddingToQuote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar a Cotización
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
