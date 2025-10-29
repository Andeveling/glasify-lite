"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBrandingMutation } from "../_hooks/use-branding-mutation";
import { useLogoUpload } from "../_hooks/use-logo-upload";
import { brandingFormSchema } from "../_schemas/branding-form.schema";
import {
  type BrandingFormValues,
  type BrandingInitialData,
  getBrandingFormDefaults,
  uploadLogoFile,
} from "../_utils/branding-form.utils";

type BrandingConfigFormProps = {
  initialData: BrandingInitialData;
};

export function BrandingConfigForm({ initialData }: BrandingConfigFormProps) {
  const { updateBranding, isPending } = useBrandingMutation();
  const { logoPreview, selectedFile, handleLogoSelect, handleRemoveLogo } =
    useLogoUpload(initialData.logoUrl);

  const form = useForm<BrandingFormValues>({
    defaultValues: getBrandingFormDefaults(initialData),
    resolver: zodResolver(brandingFormSchema),
  });

  const handleRemoveLogoWithForm = () => {
    handleRemoveLogo();
    form.setValue("logoUrl", "");
  };

  const onSubmit = async (data: BrandingFormValues) => {
    try {
      // If new logo selected, upload it first
      let logoUrl = data.logoUrl;
      if (selectedFile) {
        logoUrl = await uploadLogoFile(selectedFile);
      }

      await updateBranding({
        ...data,
        logoUrl: logoUrl || undefined,
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
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
                          <Image
                            alt="Logo preview"
                            className="object-contain"
                            fill
                            src={logoPreview}
                          />
                        </div>
                        <Button
                          className="-right-2 -top-2 absolute h-6 w-6 rounded-full"
                          onClick={handleRemoveLogoWithForm}
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
                <FormDescription>
                  PNG, JPEG, SVG o WEBP. Máximo 2MB.
                </FormDescription>
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
                    <Input
                      {...field}
                      placeholder="https://facebook.com/tuempresa"
                    />
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
                    <Input
                      {...field}
                      placeholder="https://instagram.com/tuempresa"
                    />
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
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/company/tuempresa"
                    />
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
                  <FormDescription>
                    Formato internacional (E.164)
                  </FormDescription>
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
                    <FormDescription>
                      Mostrar en catálogo y cotizaciones
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            disabled={isPending}
            onClick={() => form.reset()}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
