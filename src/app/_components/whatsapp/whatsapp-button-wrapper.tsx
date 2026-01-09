"use client";

import { useEffect, useState } from "react";
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
 * Fetches branding config and only renders button if WhatsApp is enabled.
 * Uses client-only rendering pattern to prevent hydration mismatch.
 *
 * The component waits until mounted on the client before querying,
 * ensuring server and client render the same initial content (null).
 *
 * US-010: Botón de WhatsApp en catálogo y cotización
 * REQ-010: Botón solo visible si tenant configuró WhatsApp
 */
export function WhatsAppButtonWrapper({
  message,
  variant = "inline",
  className,
}: WhatsAppButtonWrapperProps) {
  // Track client-side mount to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: branding } = api.tenantConfig.getBranding.useQuery(undefined, {
    // Only enable query after component is mounted on client
    enabled: isMounted,
  });

  // During SSR and initial client render, return null to match
  if (!isMounted) {
    return null;
  }

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
