/**
 * Branding form validation schema
 * Zod schema for branding configuration
 */

import { z } from "zod";
import {
  E164_PHONE_REGEX,
  HEX_COLOR_REGEX,
  SOCIAL_URL_REGEX,
} from "../_constants/branding-form.constants";

const socialUrlSchema = z
  .string()
  .url({ message: "URL inválida" })
  .regex(SOCIAL_URL_REGEX, {
    message: "URL debe ser de Facebook, Instagram o LinkedIn",
  })
  .optional()
  .or(z.literal(""));

export const brandingFormSchema = z.object({
  facebookUrl: socialUrlSchema,
  instagramUrl: socialUrlSchema,
  linkedinUrl: socialUrlSchema,
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(HEX_COLOR_REGEX, {
      message: "Color debe estar en formato hexadecimal (#RRGGBB)",
    })
    .optional(),
  secondaryColor: z
    .string()
    .regex(HEX_COLOR_REGEX, {
      message: "Color debe estar en formato hexadecimal (#RRGGBB)",
    })
    .optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z
    .string()
    .regex(E164_PHONE_REGEX, {
      message:
        "Número WhatsApp inválido. Use formato internacional: +507-1234-5678",
    })
    .optional()
    .or(z.literal("")),
});
