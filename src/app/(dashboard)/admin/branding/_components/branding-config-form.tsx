'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { api } from '@/trpc/react';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

const socialUrlSchema = z
  .string()
  .url({ message: 'URL inválida' })
  .regex(/^https?:\/\/(www\.)?(facebook|instagram|linkedin)\.com/, {
    message: 'URL debe ser de Facebook, Instagram o LinkedIn',
  })
  .optional()
  .or(z.literal(''));

const brandingFormSchema = z.object({
  facebookUrl: socialUrlSchema,
  instagramUrl: socialUrlSchema,
  linkedinUrl: socialUrlSchema,
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(hexColorRegex, {
      message: 'Color debe estar en formato hexadecimal (#RRGGBB)',
    })
    .optional(),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, {
      message: 'Color debe estar en formato hexadecimal (#RRGGBB)',
    })
    .optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z
    .string()
    .regex(e164PhoneRegex, {
      message: 'Número WhatsApp inválido. Use formato internacional: +507-1234-5678',
    })
    .optional()
    .or(z.literal('')),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

interface BrandingConfigFormProps {
  initialData: {
    businessName: string;
    facebookUrl: string | null;
    instagramUrl: string | null;
    linkedinUrl: string | null;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    whatsappEnabled: boolean;
    whatsappNumber: string | null;
  };
}

export function BrandingConfigForm({ initialData }: BrandingConfigFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const utils = api.useUtils();
  const updateBranding = api.tenantConfig.updateBranding.useMutation({
    onError: (error) => {
      toast.error('Error al actualizar', {
        description: error.message,
      });
    },
    onSuccess: async () => {
      await utils.tenantConfig.getBranding.invalidate();
      toast.success('Branding actualizado', {
        description: 'Los cambios se reflejarán inmediatamente.',
      });
    },
  });

  const form = useForm<BrandingFormValues>({
    defaultValues: {
      facebookUrl: initialData.facebookUrl || '',
      instagramUrl: initialData.instagramUrl || '',
      linkedinUrl: initialData.linkedinUrl || '',
      logoUrl: initialData.logoUrl || '',
      primaryColor: initialData.primaryColor || '#3B82F6',
      secondaryColor: initialData.secondaryColor || '#1E40AF',
      whatsappEnabled: initialData.whatsappEnabled,
      whatsappNumber: initialData.whatsappNumber || '',
    },
    resolver: zodResolver(brandingFormSchema),
  });

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Formato no permitido', {
        description: 'Use PNG, JPEG, SVG o WEBP.',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Archivo muy grande', {
        description: 'El logo debe pesar menos de 2MB.',
      });
      return;
    }

    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setLogoPreview(null);
    form.setValue('logoUrl', '');
  };

  const onSubmit = async (data: BrandingFormValues) => {
    try {
      // If new logo selected, upload it first
      let logoUrl = data.logoUrl;
      if (selectedFile) {
        // Note: File upload via tRPC needs special handling
        // For now, we'll use a FormData API route
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload-logo', {
          body: formData,
          method: 'POST',
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir logo');
        }

        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.logoUrl;
      }

      await updateBranding.mutateAsync({
        ...data,
        logoUrl: logoUrl || undefined,
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Logo Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Logo Corporativo</h3>

          <FormField
            control={form.control}
            name="logoUrl"
            render={() => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
                          <Image alt="Logo preview" className="object-contain" fill src={logoPreview} />
                        </div>
                        <Button
                          className="-right-2 -top-2 absolute h-6 w-6 rounded-full"
                          onClick={handleRemoveLogo}
                          size="icon"
                          type="button"
                          variant="destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <Input
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoSelect}
                      type="file"
                    />
                  </div>
                </FormControl>
                <FormDescription>PNG, JPEG, SVG o WEBP. Máximo 2MB.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Colors Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Colores Corporativos</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Primario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="w-20" />
                      <Input type="text" {...field} placeholder="#3B82F6" />
                    </div>
                  </FormControl>
                  <FormDescription>Color principal de tu marca</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Secundario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="w-20" />
                      <Input type="text" {...field} placeholder="#1E40AF" />
                    </div>
                  </FormControl>
                  <FormDescription>Color complementario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Social Media Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Redes Sociales</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="facebookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://facebook.com/tuempresa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://instagram.com/tuempresa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://linkedin.com/company/tuempresa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">WhatsApp</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+507-1234-5678" />
                  </FormControl>
                  <FormDescription>Formato internacional (E.164)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Botón WhatsApp</FormLabel>
                    <FormDescription>Mostrar en catálogo y cotizaciones</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button disabled={updateBranding.isPending} onClick={() => form.reset()} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={updateBranding.isPending} type="submit">
            {updateBranding.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
