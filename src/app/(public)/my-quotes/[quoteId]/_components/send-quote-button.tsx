'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSendQuote } from '@/hooks/use-send-quote';
import type { QuoteDetailSchema } from '@/server/api/routers/quote/quote.schemas';
import { ContactInfoModal } from './contact-info-modal';

interface SendQuoteButtonProps {
  quote: Pick<QuoteDetailSchema, 'id' | 'status' | 'contactPhone'>;
  /** User email for pre-filling contact form */
  userEmail?: string;
}

/**
 * Button to send a draft quote to vendor
 * Shows only for draft quotes
 * Opens modal to capture/confirm contact information before sending
 */
export function SendQuoteButton({ quote, userEmail }: SendQuoteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { mutate: sendQuote, isPending } = useSendQuote({
    // Redirect to public user quote view, not admin dashboard
    redirectUrl: (quoteId) => `/my-quotes/${quoteId}`,
    onSuccess: () => {
      // Show redirecting state briefly before redirect
      setIsRedirecting(true);
      // Modal will close after redirect overlay shows
      setTimeout(() => {
        setIsModalOpen(false);
      }, 300);
    },
  });

  // Only show button for draft quotes
  if (quote.status !== 'draft') {
    return null;
  }

  const handleSendClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSend = (data: { contactPhone: string; contactEmail?: string }) => {
    sendQuote({
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      quoteId: quote.id,
    });
  };

  return (
    <>
      <Button className="gap-2" disabled={isPending || isRedirecting} size="sm" onClick={handleSendClick}>
        <Send className="h-4 w-4" />
        {isPending ? 'Enviando...' : 'Enviar Cotización'}
      </Button>

      <ContactInfoModal
        defaultValues={{
          contactEmail: userEmail ?? '', // Pre-fill with user's email from session
          contactPhone: quote.contactPhone ?? '',
        }}
        isLoading={isPending}
        isRedirecting={isRedirecting}
        onClose={() => {
          setIsModalOpen(false);
          setIsRedirecting(false);
        }}
        onSubmit={handleConfirmSend}
        open={isModalOpen}
      />
    </>
  );
}
