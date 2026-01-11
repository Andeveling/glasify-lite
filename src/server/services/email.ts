import type { Quote } from "@prisma/generated/client";
import logger from "@/lib/logger";
import { getTenantConfig } from "../utils/tenant";

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

/**
 * Format currency using tenant locale configuration
 *
 * @param amount - Amount to format
 * @param currency - ISO 4217 currency code
 * @param locale - IETF BCP 47 locale (from TenantConfig)
 * @returns Formatted currency string
 */
const formatCurrency = (
  amount: number | string,
  currency: string,
  locale: string
) => {
  const numericAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    currency,
    style: "currency",
  }).format(numericAmount);
};

const createQuoteEmailTemplate = async (
  data: QuoteEmailData
): Promise<EmailTemplate> => {
  const { quote, contactPhone, contactAddress } = data;

  // Fetch tenant config for locale (single source of truth)
  const tenantConfig = await getTenantConfig();

  const subject = `Nueva Cotización ${quote.id} - ${quote.manufacturer.name}`;

  const totalFormatted = formatCurrency(
    quote.total.toString(),
    quote.currency,
    tenantConfig.locale
  );
  const validUntilFormatted = quote.validUntil
    ? new Intl.DateTimeFormat(tenantConfig.locale, {
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

  return { body, subject };
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
    body: template.body,
    quoteId,
    status: "sent" as const,
    subject: template.subject,
    timestamp: new Date().toISOString(),
    to,
  };

  // Log to console in development (this would be replaced with actual email sending)
  if (process.env.NODE_ENV === "development") {
    /* eslint-disable no-console */
    logger.info("📧 Mock Email Sent:", {
      quoteId: mockEmail.quoteId,
      subject: mockEmail.subject,
      to: mockEmail.to,
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
    const template = await createQuoteEmailTemplate(data);

    const success = await sendEmailMock({
      quoteId: data.quote.id,
      template,
      to: recipientEmail,
    });

    return success;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      logger.error("❌ Error sending quote notification:", {
        error: error instanceof Error ? error.message : String(error),
      });
      /* eslint-enable no-console */
    }
    return false;
  }
};

export type { EmailTemplate, QuoteEmailData };
