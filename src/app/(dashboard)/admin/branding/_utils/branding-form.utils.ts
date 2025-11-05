/**
 * Branding form utilities
 * Handles data transformation and file validation
 */

import { toast } from "sonner";
import type { z } from "zod";
import {
  ALLOWED_FILE_TYPES,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  MAX_LOGO_FILE_SIZE_BYTES,
} from "../_constants/branding-form.constants";
import type { brandingFormSchema } from "../_schemas/branding-form.schema";

export type BrandingFormValues = z.infer<typeof brandingFormSchema>;

export type BrandingInitialData = {
  businessName: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
};

/**
 * Get default values for branding form initialization
 */
export function getBrandingFormDefaults(
  initialData: BrandingInitialData
): BrandingFormValues {
  return {
    facebookUrl: initialData.facebookUrl || "",
    instagramUrl: initialData.instagramUrl || "",
    linkedinUrl: initialData.linkedinUrl || "",
    logoUrl: initialData.logoUrl || "",
    primaryColor: initialData.primaryColor || DEFAULT_PRIMARY_COLOR,
    secondaryColor: initialData.secondaryColor || DEFAULT_SECONDARY_COLOR,
    whatsappEnabled: initialData.whatsappEnabled,
    whatsappNumber: initialData.whatsappNumber || "",
  };
}

/**
 * Validate logo file type and size
 * Shows toast error messages and returns validation result
 */
export function validateLogoFile(file: File): boolean {
  // Validate file type
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES)[number]
    )
  ) {
    toast.error("Formato no permitido", {
      description: "Use PNG, JPEG, SVG o WEBP.",
    });
    return false;
  }

  // Validate file size
  if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
    toast.error("Archivo muy grande", {
      description: "El logo debe pesar menos de 2MB.",
    });
    return false;
  }

  return true;
}

/**
 * Upload logo file to server
 * Returns the uploaded logo URL
 */
export async function uploadLogoFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("/api/upload-logo", {
    body: formData,
    method: "POST",
  });

  if (!uploadResponse.ok) {
    throw new Error("Error al subir logo");
  }

  const uploadData = (await uploadResponse.json()) as { logoUrl: string };
  return uploadData.logoUrl;
}
