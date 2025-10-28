/**
 * Quote Export Server Actions
 *
 * Server-side actions for exporting quotes to PDF and Excel formats.
 * Includes validation, data transformation, and error handling.
 */

"use server";

import type { QuoteStatus } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { headers } from "next/headers";
import { z } from "zod";
import { writeQuoteExcel } from "@/lib/export/excel/quote-excel-workbook";
import { renderQuotePDF } from "@/lib/export/pdf/quote-pdf-document";
import logger from "@/lib/logger";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import type {
  ExportFormat,
  ExportResult,
  QuotePDFData,
} from "@/types/export.types";

/**
 * Constants for quote export calculations
 */
const MM_TO_METERS = 1000;
const DEFAULT_QUOTE_VALIDITY_DAYS = 30;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MS_IN_SECOND = 1000;

/**
 * Calculate default quote validity date (30 days from now)
 */
const getDefaultValidityDate = () =>
  new Date(
    Date.now() +
      DEFAULT_QUOTE_VALIDITY_DAYS *
        HOURS_IN_DAY *
        MINUTES_IN_HOUR *
        SECONDS_IN_MINUTE *
        MS_IN_SECOND
  );

/**
 * Input schema for export actions
 */
const exportQuoteInputSchema = z.object({
  format: z.enum(["pdf", "excel"] satisfies ExportFormat[]),
  quoteId: z.string().cuid("Invalid quote ID format"),
});

type ExportQuoteInput = z.infer<typeof exportQuoteInputSchema>;

/**
 * Calculate totals from quote items
 * Uses unknown type for complex Prisma includes
 */
function calculateQuoteTotals(quote: { items: unknown[]; total: Decimal }) {
  // Calculate subtotal from items
  const subtotal = quote.items.reduce((sum: number, item: unknown) => {
    const typedItem = item as { subtotal: Decimal };
    return sum + Number(typedItem.subtotal);
  }, 0);

  //Tax and discount are not yet implemented in the schema
  // They will be calculated from adjustments in future iterations

  return {
    discount: undefined,
    subtotal,
    tax: undefined,
    total: Number(quote.total),
  };
}

/**
 * Export Quote to PDF
 *
 * @param input - Quote ID and format
 * @returns ExportResult with base64-encoded PDF data
 */
export async function exportQuotePDF(
  input: ExportQuoteInput
): Promise<ExportResult> {
  const startTime = Date.now();

  try {
    // Validate input
    const validatedInput = exportQuoteInputSchema.parse(input);
    const { quoteId } = validatedInput;

    logger.info("Starting PDF export", { quoteId });

    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      logger.warn("Unauthorized PDF export attempt", { quoteId });
      return {
        error: "No autorizado. Por favor inicia sesión.",
        success: false,
      };
    }

    // Fetch quote with all required relations
    const quoteData = await db.quote.findUnique({
      include: {
        adjustments: true,
        items: {
          include: {
            glassType: {
              select: {
                id: true,
                name: true,
              },
            },
            model: {
              include: {
                profileSupplier: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
      where: { id: quoteId },
    });

    // Verify quote exists
    const quote = quoteData;
    if (!quote) {
      logger.warn("Quote not found for PDF export", { quoteId });
      return {
        error: "Cotización no encontrada.",
        success: false,
      };
    }

    // Verify ownership
    if (quote.userId !== session.user.id) {
      logger.warn("Unauthorized access to quote", {
        quoteId,
        quoteOwnerId: quote.userId,
        userId: session.user.id,
      });
      return {
        error: "No tienes permiso para exportar esta cotización.",
        success: false,
      };
    }

    // Calculate totals
    const totals = calculateQuoteTotals(quote);

    // Transform to PDF data format
    const pdfData: QuotePDFData = {
      company: {
        address: "Santiago, Chile",
        email: "contacto@glasify.cl",
        name: "Glasify",
        phone: "+56 9 1234 5678",
      },
      customer: {
        email: quote.user?.email ?? "No especificado",
        name: quote.user?.name ?? "Cliente",
        phone: quote.contactPhone,
      },
      formatting: {
        currency: quote.currency,
        locale: "es-CL",
        timezone: "America/Santiago",
      },
      items: quote.items.map((item) => {
        const widthM = item.widthMm / MM_TO_METERS;
        const heightM = item.heightMm / MM_TO_METERS;
        const area = widthM * heightM;

        return {
          dimensions: {
            area,
            height: heightM,
            unit: "m²" as const,
            width: widthM,
          },
          glass: {
            color: item.colorName ?? undefined,
            colorHexCode: item.colorHexCode ?? undefined,
            colorSurchargePercentage: item.colorSurchargePercentage
              ? Number(item.colorSurchargePercentage)
              : undefined,
            type: item.glassType.name,
          },
          id: item.id,
          name: item.name,
          product: {
            manufacturer: item.model?.profileSupplier?.name,
            name: item.model?.name ?? "Producto",
          },
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          unitPrice: Number(item.subtotal) / item.quantity,
        };
      }),
      quote: {
        createdAt: quote.createdAt,
        id: quote.id,
        itemCount: quote.items.length,
        projectName: quote.projectName || "Sin nombre",
        status: quote.status,
        totalAmount: Number(quote.total),
        validUntil: quote.validUntil || getDefaultValidityDate(),
      },
      totals,
    };

    // Generate PDF
    const pdfBuffer = await renderQuotePDF(pdfData);

    // Convert to base64
    const base64Data = pdfBuffer.toString("base64");

    const duration = Date.now() - startTime;
    logger.info("PDF export completed successfully", {
      duration,
      quoteId,
      sizeBytes: pdfBuffer.length,
    });

    return {
      data: base64Data,
      filename: `Cotizacion_${quote.projectName || "Sin_nombre"}_${new Date().toISOString().split("T")[0]}.pdf`,
      mimeType: "application/pdf",
      success: true,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("PDF export failed", {
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
      quoteId: input.quoteId,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      return {
        error: "Datos de entrada inválidos.",
        success: false,
      };
    }

    return {
      error: "Error al generar el PDF. Por favor intenta nuevamente.",
      success: false,
    };
  }
}

/**
 * Export Quote to Excel
 *
 * @param input - Quote ID and format
 * @returns ExportResult with base64-encoded Excel data
 */
export async function exportQuoteExcel(
  input: ExportQuoteInput
): Promise<ExportResult> {
  const startTime = Date.now();

  try {
    // Validate input
    const validatedInput = exportQuoteInputSchema.parse(input);
    const { quoteId } = validatedInput;

    logger.info("Starting Excel export", { quoteId });

    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      logger.warn("Unauthorized Excel export attempt", { quoteId });
      return {
        error: "No autorizado. Por favor inicia sesión.",
        success: false,
      };
    }

    // Fetch quote with all required relations
    const quoteData = await db.quote.findUnique({
      include: {
        adjustments: true,
        items: {
          include: {
            glassType: {
              select: {
                id: true,
                name: true,
              },
            },
            model: {
              include: {
                profileSupplier: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
      where: { id: quoteId },
    });

    // Verify quote exists
    // Type assertion for complex Prisma include with all relations
    const quote = quoteData as Record<string, unknown> & {
      id: string;
      userId: string;
      projectName: string | null;
      status: QuoteStatus;
      total: Decimal;
      currency: string;
      contactPhone: string | null;
      createdAt: Date;
      validUntil: Date | null;
      items: Record<string, unknown>[];
      user: { name: string | null; email: string | null } | null;
    };
    if (!quote) {
      logger.warn("Quote not found for Excel export", { quoteId });
      return {
        error: "Cotización no encontrada.",
        success: false,
      };
    }

    // Verify ownership
    if (quote.userId !== session.user.id) {
      logger.warn("Unauthorized access to quote", {
        quoteId,
        quoteOwnerId: quote.userId,
        userId: session.user.id,
      });
      return {
        error: "No tienes permiso para exportar esta cotización.",
        success: false,
      };
    }

    // Calculate totals
    const totals = calculateQuoteTotals(quote);

    // Transform to Excel data format
    type ExcelQuoteInfo = {
      id: string;
      projectName: string;
      status: QuoteStatus;
      createdAt: Date;
      validUntil: Date;
      totalAmount: number;
      itemCount: number;
    };

    type ExcelCustomerInfo = {
      name: string;
      email: string;
      phone: string | null;
    };

    type ExcelItemInfo = {
      itemNumber: number;
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      productName: string;
      manufacturer?: string;
      category?: string;
      width: number;
      height: number;
      area: number;
      glassType: string;
    };

    type ExcelCompanyInfo = {
      name: string;
      address: string;
      phone: string;
      email: string;
    };

    type ExcelFormattingInfo = {
      locale: string;
      currency: string;
      timezone: string;
    };

    type ExcelTotals = {
      subtotal: number;
      tax?: number;
      discount?: number;
      total: number;
    };

    type QuoteExcelDataTyped = {
      quote: ExcelQuoteInfo;
      customer: ExcelCustomerInfo;
      items: ExcelItemInfo[];
      totals: ExcelTotals;
      company: ExcelCompanyInfo;
      formatting: ExcelFormattingInfo;
    };

    const excelData: QuoteExcelDataTyped = {
      company: {
        address: "Santiago, Chile",
        email: "contacto@glasify.cl",
        name: "Glasify",
        phone: "+56 9 1234 5678",
      },
      customer: {
        email: quote.user?.email ?? "No especificado",
        name: quote.user?.name ?? "Cliente",
        phone: quote.contactPhone,
      },
      formatting: {
        currency: quote.currency,
        locale: "es-CL",
        timezone: "America/Santiago",
      },
      items: quote.items.map(
        (rawItem: Record<string, unknown>, index: number): ExcelItemInfo => {
          // Type assertion for Prisma item with all relations
          const item = rawItem as {
            id: string;
            name: string;
            quantity: number;
            widthMm: number;
            heightMm: number;
            subtotal: Decimal;
            glassType: { name: string };
            model: {
              name: string;
              profileSupplier?: { name: string };
              category?: { name: string };
            } | null;
          };

          const widthM = item.widthMm / MM_TO_METERS;
          const heightM = item.heightMm / MM_TO_METERS;
          const area = widthM * heightM;

          return {
            area,
            category: item.model?.category?.name,
            glassType: item.glassType.name,
            height: heightM,
            id: item.id,
            itemNumber: index + 1,
            manufacturer: item.model?.profileSupplier?.name,
            name: item.name,
            productName: item.model?.name ?? "Producto",
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
            unitPrice: Number(item.subtotal) / item.quantity,
            width: widthM,
          };
        }
      ),
      quote: {
        createdAt: quote.createdAt,
        id: quote.id,
        itemCount: quote.items.length,
        projectName: quote.projectName || "Sin nombre",
        status: quote.status,
        totalAmount: Number(quote.total),
        validUntil: quote.validUntil || getDefaultValidityDate(),
      },
      totals,
    };

    // Generate Excel
    const excelBuffer = await writeQuoteExcel(excelData);

    // Convert to base64
    const base64Data = excelBuffer.toString("base64");

    const duration = Date.now() - startTime;
    logger.info("Excel export completed successfully", {
      duration,
      quoteId,
      sizeBytes: excelBuffer.length,
    });

    return {
      data: base64Data,
      filename: `Cotizacion_${quote.projectName || "Sin_nombre"}_${new Date().toISOString().split("T")[0]}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      success: true,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Excel export failed", {
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
      quoteId: input.quoteId,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      return {
        error: "Datos de entrada inválidos.",
        success: false,
      };
    }

    return {
      error: "Error al generar el archivo Excel. Por favor intenta nuevamente.",
      success: false,
    };
  }
}
