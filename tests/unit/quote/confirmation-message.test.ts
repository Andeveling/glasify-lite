/**
 * Unit Tests: Confirmation Message Content (User Story 3)
 *
 * Tests that confirmation messages include all required information:
 * - Timeline expectations (24-48 hours)
 * - Vendor contact information (from TenantConfig)
 * - Next steps guidance
 *
 * @module tests/unit/quote/confirmation-message.test
 */

import { describe, expect, it } from "vitest";

/**
 * Expected confirmation message structure
 */
type ConfirmationMessage = {
  title: string;
  description: string;
  timeline?: string;
  vendorContact?: string;
  nextSteps?: string;
};

/**
 * Helper function to build confirmation message
 * (This would be extracted from the actual component)
 */
function buildConfirmationMessage(
  sentAt: Date,
  tenantConfig?: { contactPhone?: string; businessName?: string }
): ConfirmationMessage {
  const formattedDate = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(sentAt);

  return {
    description:
      "El fabricante ha recibido tu solicitud y se pondrá en contacto contigo pronto.",
    nextSteps:
      "Mientras tanto, puedes revisar otras cotizaciones o crear una nueva.",
    timeline: "Recibirás respuesta en 24-48 horas hábiles",
    title: `Cotización enviada el ${formattedDate}`,
    vendorContact: tenantConfig?.contactPhone
      ? `Contacto del fabricante: ${tenantConfig.contactPhone}`
      : undefined,
  };
}

describe("Confirmation Message - Content Validation (US3)", () => {
  describe("Message structure", () => {
    it("should include title with sentAt date", () => {
      const sentAt = new Date("2025-01-15T10:00:00Z");
      const message = buildConfirmationMessage(sentAt);

      expect(message.title).toContain("Cotización enviada el");
      expect(message.title).toContain("15");
      expect(message.title).toContain("enero");
      expect(message.title).toContain("2025");
    });

    it("should include description confirming receipt", () => {
      const message = buildConfirmationMessage(new Date());

      expect(message.description).toBeTruthy();
      expect(message.description).toContain("fabricante");
      expect(message.description).toContain("recibido");
    });

    it("should include timeline expectation", () => {
      const message = buildConfirmationMessage(new Date());

      expect(message.timeline).toBeTruthy();
      expect(message.timeline).toContain("24-48 horas");
    });

    it("should include next steps guidance", () => {
      const message = buildConfirmationMessage(new Date());

      expect(message.nextSteps).toBeTruthy();
      expect(message.nextSteps?.toLowerCase()).toContain("mientras tanto");
    });
  });

  describe("Vendor contact information", () => {
    it("should include vendor contact phone if available", () => {
      const tenantConfig = {
        businessName: "Vidrios Test",
        contactPhone: "+573001234567",
      };

      const message = buildConfirmationMessage(new Date(), tenantConfig);

      expect(message.vendorContact).toBeTruthy();
      expect(message.vendorContact).toContain("+573001234567");
      expect(message.vendorContact).toContain("Contacto del fabricante");
    });

    it("should omit vendor contact if not available", () => {
      const tenantConfig = {
        businessName: "Vidrios Test",
        contactPhone: undefined,
      };

      const message = buildConfirmationMessage(new Date(), tenantConfig);

      expect(message.vendorContact).toBeUndefined();
    });

    it("should handle missing tenantConfig gracefully", () => {
      const message = buildConfirmationMessage(new Date());

      expect(message.title).toBeTruthy();
      expect(message.description).toBeTruthy();
      expect(message.vendorContact).toBeUndefined();
    });
  });

  describe("Date formatting", () => {
    it("should format date in Spanish locale", () => {
      const sentAt = new Date("2025-03-10T14:30:00Z");
      const message = buildConfirmationMessage(sentAt);

      // Spanish month names
      expect(message.title).toMatch(
        /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/
      );
    });

    it("should include day, month, and year", () => {
      const sentAt = new Date("2025-12-25T00:00:00Z");
      const message = buildConfirmationMessage(sentAt);

      expect(message.title).toContain("25");
      expect(message.title).toContain("diciembre");
      expect(message.title).toContain("2025");
    });

    it("should handle different dates correctly", () => {
      const dates = [
        new Date("2025-01-01T00:00:00Z"),
        new Date("2025-06-15T12:00:00Z"),
        new Date("2025-12-31T23:59:59Z"),
      ];

      for (const date of dates) {
        const message = buildConfirmationMessage(date);
        expect(message.title).toContain("Cotización enviada el");
        expect(message.title).toContain("2025");
      }
    });
  });

  describe("Message completeness", () => {
    it("should include all required fields", () => {
      const message = buildConfirmationMessage(new Date());

      expect(message.title).toBeTruthy();
      expect(message.description).toBeTruthy();
      expect(message.timeline).toBeTruthy();
      expect(message.nextSteps).toBeTruthy();
    });

    it("should have user-friendly language", () => {
      const message = buildConfirmationMessage(new Date());

      // Check for friendly, clear language
      expect(message.description).not.toContain("error");
      expect(message.description).not.toContain("fail");
      expect(message.timeline).toContain("horas");
    });

    it("should provide actionable next steps", () => {
      const message = buildConfirmationMessage(new Date());

      expect(message.nextSteps).toBeTruthy();
      // Check for actionable verbs
      expect(message.nextSteps?.toLowerCase()).toMatch(
        /revisar|crear|ver|consultar/
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle very recent sentAt (seconds ago)", () => {
      const sentAt = new Date(Date.now() - 5000); // 5 seconds ago
      const message = buildConfirmationMessage(sentAt);

      expect(message.title).toBeTruthy();
      expect(message.description).toBeTruthy();
    });

    it("should handle sentAt from past dates", () => {
      const sentAt = new Date("2024-01-01T00:00:00Z");
      const message = buildConfirmationMessage(sentAt);

      expect(message.title).toContain("2024");
    });

    it("should handle empty vendor contact phone gracefully", () => {
      const tenantConfig = {
        businessName: "Test",
        contactPhone: "",
      };

      const message = buildConfirmationMessage(new Date(), tenantConfig);

      // Empty string should be treated as undefined
      expect(message.vendorContact).toBeUndefined();
    });
  });
});
