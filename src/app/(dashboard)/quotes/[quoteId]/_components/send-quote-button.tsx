'use client';

import type { Quote } from '@prisma/client';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { ContactInfoModal } from '@/app/_components/contact-info-modal';
import { Button } from '@/components/ui/button';
import { useSendQuote } from '@/hooks/use-send-quote';

interface SendQuoteButtonProps {
  quote: Pick<Quote, 'id' | 'status' | 'contactPhone'>;
}

/**
 * Button to send a draft quote to vendor
 * Shows only for draft quotes
 * Opens modal to capture/confirm contact information before sending
 */
export function SendQuoteButton({ quote }: SendQuoteButtonProps) {
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const { mutate: sendQuote, isPending } = useSendQuote();
  // Only show button for draft quotes
  if (quote.status !== 'draft') {
    return null;
  }

  const handleSendClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSend = (data: { contactPhone: string; contactEmail?: string }) => {
    sendQuote(
      {
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        quoteId: quote.id,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <>
      <Button className="gap-2" disabled={isPending} onClick={handleSendClick} size="lg">
        <Send className="h-4 w-4" />
        {isPending ? 'Enviando...' : 'Enviar Cotización'}
      </Button>

      <ContactInfoModal
        defaultValues={{
          contactPhone: quote.contactPhone ?? '',
        }}
        isLoading={isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleConfirmSend}
        open={isModalOpen}
      />
    </>
  );
}
