/**
 * Unit Test: Export Filename Generation
 *
 * Tests the generateExportFilename utility function that produces
 * filenames in the format: "Cotizacion_ProjectName_YYYY-MM-DD.ext"
 *
 * Test-First: These tests should FAIL until T039 is implemented
 */

import { describe, expect, it } from "vitest";
import { generateExportFilename } from "../../../src/app/(public)/my-quotes/_utils/export-filename";

describe("generateExportFilename", () => {
  it("should generate PDF filename with correct format", () => {
    const projectName = "Casa Rodriguez";
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    expect(filename).toBe("Cotizacion_Casa_Rodriguez_2025-10-12.pdf");
  });

  it("should generate Excel filename with correct format", () => {
    const projectName = "Edificio Central";
    const date = new Date("2025-10-12");
    const format = "excel";

    const filename = generateExportFilename(projectName, date, format);

    expect(filename).toBe("Cotizacion_Edificio_Central_2025-10-12.xlsx");
  });

  it("should sanitize project name with special characters", () => {
    const projectName = 'Casa "El Roble" & Cia.';
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    // Should remove quotes, ampersands, dots
    expect(filename).toBe("Cotizacion_Casa_El_Roble_Cia_2025-10-12.pdf");
  });

  it("should handle empty project name", () => {
    const projectName = "";
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    expect(filename).toBe("Cotizacion_Sin_Nombre_2025-10-12.pdf");
  });

  it("should replace spaces with underscores", () => {
    const projectName = "Proyecto Casa Nueva";
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    expect(filename).toBe("Cotizacion_Proyecto_Casa_Nueva_2025-10-12.pdf");
  });

  it("should truncate long project names", () => {
    const projectName =
      "Este es un nombre de proyecto extremadamente largo que debería ser truncado";
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    // Should truncate to max 50 chars
    expect(filename.length).toBeLessThanOrEqual(75); // "Cotizacion_" + 50 + "_2025-10-12.pdf"
  });

  it("should format date consistently", () => {
    const projectName = "Test";
    const date = new Date("2025-01-05"); // Single digit month/day
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    expect(filename).toBe("Cotizacion_Test_2025-01-05.pdf");
  });

  it("should handle different export formats", () => {
    const projectName = "Casa";
    const date = new Date("2025-10-12");

    const pdfFilename = generateExportFilename(projectName, date, "pdf");
    const excelFilename = generateExportFilename(projectName, date, "excel");

    expect(pdfFilename).toContain(".pdf");
    expect(excelFilename).toContain(".xlsx");
  });

  it("should handle accented characters", () => {
    const projectName = "Residencial José María";
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename = generateExportFilename(projectName, date, format);

    // Should preserve accented characters or transliterate safely
    expect(filename).toMatch(
      /Cotizacion_Residencial_Jos[eé]_Mar[ií]a_2025-10-12\.pdf/
    );
  });

  it("should be deterministic for same inputs", () => {
    const projectName = "Test Project";
    const date = new Date("2025-10-12");
    const format = "pdf";

    const filename1 = generateExportFilename(projectName, date, format);
    const filename2 = generateExportFilename(projectName, date, format);

    expect(filename1).toBe(filename2);
  });
});
