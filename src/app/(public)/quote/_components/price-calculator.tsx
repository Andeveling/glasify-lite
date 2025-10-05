'use client';

import { Calculator, Loader2, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
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

type ServiceSelection = { serviceId: string; quantity: number };
type CalculatorFormData = {
  glassTypeId: string;
  heightMm: number;
  quantity: number;
  selectedServices: ServiceSelection[];
  widthMm: number;
};
type CalculatorField = 'glassTypeId' | 'heightMm' | 'quantity' | 'widthMm';
type ValidationKey = 'ancho' | 'alto' | 'vidrio' | 'cantidad';
type ValidationErrors = Partial<Record<ValidationKey, string>>;
type InputChangeHandler = (field: CalculatorField, value: string | number) => void;
type ServiceChangeHandler = (serviceId: string, quantity: number) => void;

const FIELD_ERROR_MAP: Record<CalculatorField, ValidationKey> = {
  glassTypeId: 'vidrio',
  heightMm: 'alto',
  quantity: 'cantidad',
  widthMm: 'ancho',
};

type PriceCalculatorControllerArgs = Pick<PriceCalculatorProps, 'model' | 'services' | 'onAddToQuote'>;
type PriceCalculatorModel = PriceCalculatorProps['model'];
type PriceCalculatorService = PriceCalculatorProps['services'][number];

function createInitialFormData(model: PriceCalculatorModel): CalculatorFormData {
  return {
    glassTypeId: '',
    heightMm: model.range.height[0],
    quantity: 1,
    selectedServices: [],
    widthMm: model.range.width[0],
  };
}

function validateFormData(formData: CalculatorFormData, model: PriceCalculatorModel): ValidationErrors {
  const errors: ValidationErrors = {};
  const [minWidth, maxWidth] = model.range.width;
  const [minHeight, maxHeight] = model.range.height;

  if (formData.widthMm < minWidth || formData.widthMm > maxWidth) {
    errors.ancho = `Ancho debe estar entre ${minWidth}mm y ${maxWidth}mm`;
  }

  if (formData.heightMm < minHeight || formData.heightMm > maxHeight) {
    errors.alto = `Alto debe estar entre ${minHeight}mm y ${maxHeight}mm`;
  }

  if (!formData.glassTypeId) {
    errors.vidrio = 'Debe seleccionar un tipo de vidrio';
  }

  if (formData.quantity < 1) {
    errors.cantidad = 'La cantidad debe ser mayor a 0';
  }

  return errors;
}

function removeValidationError(errors: ValidationErrors, key: ValidationKey): ValidationErrors {
  if (!errors[key]) {
    return errors;
  }

  const { [key]: _removed, ...rest } = errors;
  return rest;
}

function computeServiceCost(selected: ServiceSelection[], services: PriceCalculatorService[]): number {
  return selected.reduce((total, selection) => {
    const serviceData = services.find((service) => service.id === selection.serviceId);
    if (!serviceData) {
      return total;
    }
    return total + Number.parseFloat(serviceData.price) * selection.quantity;
  }, 0);
}

function computeArea({ heightMm, widthMm }: Pick<CalculatorFormData, 'heightMm' | 'widthMm'>): number {
  return (widthMm * heightMm) / MM_TO_M2_CONVERSION;
}

function buildCalculationResult({
  formData,
  model,
  services,
}: {
  formData: CalculatorFormData;
  model: PriceCalculatorModel;
  services: PriceCalculatorService[];
}): CalculationResult {
  const basePrice = Number.parseFloat(model.basePrice);
  const area = computeArea(formData);
  const serviceCost = computeServiceCost(formData.selectedServices, services);
  const subtotal = (basePrice + serviceCost) * formData.quantity;

  return {
    detalles: {
      cantidad: formData.quantity.toString(),
      dimensiones: `${formData.widthMm}mm × ${formData.heightMm}mm (${area.toFixed(2)}m²)`,
      precioBase: formatCurrency(model.basePrice),
      servicios: serviceCost > 0 ? formatCurrency(serviceCost) : '---',
    },
    subtotal: subtotal.toFixed(2),
  };
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function usePriceCalculatorController({ model, services, onAddToQuote }: PriceCalculatorControllerArgs) {
  const [formData, setFormData] = useState<CalculatorFormData>(() => createInitialFormData(model));
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAddingToQuote, setIsAddingToQuote] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateAndUpdateErrors = useCallback(() => {
    const validationErrors = validateFormData(formData, model);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, model]);

  const handleInputChange = useCallback((field: CalculatorField, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => removeValidationError(prev, FIELD_ERROR_MAP[field]));
  }, []);

  const handleServiceChange = useCallback((serviceId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices
        .filter((service) => service.serviceId !== serviceId)
        .concat(quantity > 0 ? [{ quantity, serviceId }] : []),
    }));
  }, []);

  const calculatePrice = useCallback(async () => {
    if (!validateAndUpdateErrors()) {
      return;
    }

    setIsCalculating(true);
    try {
      await sleep(MOCK_CALCULATION_DELAY);
      setCalculation(buildCalculationResult({ formData, model, services }));
    } catch (error) {
      logger.error('Error calculating price', { error: error instanceof Error ? error.message : error });
    } finally {
      setIsCalculating(false);
    }
  }, [formData, model, services, validateAndUpdateErrors]);

  const handleAddToQuote = useCallback(async () => {
    if (!(calculation && validateAndUpdateErrors())) {
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
      logger.error('Error adding item to quote', { error: error instanceof Error ? error.message : error });
    } finally {
      setIsAddingToQuote(false);
    }
  }, [calculation, formData, model.id, onAddToQuote, validateAndUpdateErrors]);

  return {
    calculatePrice,
    calculation,
    errors,
    formData,
    handleAddToQuote,
    handleInputChange,
    handleServiceChange,
    isAddingToQuote,
    isCalculating,
  };
}

type DimensionsSectionProps = {
  errors: ValidationErrors;
  formData: CalculatorFormData;
  model: PriceCalculatorModel;
  onInputChange: InputChangeHandler;
};

function DimensionsSection({ errors, formData, model, onInputChange }: DimensionsSectionProps) {
  const [minWidth, maxWidth] = model.range.width;
  const [minHeight, maxHeight] = model.range.height;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="ancho">
          Ancho (mm)
          <span className="ml-1 text-muted-foreground text-xs">
            ({minWidth} - {maxWidth}mm)
          </span>
        </Label>
        <Input
          aria-describedby={errors.ancho ? 'ancho-error' : undefined}
          className={errors.ancho ? 'border-destructive' : ''}
          id="ancho"
          max={maxWidth}
          min={minWidth}
          onChange={(event) => onInputChange('widthMm', Number.parseInt(event.target.value, 10) || 0)}
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
            ({minHeight} - {maxHeight}mm)
          </span>
        </Label>
        <Input
          aria-describedby={errors.alto ? 'alto-error' : undefined}
          className={errors.alto ? 'border-destructive' : ''}
          id="alto"
          max={maxHeight}
          min={minHeight}
          onChange={(event) => onInputChange('heightMm', Number.parseInt(event.target.value, 10) || 0)}
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
  );
}

type GlassTypeSectionProps = {
  errors: ValidationErrors;
  formData: CalculatorFormData;
  model: PriceCalculatorModel;
  onInputChange: InputChangeHandler;
};

function GlassTypeSection({ errors, formData, model, onInputChange }: GlassTypeSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="vidrio">Tipo de Vidrio</Label>
      <Select onValueChange={(value) => onInputChange('glassTypeId', value)} value={formData.glassTypeId}>
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
  );
}

type ServicesSectionProps = {
  onServiceChange: ServiceChangeHandler;
  selectedServices: ServiceSelection[];
  services: PriceCalculatorService[];
};

function ServicesSection({ onServiceChange, selectedServices, services }: ServicesSectionProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label>Servicios Adicionales (Opcional)</Label>
      <div className="space-y-2">
        {services.map((service) => {
          const selected = selectedServices.find((item) => item.serviceId === service.id);
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
                  onChange={(event) => onServiceChange(service.id, Number.parseInt(event.target.value, 10) || 0)}
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
  );
}

type QuantitySectionProps = {
  errors: ValidationErrors;
  formData: CalculatorFormData;
  onInputChange: InputChangeHandler;
};

function QuantitySection({ errors, formData, onInputChange }: QuantitySectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="cantidad">Cantidad</Label>
      <Input
        aria-describedby={errors.cantidad ? 'cantidad-error' : undefined}
        className={`w-32 ${errors.cantidad ? 'border-destructive' : ''}`}
        id="cantidad"
        min="1"
        onChange={(event) => onInputChange('quantity', Number.parseInt(event.target.value, 10) || 1)}
        type="number"
        value={formData.quantity}
      />
      {errors.cantidad && (
        <p className="text-destructive text-sm" id="cantidad-error">
          {errors.cantidad}
        </p>
      )}
    </div>
  );
}

type CalculationResultsProps = {
  calculation: CalculationResult | null;
  isAddingToQuote: boolean;
  onAddToQuote: () => Promise<void> | void;
};

function CalculationResults({ calculation, isAddingToQuote, onAddToQuote }: CalculationResultsProps) {
  if (!calculation) {
    return null;
  }

  return (
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
        <Button disabled={isAddingToQuote} onClick={onAddToQuote}>
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
  );
}

export function PriceCalculator({ model, services, onAddToQuote }: PriceCalculatorProps) {
  const {
    calculation,
    calculatePrice: handleCalculatePrice,
    errors,
    formData,
    handleAddToQuote,
    handleInputChange,
    handleServiceChange,
    isAddingToQuote,
    isCalculating,
  } = usePriceCalculatorController({ model, onAddToQuote, services });

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
        <DimensionsSection errors={errors} formData={formData} model={model} onInputChange={handleInputChange} />
        <GlassTypeSection errors={errors} formData={formData} model={model} onInputChange={handleInputChange} />
        <ServicesSection
          onServiceChange={handleServiceChange}
          selectedServices={formData.selectedServices}
          services={services}
        />
        <QuantitySection errors={errors} formData={formData} onInputChange={handleInputChange} />
        <Button className="w-full" disabled={isCalculating} onClick={handleCalculatePrice}>
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
        <CalculationResults
          calculation={calculation}
          isAddingToQuote={isAddingToQuote}
          onAddToQuote={handleAddToQuote}
        />
      </CardContent>
    </Card>
  );
}
