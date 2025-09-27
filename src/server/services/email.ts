import type { Quote } from "@prisma/client";
import logger from "@/lib/logger";

type EmailTemplate = {
  subject: string;
  body: string;
};

type QuoteEmailData = {
  quote: Quote & {
    manufacturer: {
      name: string;
      currency: string;
    };
    items: Array<{
      subtotal: string | number;
    }>;
  };
  contactPhone: string;
  contactAddress: string;
};

const formatCurrency = (amount: number | string, currency: string) => {
  const numericAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (currency === "CLP") {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(numericAmount);
  }

  return new Intl.NumberFormat("es-LA", {
    style: "currency",
    currency,
  }).format(numericAmount);
};

const createQuoteEmailTemplate = (data: QuoteEmailData): EmailTemplate => {
  const { quote, contactPhone, contactAddress } = data;

  const subject = `Nueva Cotización ${quote.id} - ${quote.manufacturer.name}`;

  const totalFormatted = formatCurrency(quote.total.toString(), quote.currency);
  const validUntilFormatted = quote.validUntil
    ? new Intl.DateTimeFormat("es-LA", {
        dateStyle: "long",
      }).format(quote.validUntil)
    : "No especificada";

  const itemCount = quote.items.length;
  const itemsText = itemCount === 1 ? "ítem" : "ítems";

  const body = `
Estimado/a,

Ha recibido una nueva cotización desde la plataforma Glasify:

DETALLES DE LA COTIZACIÓN
========================
ID de Cotización: ${quote.id}
Fabricante: ${quote.manufacturer.name}
Total: ${totalFormatted}
Cantidad de ítems: ${itemCount} ${itemsText}
Válida hasta: ${validUntilFormatted}

INFORMACIÓN DE CONTACTO
======================
Teléfono: ${contactPhone}
Dirección del proyecto: ${contactAddress}

Para ver el detalle completo de la cotización, acceda a su panel de administración.

---
Este es un mensaje automático de Glasify.
No responda directamente a este correo.
  `.trim();

  return { subject, body };
};

type SendEmailOptions = {
  to: string;
  template: EmailTemplate;
  quoteId: string;
};

const sendEmailMock = async (options: SendEmailOptions): Promise<boolean> => {
  const { to, template, quoteId } = options;

  // Mock implementation - in production this would integrate with a real email service
  const mockEmail = {
    timestamp: new Date().toISOString(),
    to,
    subject: template.subject,
    body: template.body,
    quoteId,
    status: "sent" as const,
  };

  // Log to console in development (this would be replaced with actual email sending)
  if (process.env.NODE_ENV === "development") {
    /* eslint-disable no-console */
    logger.info("📧 Mock Email Sent:", {
      to: mockEmail.to,
      subject: mockEmail.subject,
      quoteId: mockEmail.quoteId,
    });

    /* eslint-enable no-console */
  }

  // Simulate email sending delay
  const DelaySimulation = 100;
  await new Promise((resolve) => {
    setTimeout(resolve, DelaySimulation);
  });

  // Mock success response
  return true;
};

export const sendQuoteNotification = async (
  data: QuoteEmailData,
  recipientEmail: string
): Promise<boolean> => {
  try {
    const template = createQuoteEmailTemplate(data);

    const success = await sendEmailMock({
      to: recipientEmail,
      template,
      quoteId: data.quote.id,
    });

    return success;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      logger.error("❌ Error sending quote notification:", error);
      /* eslint-enable no-console */
    }
    return false;
  }
};

export type { EmailTemplate, QuoteEmailData };
