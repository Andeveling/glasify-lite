/**
 * Status Configuration Tests
 *
 * Validates the quote status configuration to ensure labels,
 * icons, tooltips, and CTAs match the intended semantics.
 *
 * @see docs/fixes/quote-status-semantic-clarification.md
 */

import { describe, expect, it } from "vitest";
import { STATUS_CONFIG } from "../../src/app/(public)/my-quotes/_utils/status-config";

// No setup needed - testing pure configuration object

describe("Quote Status Configuration", () => {
  describe("Draft Status (Pendiente)", () => {
    const config = STATUS_CONFIG.draft;

    it('should have "Pendiente" label (not "En edición")', () => {
      expect(config.label).toBe("Pendiente");
      expect(config.label).not.toBe("En edición");
    });

    it("should use FileText icon (not Edit3)", () => {
      expect(config.iconName).toBe("file-text");
      expect(config.iconName).not.toBe("edit");
    });

    it("should indicate read-only state in tooltip", () => {
      expect(config.tooltip).toContain("lista para enviar");
      expect(config.tooltip).not.toContain("modificándola");
    });

    it('should have "view" action (not "edit")', () => {
      expect(config.cta?.action).toBe("view");
      expect(config.cta?.action).not.toBe("edit");
      expect(config.cta?.label).toBe("Ver detalles");
      expect(config.cta?.label).not.toBe("Continuar editando");
    });

    it("should use secondary variant (amber/yellow)", () => {
      expect(config.variant).toBe("secondary");
      expect(config.color).toBe("secondary");
    });
  });

  describe("Sent Status (Enviada)", () => {
    const config = STATUS_CONFIG.sent;

    it('should have "Enviada" label', () => {
      expect(config.label).toBe("Enviada");
    });

    it("should use Send icon", () => {
      expect(config.iconName).toBe("send");
    });

    it("should indicate sent state in tooltip", () => {
      expect(config.tooltip).toContain("enviada");
    });

    it('should have "view" action', () => {
      expect(config.cta?.action).toBe("view");
      expect(config.cta?.label).toBe("Ver detalles");
    });

    it("should use default variant (blue)", () => {
      expect(config.variant).toBe("default");
      expect(config.color).toBe("default");
    });
  });

  describe("Canceled Status (Cancelada)", () => {
    const config = STATUS_CONFIG.canceled;

    it('should have "Cancelada" label', () => {
      expect(config.label).toBe("Cancelada");
    });

    it("should use XCircle icon", () => {
      expect(config.iconName).toBe("x-circle");
    });

    it("should indicate canceled state in tooltip", () => {
      expect(config.tooltip).toContain("cancelada");
    });

    it('should have "duplicate" action', () => {
      expect(config.cta?.action).toBe("duplicate");
      expect(config.cta?.label).toBe("Duplicar");
    });

    it("should use destructive variant (red)", () => {
      expect(config.variant).toBe("destructive");
      expect(config.color).toBe("destructive");
    });
  });

  describe("Configuration Consistency", () => {
    it("should have all required status configs", () => {
      expect(STATUS_CONFIG).toHaveProperty("draft");
      expect(STATUS_CONFIG).toHaveProperty("sent");
      expect(STATUS_CONFIG).toHaveProperty("canceled");
    });

    it("should have consistent structure for all statuses", () => {
      const statuses: Array<keyof typeof STATUS_CONFIG> = [
        "draft",
        "sent",
        "canceled",
      ];

      for (const status of statuses) {
        const config = STATUS_CONFIG[status];

        expect(config).toHaveProperty("label");
        expect(config).toHaveProperty("icon");
        expect(config).toHaveProperty("iconName");
        expect(config).toHaveProperty("tooltip");
        expect(config).toHaveProperty("variant");
        expect(config).toHaveProperty("color");

        // All properties should be defined
        expect(config.label).toBeDefined();
        expect(config.icon).toBeDefined();
        expect(config.iconName).toBeDefined();
        expect(config.tooltip).toBeDefined();
        expect(config.variant).toBeDefined();
        expect(config.color).toBeDefined();

        // variant and color should match
        expect(config.variant).toBe(config.color);
      }
    });

    it("should not suggest editability for draft status", () => {
      const config = STATUS_CONFIG.draft;

      // Label should not contain edit-related words
      expect(config.label.toLowerCase()).not.toContain("edit");
      expect(config.label.toLowerCase()).not.toContain("edición");
      expect(config.label.toLowerCase()).not.toContain("modificar");

      // Tooltip should not suggest editing
      expect(config.tooltip.toLowerCase()).not.toContain("editar");
      expect(config.tooltip.toLowerCase()).not.toContain("modificar");
      expect(config.tooltip.toLowerCase()).not.toContain("continuar");

      // CTA should not be edit action
      expect(config.cta?.action).not.toBe("edit");
      expect(config.cta?.label.toLowerCase()).not.toContain("editar");
      expect(config.cta?.label.toLowerCase()).not.toContain("continuar");
    });

    it("should indicate read-only nature for draft status", () => {
      const config = STATUS_CONFIG.draft;

      // Tooltip should indicate it's ready to send (not edit)
      expect(config.tooltip).toContain("lista para enviar");

      // Should encourage review, not editing
      expect(config.tooltip.toLowerCase()).toContain("revisa");
    });
  });

  describe("Semantic Clarity (Don't Make Me Think)", () => {
    it("draft label should clearly indicate pending state", () => {
      const config = STATUS_CONFIG.draft;
      // "Pendiente" clearly means "waiting for action", not "in progress"
      expect(config.label).toBe("Pendiente");
    });

    it("sent label should clearly indicate completed action", () => {
      const config = STATUS_CONFIG.sent;
      // "Enviada" clearly means "sent", past tense
      expect(config.label).toBe("Enviada");
    });

    it("canceled label should clearly indicate negative state", () => {
      const config = STATUS_CONFIG.canceled;
      // "Cancelada" clearly means "canceled", past tense
      expect(config.label).toBe("Cancelada");
    });

    it("icons should match semantic meaning", () => {
      expect(STATUS_CONFIG.draft.iconName).toBe("file-text"); // Document (not pencil)
      expect(STATUS_CONFIG.sent.iconName).toBe("send"); // Send arrow
      expect(STATUS_CONFIG.canceled.iconName).toBe("x-circle"); // X mark
    });
  });
});
