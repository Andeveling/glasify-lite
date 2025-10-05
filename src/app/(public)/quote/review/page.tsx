'use client';

import { ArrowLeft, FileText, MapPin, Send, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { QuoteItem } from '../_components/quote/quote-item'; // TODO: Implement full QuoteItem component
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/react';

type QuoteItemData = {
  id: string;
  modelId: string;
  modelName: string;
  widthMm: number;
  heightMm: number;
  glassId: string;
  glassTypeName: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
  }>;
  quantity: number;
  subtotal: number;
  editable: boolean;
};

type ContactInfo = {
  phone: string;
  address: string;
  notes: string;
};

const PHONE_REGEX = /^\+?[\d\s-()]+$/;

export default function QuoteReviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock quote items - in real app this would come from context or API
  const [quoteItems, setQuoteItems] = useState<QuoteItemData[]>([
    {
      editable: false,
      glassId: 'glass-1',
      glassTypeName: 'Templado 6mm',
      heightMm: 1500,
      id: '1',
      modelId: 'model-1',
      modelName: 'Modelo Premium',
      quantity: 2,
      services: [
        { quantity: 2, serviceId: 'service-1', serviceName: 'Corte' },
        { quantity: 1, serviceId: 'service-2', serviceName: 'Pulido' },
      ],
      subtotal: 85_000,
      widthMm: 1000,
    },
    {
      editable: false,
      glassId: 'glass-2',
      glassTypeName: 'Float 4mm',
      heightMm: 1200,
      id: '2',
      modelId: 'model-2',
      modelName: 'Modelo Estándar',
      quantity: 1,
      services: [],
      subtotal: 45_000,
      widthMm: 800,
    },
  ]);

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    notes: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitQuoteMutation = api.quote.submit.useMutation();

  const handleGoBack = () => {
    router.push('/quote');
  };

  const handleRemoveItem = (itemId: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleEditItem = (itemId: string) => {
    setQuoteItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, editable: true } : item)));
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateContactInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactInfo.phone.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!PHONE_REGEX.test(contactInfo.phone)) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    if (!contactInfo.address.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitQuote = async () => {
    if (!validateContactInfo()) {
      return;
    }

    if (quoteItems.length === 0) {
      setErrors({ general: 'Debe tener al menos un ítem en la cotización' });
      return;
    }

    try {
      setIsSubmitting(true);

      // Mock quote submission - in real app this would use the actual quote ID
      await submitQuoteMutation.mutateAsync({
        contact: { address: contactInfo.address, phone: contactInfo.phone },
        quoteId: 'mock-quote-id',
      });

      // Navigate to success page or show success message
      router.push('/catalog?submitted=true');
    } catch {
      setErrors({
        general: 'Error al enviar la cotización. Por favor, intente nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <nav aria-label="Navegación" className="mb-6">
        <Button className="mb-4" onClick={handleGoBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Seguir cotizando
        </Button>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-foreground">Revisar cotización</h1>
            <p className="text-lg text-muted-foreground">
              Revise los detalles de su cotización y proporcione la información de contacto
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{itemCount}</span>
              <span className="text-muted-foreground"> productos</span>
            </div>
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm">
              <span className="font-medium text-primary">${totalAmount.toLocaleString('es-LA')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {errors.general && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive text-sm">{errors.general}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quote Items */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ítems de la cotización
              </CardTitle>
              <CardDescription>Revise y edite los productos incluidos en su cotización</CardDescription>
            </CardHeader>
            <CardContent>
              {quoteItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No hay ítems en la cotización.</p>
                  <Button className="mt-4" onClick={() => router.push('/quote')} variant="outline">
                    Agregar productos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quoteItems.map((item) => (
                    <Card className="border border-border" key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.modelName}</h4>
                            <div className="mt-1 space-y-1 text-muted-foreground text-sm">
                              <div>
                                Dimensiones: {item.widthMm} × {item.heightMm} mm
                              </div>
                              <div>Vidrio: {item.glassTypeName}</div>
                              <div>Cantidad: {item.quantity} unidades</div>
                              {item.services.length > 0 && (
                                <div>
                                  Servicios: {item.services.map((s) => `${s.serviceName} (${s.quantity})`).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="font-medium text-foreground text-lg">
                              ${item.subtotal.toLocaleString('es-LA')}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button
                                disabled={item.editable}
                                onClick={() => handleEditItem(item.id)}
                                size="sm"
                                variant="outline"
                              >
                                Editar
                              </Button>
                              <Button onClick={() => handleRemoveItem(item.id)} size="sm" variant="destructive">
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information & Summary */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de contacto
              </CardTitle>
              <CardDescription>Proporcione sus datos para procesar la cotización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  aria-describedby={errors.telefono ? 'telefono-error' : undefined}
                  className={errors.telefono ? 'border-destructive' : ''}
                  id="telefono"
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  placeholder="Ej: +57 300 123 4567"
                  value={contactInfo.phone}
                />
                {errors.telefono && (
                  <p className="text-destructive text-sm" id="telefono-error">
                    {errors.telefono}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2" htmlFor="direccion">
                  <MapPin className="h-4 w-4" />
                  Dirección <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  aria-describedby={errors.direccion ? 'direccion-error' : undefined}
                  className={errors.direccion ? 'border-destructive' : ''}
                  id="direccion"
                  onChange={(e) => handleContactInfoChange('address', e.target.value)}
                  placeholder="Dirección completa de entrega o instalación"
                  rows={3}
                  value={contactInfo.address}
                />
                {errors.direccion && (
                  <p className="text-destructive text-sm" id="direccion-error">
                    {errors.direccion}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notas"
                  onChange={(e) => handleContactInfoChange('notes', e.target.value)}
                  placeholder="Comentarios o instrucciones especiales"
                  rows={3}
                  value={contactInfo.notes}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la cotización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-medium">{itemCount} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ítems:</span>
                  <span className="font-medium">{quoteItems.length}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-base">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg text-primary">${totalAmount.toLocaleString('es-LA')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-muted-foreground text-xs">
                <p>* Los precios son estimados y pueden variar según disponibilidad.</p>
                <p>* Se contactará por teléfono para confirmar detalles.</p>
              </div>

              <Button className="w-full" disabled={isSubmitting || quoteItems.length === 0} onClick={handleSubmitQuote}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    Enviando cotización...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar cotización
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
