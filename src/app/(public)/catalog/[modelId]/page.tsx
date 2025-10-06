'use client';

import { DollarSign, Home, Info, Maximize2, Package, Ruler, Shield, Snowflake, Sparkles, Wrench } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type GlassPurpose = 'general' | 'insulation' | 'security' | 'decorative';

type GlassOption = {
  id: string;
  purpose: GlassPurpose;
  title: string;
  description: string;
  benefits: string[];
  icon: React.ComponentType<{ className?: string }>;
  technicalSpecs?: {
    thickness: string;
    features: string[];
  };
  priceIndicator: 'budget' | 'standard' | 'premium';
}

const glassOptions: GlassOption[] = [
  {
    benefits: [ 'Claridad óptima', 'Resistencia básica', 'Ideal para clima templado' ],
    description: 'Perfecta para uso diario en espacios interiores y exteriores',
    icon: Home,
    id: 'general-6mm',
    priceIndicator: 'budget',
    purpose: 'general',
    technicalSpecs: {
      features: [ 'Vidrio flotado' ],
      thickness: '6mm',
    },
    title: 'Solución Estándar',
  },
  {
    benefits: [ 'Reduce hasta 40% en costos de climatización', 'Aislamiento térmico superior', 'Reduce condensación' ],
    description: 'Mantén tu hogar fresco en verano y cálido en invierno',
    icon: Snowflake,
    id: 'insulation-6mm',
    priceIndicator: 'premium',
    purpose: 'insulation',
    technicalSpecs: {
      features: [ 'Bajo emisivo (Low-E)', 'Doble acristalamiento' ],
      thickness: '6mm',
    },
    title: 'Ahorro de Energía',
  },
  {
    benefits: [ 'Resistente a impactos', 'Protección contra intrusos', 'Fragmentos seguros en caso de rotura' ],
    description: 'Máxima seguridad para tu familia y tu hogar',
    icon: Shield,
    id: 'security-8mm',
    priceIndicator: 'premium',
    purpose: 'security',
    technicalSpecs: {
      features: [ 'Templado', 'Laminado' ],
      thickness: '8mm',
    },
    title: 'Protección y Seguridad',
  },
  {
    benefits: [ 'Privacidad sin perder luz natural', 'Diseño elegante', 'Fácil mantenimiento' ],
    description: 'Combina estética moderna con privacidad',
    icon: Sparkles,
    id: 'decorative-6mm',
    priceIndicator: 'standard',
    purpose: 'decorative',
    technicalSpecs: {
      features: [ 'Acabado especial', 'Filtro UV' ],
      thickness: '6mm',
    },
    title: 'Estilo y Privacidad',
  },
];

const priceLabels = {
  budget: 'Económico',
  premium: 'Premium',
  standard: 'Estándar',
};

type GlassTypeSelectorProps = {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}


function getServiceTypeLabel(type: 'area' | 'perimeter' | 'fixed'): string {
  const labels = {
    area: 'Por área (m²)',
    fixed: 'Precio fijo',
    perimeter: 'Por perímetro (ml)',
  };
  return labels[ type ];
}

const MOCK_SERVICES = [
  {
    description: 'Corte a medida',
    id: '1',
    name: 'Corte',
    price: 15.0,
    type: 'fixed' as const,
  },
  {
    description: 'Pulido de bordes',
    id: '2',
    name: 'Pulido',
    price: 25.0,
    type: 'perimeter' as const,
  },
  {
    description: 'Perforación',
    id: '3',
    name: 'Perforado',
    price: 10.0,
    type: 'fixed' as const,
  },
  {
    description: 'Templado térmico',
    id: '4',
    name: 'Templado',
    price: 50.0,
    type: 'area' as const,
  },
  {
    description: 'Laminado de seguridad',
    id: '5',
    name: 'Laminado',
    price: 60.0,
    type: 'area' as const,
  },
  {
    description: 'Serigrafía decorativa',
    id: '6',
    name: 'Serigrafía',
    price: 35.0,
    type: 'area' as const,
  },
];

const MOCK_MODEL = {
  basePrice: 450.0,
  currency: 'USD',
  description: 'Ventana corrediza de aluminio de alta calidad con sistema de cierre multipunto y perfiles reforzados.',
  dimensions: {
    maxHeight: 2400,
    maxWidth: 2000,
    minHeight: 600,
    minWidth: 600,
  },
  features: [
    'Perfiles de aluminio extruido',
    'Sistema de cierre multipunto',
    'Rodamientos de acero inoxidable',
    'Acabado anodizado resistente',
    'Garantía de 10 años',
  ],
  id: 'ventana-corrediza-aluminio-001',
  imageUrl: '/modern-aluminum-sliding-window.jpg',
  manufacturer: 'VentanasTech Pro',
  name: 'Ventana Corrediza Premium',
};

export default function Page() {
  const [ submittedData, setSubmittedData ] = useState<Record<string, unknown> | null>(null);

  const form = useForm({
    defaultValues: {
      additionalServices: [] as string[],
      glassType: '',
      height: '',
      quantity: '1',
      width: '',
    },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted">
                <img
                  alt={MOCK_MODEL.name}
                  className="h-full w-full object-cover"
                  src={MOCK_MODEL.imageUrl || '/placeholder.svg'}
                />
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <h2 className='text-balance font-semibold text-xl'>{MOCK_MODEL.name}</h2>
                  <p className="text-muted-foreground text-sm">{MOCK_MODEL.manufacturer}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-3xl">${MOCK_MODEL.basePrice.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm">precio base</span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">{MOCK_MODEL.description}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Maximize2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Dimensiones Permitidas</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ancho mínimo:</span>
                  <span className="font-medium">{MOCK_MODEL.dimensions.minWidth}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ancho máximo:</span>
                  <span className="font-medium">{MOCK_MODEL.dimensions.maxWidth}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alto mínimo:</span>
                  <span className="font-medium">{MOCK_MODEL.dimensions.minHeight}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alto máximo:</span>
                  <span className="font-medium">{MOCK_MODEL.dimensions.maxHeight}mm</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Características</h3>
              </div>
              <ul className="space-y-2">
                {MOCK_MODEL.features.map((feature, index) => (
                  <li className="flex items-start gap-2 text-sm" key={index}>
                    <span className="mt-0.5 text-primary">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit((data) => {
                  setSubmittedData(data);
                })}
              >
                <Card className="p-6">
                  <div className="mb-6 space-y-1">
                    <h3 className="font-semibold text-lg">Dimensiones</h3>
                    <p className="text-muted-foreground text-sm">
                      Especifica el ancho y alto de tu ventana en milímetros
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ancho</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupInput placeholder="1200" type="number" {...field} />
                                <InputGroupAddon>
                                  <Ruler className="h-4 w-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                  <InputGroupText>mm</InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                            </FormControl>
                            <FormDescription>
                              {MOCK_MODEL.dimensions.minWidth}-{MOCK_MODEL.dimensions.maxWidth}mm
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alto</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupInput placeholder="1800" type="number" {...field} />
                                <InputGroupAddon>
                                  <Ruler className="h-4 w-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                  <InputGroupText>mm</InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                            </FormControl>
                            <FormDescription>
                              {MOCK_MODEL.dimensions.minHeight}-{MOCK_MODEL.dimensions.maxHeight}mm
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput min="1" placeholder="1" type="number" {...field} />
                              <InputGroupAddon>
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                          <FormDescription>Número de unidades que deseas cotizar</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="mb-6 space-y-1">
                    <h3 className="font-semibold text-lg">Tipo de Cristal</h3>
                    <p className="text-muted-foreground text-sm">
                      Selecciona la solución de cristal que mejor se adapte a tus necesidades
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="glassType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <GlassTypeSelector onChange={field.onChange} value={field.value} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">Servicios Adicionales</h3>
                      <p className="text-muted-foreground text-sm">
                        Agrega servicios extra para personalizar tu ventana
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalServices"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {MOCK_SERVICES.map((service) => {
                            const isSelected = (field.value as string[]).includes(service.id);
                            return (
                              <Card
                                className={`relative cursor-pointer p-4 transition-all hover:border-primary/50 ${isSelected ? 'border-primary bg-primary/5' : ''
                                  }`}
                                key={service.id}
                                onClick={() => {
                                  const currentValue = field.value as string[];
                                  const updatedValue = isSelected
                                    ? currentValue.filter((id) => id !== service.id)
                                    : [ ...currentValue, service.id ];
                                  field.onChange(updatedValue);
                                }}
                              >
                                <Checkbox checked={isSelected} className="pointer-events-none absolute top-3 right-3" />
                                <div className="space-y-2 pr-8">
                                  <div className="font-medium text-sm">{service.name}</div>
                                  <div className="text-muted-foreground text-xs leading-relaxed">
                                    {service.description}
                                  </div>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-semibold text-sm">${service.price.toFixed(2)}</span>
                                    <span className="text-muted-foreground text-xs">
                                      {getServiceTypeLabel(service.type)}
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-2xl">${MOCK_MODEL.basePrice.toFixed(2)}</span>
                        <span className="text-muted-foreground text-sm">precio estimado</span>
                      </div>
                      <p className="mt-1 text-muted-foreground text-xs">
                        El precio final se calculará según tus especificaciones
                      </p>
                    </div>
                    <Button className="sm:w-auto" size="lg" type="submit">
                      Añadir a Cotización
                    </Button>
                  </div>
                </Card>
              </form>
            </Form>

            {submittedData && (
              <Card className="p-6">
                <h3 className="mb-3 font-semibold text-lg">Datos enviados (desarrollo):</h3>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export function GlassTypeSelector({ value, onChange, className }: GlassTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <h3 className='font-semibold text-lg'>¿Qué solución necesitas?</h3>
        <p className='text-muted-foreground text-sm'>Selecciona la opción que mejor se adapte a tus necesidades</p>
      </div>

      <RadioGroup className="grid gap-4 md:grid-cols-2" onValueChange={onChange} value={value}>
        {glassOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <div className="relative" key={option.id}>
              <RadioGroupItem className="peer sr-only" id={option.id} value={option.id} />
              <Label
                className={cn(
                  'flex cursor-pointer flex-col gap-4 rounded-lg border-2 p-6 transition-all hover:border-primary/50',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                )}
                htmlFor={option.id}
              >
                {/* Header with icon and price */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{option.title}</h4>
                      <Badge className="mt-1 text-xs" variant={isSelected ? 'default' : 'secondary'}>
                        {priceLabels[ option.priceIndicator ]}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className='text-muted-foreground text-sm'>{option.description}</p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {option.benefits.map((benefit, index) => (
                    <li className="flex items-start gap-2 text-sm" key={index}>
                      <span className="mt-0.5 text-primary">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Technical specs (collapsed) */}
                {option.technicalSpecs && (
                  <div className="mt-2 border-t pt-3">
                    <details className="group">
                      <summary className='cursor-pointer font-medium text-muted-foreground text-xs hover:text-foreground'>
                        Especificaciones técnicas
                      </summary>
                      <div className='mt-2 space-y-1 text-muted-foreground text-xs'>
                        <p>Grosor: {option.technicalSpecs.thickness}</p>
                        <p>Características: {option.technicalSpecs.features.join(', ')}</p>
                      </div>
                    </details>
                  </div>
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
