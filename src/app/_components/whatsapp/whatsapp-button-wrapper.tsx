"use client";

import { api } from "@/trpc/react";
import { WhatsAppButton } from "./whatsapp-button";

type WhatsAppButtonWrapperProps = {
  message: string;
  variant?: "floating" | "inline";
  className?: string;
};

/**
 * WhatsApp Button Wrapper
 *
 * Fetches branding config and only renders button if WhatsApp is enabled
 *
 * US-010: Botón de WhatsApp en catálogo y cotización
 * REQ-010: Botón solo visible si tenant configuró WhatsApp
 */
export function WhatsAppButtonWrapper({
  message,
  variant = "inline",
  className,
}: WhatsAppButtonWrapperProps) {
  const { data: branding } = api.tenantConfig.getBranding.useQuery();

  if (!(branding?.whatsappEnabled && branding?.whatsappNumber)) {
    return null;
  }

  return (
    <WhatsAppButton
      className={className}
      message={message}
      phoneNumber={branding.whatsappNumber}
      variant={variant}
    />
  );
}
