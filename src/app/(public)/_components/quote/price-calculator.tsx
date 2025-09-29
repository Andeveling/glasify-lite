'use client';

import { Calculator, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logger from '@/lib/logger';
import { formatCurrency } from '@/lib/utils';

type PriceCalculatorProps = {
  model: {
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
  };
  services: Array<{
    id: string;
    name: string;
    unit: 'unidad' | 'm2' | 'ml';
    price: string;
  }>;
  onAddToQuote: (item: {
    modelId: string;
    widthMm: number;
    heightMm: number;
    glassTypeId: string;
    services: Array<{ serviceId: string; quantity: number }>;
    quantity: number;
    subtotal: string;
  }) => void;
};

const MOCK_CALCULATION_DELAY = 500;
const MM_TO_M2_CONVERSION = 1_000_000;

type CalculationResult = {
  subtotal: string;
  detalles: Record<string, string>;
};

export function PriceCalculator({ model, services, onAddToQuote }: PriceCalculatorProps) {
  const [formData, setFormData] = useState({
    glassTypeId: '',
    heightMm: model.range.height[0],
    quantity: 1,
    selectedServices: [] as Array<{ serviceId: string; quantity: number }>,
    widthMm: model.range.width[0],
  });

  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAddingToQuote, setIsAddingToQuote] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.widthMm < model.range.width[0] || formData.widthMm > model.range.width[1]) {
      newErrors.ancho = `Ancho debe estar entre ${model.range.width[0]}mm y ${model.range.width[1]}mm`;
    }

    if (formData.heightMm < model.range.height[0] || formData.heightMm > model.range.height[1]) {
      newErrors.alto = `Alto debe estar entre ${model.range.height[0]}mm y ${model.range.height[1]}mm`;
    }

    if (!formData.glassTypeId) {
      newErrors.vidrio = 'Debe seleccionar un tipo de vidrio';
    }

    if (formData.quantity < 1) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleServiceChange = (serviceId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices
        .filter((s) => s.serviceId !== serviceId)
        .concat(quantity > 0 ? [{ quantity, serviceId }] : []),
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

      const basePrice = Number.parseFloat(model.basePrice);
      const area = (formData.widthMm * formData.heightMm) / MM_TO_M2_CONVERSION; // Convert to m²
      const serviceCost = formData.selectedServices.reduce((total, service) => {
        const serviceData = services.find((s) => s.id === service.serviceId);
        if (!serviceData) {
          return total;
        }
        return total + Number.parseFloat(serviceData.price) * service.quantity;
      }, 0);

      const subtotal = (basePrice + serviceCost) * formData.quantity;

      setCalculation({
        detalles: {
          cantidad: formData.quantity.toString(),
          dimensiones: `${formData.widthMm}mm × ${formData.heightMm}mm (${area.toFixed(2)}m²)`,
          precioBase: formatCurrency(model.basePrice),
          servicios: serviceCost > 0 ? formatCurrency(serviceCost.toFixed(2)) : '---',
        },
        subtotal: subtotal.toFixed(2),
      });
    } catch (error) {
      // In a real app, use proper error reporting
      // console.error('Error calculating price:', error);
      logger.error('Error calculating price:', { error: error instanceof Error ? error.message : error });
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
        glassTypeId: formData.glassTypeId,
        heightMm: formData.heightMm,
        modelId: model.id,
        quantity: formData.quantity,
        services: formData.selectedServices,
        subtotal: calculation.subtotal,
        widthMm: formData.widthMm,
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
        <CardDescription>Configure las especificaciones para obtener el precio del {model.name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dimensiones */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ancho">
              Ancho (mm)
              <span className="ml-1 text-muted-foreground text-xs">
                ({model.range.width[0]} - {model.range.width[1]}mm)
              </span>
            </Label>
            <Input
              aria-describedby={errors.ancho ? 'ancho-error' : undefined}
              className={errors.ancho ? 'border-destructive' : ''}
              id="ancho"
              max={model.range.width[1]}
              min={model.range.width[0]}
              onChange={(e) => handleInputChange('widthMm', Number.parseInt(e.target.value, 10) || 0)}
              type="number"
              value={formData.widthMm}
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
                ({model.range.height[0]} - {model.range.height[1]}mm)
              </span>
            </Label>
            <Input
              aria-describedby={errors.alto ? 'alto-error' : undefined}
              className={errors.alto ? 'border-destructive' : ''}
              id="alto"
              max={model.range.height[1]}
              min={model.range.height[0]}
              onChange={(e) => handleInputChange('heightMm', Number.parseInt(e.target.value, 10) || 0)}
              type="number"
              value={formData.heightMm}
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
          <Select onValueChange={(value) => handleInputChange('glassTypeId', value)} value={formData.glassTypeId}>
            <SelectTrigger
              aria-describedby={errors.vidrio ? 'vidrio-error' : undefined}
              className={errors.vidrio ? 'border-destructive' : ''}
              id="vidrio"
            >
              <SelectValue placeholder="Seleccionar tipo de vidrio" />
            </SelectTrigger>
            <SelectContent>
              {model.compatibleGlassTypes.map((glassType) => (
                <SelectItem key={glassType.id} value={glassType.id}>
                  <div className="flex items-center gap-2">
                    <span>{glassType.name}</span>
                    <Badge className="text-xs" variant="outline">
                      {glassType.type}
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
        {services.length > 0 && (
          <div className="space-y-3">
            <Label>Servicios Adicionales (Opcional)</Label>
            <div className="space-y-2">
              {services.map((service) => {
                const selected = formData.selectedServices.find((s) => s.serviceId === service.id);
                return (
                  <div className="flex items-center justify-between rounded-lg border p-3" key={service.id}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(service.price)} por {service.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-20 text-sm"
                        min="0"
                        onChange={(e) => handleServiceChange(service.id, Number.parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        type="number"
                        value={selected?.quantity || 0}
                      />
                      <span className="w-8 text-muted-foreground text-xs">{service.unit}</span>
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
            onChange={(e) => handleInputChange('quantity', Number.parseInt(e.target.value, 10) || 1)}
            type="number"
            value={formData.quantity}
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
