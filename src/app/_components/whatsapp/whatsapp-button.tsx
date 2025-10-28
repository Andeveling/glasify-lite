'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message: string;
  variant?: 'floating' | 'inline';
  className?: string;
}

/**
 * WhatsApp Button Component
 *
 * Opens WhatsApp chat with pre-filled message
 * Supports floating (fixed position) and inline variants
 *
 * US-010: Botón de WhatsApp en catálogo y cotización
 *
 * @param phoneNumber - E.164 format phone number (e.g., "+5076123456")
 * @param message - Pre-filled message text
 * @param variant - Display style: 'floating' (bottom-right) or 'inline' (default)
 * @param className - Additional CSS classes
 */
export function WhatsAppButton({ phoneNumber, message, variant = 'inline', className }: WhatsAppButtonProps) {
  const handleClick = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'floating') {
    return (
      <button
        aria-label="Contactar por WhatsApp"
        className={cn(
          'fixed right-6 bottom-6 z-50',
          'flex h-14 w-14 items-center justify-center',
          'rounded-full bg-[#25D366] text-white shadow-lg',
          'transition-all hover:scale-110 hover:shadow-xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
          className
        )}
        onClick={handleClick}
        type="button"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    );
  }

  return (
    <Button
      aria-label="Contactar por WhatsApp"
      className={cn('bg-[#25D366] hover:bg-[#1EBE57]', 'text-white', className)}
      onClick={handleClick}
      type="button"
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Contactar por WhatsApp
    </Button>
  );
}
