/**
 * Quote Excel Workbook Generator
 *
 * Creates professional Excel workbooks for quotes with 2 sheets:
 * 1. Summary - Quote overview with totals
 * 2. Items - Detailed item breakdown with formulas
 */

import ExcelJS from 'exceljs';
import type { QuoteExcelData } from '@/types/export.types';
import {
  excelAlignments,
  excelBorders,
  excelColumnWidths,
  excelFills,
  excelFonts,
  excelNumberFormats,
  excelRowHeights,
} from './excel-styles';
import {
  formatDateForExcel,
  getCellReference,
  getItemSubtotalFormula,
  getSubtotalFormula,
  sanitizeExcelText,
} from './excel-utils';

/**
 * Create complete Excel workbook for quote
 */
export async function createQuoteExcelWorkbook(data: QuoteExcelData): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = data.company.name;
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  // Create worksheets
  createSummarySheet(workbook, data);
  createItemsSheet(workbook, data);

  return workbook;
}

/**
 * Create Summary Sheet
 */
function createSummarySheet(workbook: ExcelJS.Workbook, data: QuoteExcelData) {
  const sheet = workbook.addWorksheet('Resumen', {
    properties: {
      defaultRowHeight: excelRowHeights.default,
    },
    views: [{ showGridLines: false }],
  });

  // Set column widths
  sheet.columns = [{ width: excelColumnWidths.summaryLabel }, { width: excelColumnWidths.summaryValue }];

  let currentRow = 1;

  // Header Section
  const headerRow = sheet.getRow(currentRow);
  headerRow.height = excelRowHeights.header;
  headerRow.getCell(1).value = data.company.name;
  headerRow.getCell(1).font = { ...excelFonts.header, size: 16 };
  headerRow.getCell(1).fill = excelFills.header;
  headerRow.getCell(1).alignment = excelAlignments.left;
  sheet.mergeCells(currentRow, 1, currentRow, 2);
  currentRow += 2;

  // Quote Information
  const quoteInfoRow = sheet.getRow(currentRow);
  quoteInfoRow.height = excelRowHeights.sectionTitle;
  quoteInfoRow.getCell(1).value = 'Información de Cotización';
  quoteInfoRow.getCell(1).font = excelFonts.sectionTitle;
  quoteInfoRow.getCell(1).fill = excelFills.sectionTitle;
  sheet.mergeCells(currentRow, 1, currentRow, 2);
  currentRow++;

  // Quote details
  const quoteDetails = [
    ['Cotización #:', data.quote.id.slice(0, 8)],
    ['Proyecto:', sanitizeExcelText(data.quote.projectName)],
    ['Estado:', data.quote.status === 'draft' ? 'Borrador' : data.quote.status],
    ['Fecha de creación:', formatDateForExcel(data.quote.createdAt)],
    ['Válida hasta:', formatDateForExcel(data.quote.validUntil)],
    ['Total de ítems:', data.quote.itemCount],
  ];

  for (const [label, value] of quoteDetails) {
    const row = sheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = excelFonts.bold;
    row.getCell(2).value = value;
    row.getCell(2).font = excelFonts.body;

    if (value instanceof Date) {
      row.getCell(2).numFmt = excelNumberFormats.dateLong;
    }

    currentRow++;
  }

  currentRow++;

  // Customer Information
  const customerInfoRow = sheet.getRow(currentRow);
  customerInfoRow.height = excelRowHeights.sectionTitle;
  customerInfoRow.getCell(1).value = 'Información del Cliente';
  customerInfoRow.getCell(1).font = excelFonts.sectionTitle;
  customerInfoRow.getCell(1).fill = excelFills.sectionTitle;
  sheet.mergeCells(currentRow, 1, currentRow, 2);
  currentRow++;

  // Customer details
  const customerDetails = [
    ['Nombre:', sanitizeExcelText(data.customer.name)],
    ['Email:', data.customer.email || '-'],
    ['Teléfono:', data.customer.phone || '-'],
  ];

  for (const [label, value] of customerDetails) {
    const row = sheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = excelFonts.bold;
    row.getCell(2).value = value;
    row.getCell(2).font = excelFonts.body;
    currentRow++;
  }

  currentRow++;

  // Totals Section
  const totalsRow = sheet.getRow(currentRow);
  totalsRow.height = excelRowHeights.sectionTitle;
  totalsRow.getCell(1).value = 'Resumen de Costos';
  totalsRow.getCell(1).font = excelFonts.sectionTitle;
  totalsRow.getCell(1).fill = excelFills.sectionTitle;
  sheet.mergeCells(currentRow, 1, currentRow, 2);
  currentRow++;

  // Subtotal
  const subtotalRow = sheet.getRow(currentRow);
  subtotalRow.getCell(1).value = 'Subtotal:';
  subtotalRow.getCell(1).font = excelFonts.body;
  subtotalRow.getCell(2).value = data.totals.subtotal;
  subtotalRow.getCell(2).font = excelFonts.body;
  subtotalRow.getCell(2).numFmt = excelNumberFormats.currency;
  currentRow++;

  // Tax (if applicable)
  if (data.totals.tax !== undefined && data.totals.tax > 0) {
    const taxRow = sheet.getRow(currentRow);
    taxRow.getCell(1).value = 'IVA (19%):';
    taxRow.getCell(1).font = excelFonts.body;
    taxRow.getCell(2).value = data.totals.tax;
    taxRow.getCell(2).font = excelFonts.body;
    taxRow.getCell(2).numFmt = excelNumberFormats.currency;
    currentRow++;
  }

  // Discount (if applicable)
  if (data.totals.discount !== undefined && data.totals.discount > 0) {
    const discountRow = sheet.getRow(currentRow);
    discountRow.getCell(1).value = 'Descuento:';
    discountRow.getCell(1).font = excelFonts.body;
    discountRow.getCell(2).value = -data.totals.discount;
    discountRow.getCell(2).font = excelFonts.body;
    discountRow.getCell(2).numFmt = excelNumberFormats.currency;
    currentRow++;
  }

  // Total
  const totalRow = sheet.getRow(currentRow);
  totalRow.height = excelRowHeights.tableHeader;
  totalRow.getCell(1).value = 'TOTAL:';
  totalRow.getCell(1).font = excelFonts.totalLabel;
  totalRow.getCell(1).fill = excelFills.totalRow;
  totalRow.getCell(2).value = data.totals.total;
  totalRow.getCell(2).font = excelFonts.totalValue;
  totalRow.getCell(2).fill = excelFills.totalRow;
  totalRow.getCell(2).numFmt = excelNumberFormats.currency;
  totalRow.getCell(1).border = excelBorders.thick;
  totalRow.getCell(2).border = excelBorders.thick;

  // Apply borders to summary sections
  applyBordersToRange(sheet, 4, 1, currentRow - 1, 2);
}

/**
 * Create Items Sheet with detailed breakdown
 */
function createItemsSheet(workbook: ExcelJS.Workbook, data: QuoteExcelData) {
  const sheet = workbook.addWorksheet('Ítems Detallados', {
    properties: {
      defaultRowHeight: excelRowHeights.default,
    },
  });

  // Set column widths
  sheet.columns = [
    { width: excelColumnWidths.itemNumber }, // #
    { width: excelColumnWidths.itemName }, // Producto
    { width: excelColumnWidths.itemDescription }, // Descripción
    { width: excelColumnWidths.dimensions }, // Dimensiones
    { width: excelColumnWidths.quantity }, // Cantidad
    { width: excelColumnWidths.unitPrice }, // Precio Unit.
    { width: excelColumnWidths.subtotal }, // Subtotal
  ];

  // Header Row
  const headerRow = sheet.getRow(1);
  headerRow.height = excelRowHeights.tableHeader;
  headerRow.values = ['#', 'Producto', 'Descripción', 'Dimensiones', 'Cantidad', 'Precio Unitario', 'Subtotal'];

  // Apply header styles
  for (let col = 1; col <= 7; col++) {
    const cell = headerRow.getCell(col);
    cell.font = excelFonts.tableHeader;
    cell.fill = excelFills.tableHeader;
    cell.alignment = excelAlignments.center;
    cell.border = excelBorders.thin;
  }

  // Data Rows
  data.items.forEach((item, index) => {
    const rowNumber = index + 2; // Start at row 2 (row 1 is header)
    const row = sheet.getRow(rowNumber);
    row.height = excelRowHeights.tableRow;

    // Column values
    row.getCell(1).value = item.itemNumber;
    row.getCell(2).value = sanitizeExcelText(item.name);
    row.getCell(3).value = item.productName ? sanitizeExcelText(item.productName) : '-';
    row.getCell(4).value = item.width && item.height ? `${item.width}x${item.height}m` : '-';
    row.getCell(5).value = item.quantity;
    row.getCell(6).value = item.unitPrice;

    // Subtotal formula: quantity * unitPrice
    const quantityCell = getCellReference(rowNumber - 1, 4);
    const priceCell = getCellReference(rowNumber - 1, 5);
    row.getCell(7).value = {
      formula: getItemSubtotalFormula(quantityCell, priceCell),
      result: item.subtotal,
    };

    // Apply styles
    row.getCell(1).alignment = excelAlignments.center;
    row.getCell(2).alignment = excelAlignments.left;
    row.getCell(3).alignment = excelAlignments.left;
    row.getCell(4).alignment = excelAlignments.center;
    row.getCell(5).alignment = excelAlignments.center;
    row.getCell(6).alignment = excelAlignments.right;
    row.getCell(7).alignment = excelAlignments.right;

    // Number formatting
    row.getCell(6).numFmt = excelNumberFormats.currency;
    row.getCell(7).numFmt = excelNumberFormats.currency;

    // Alternating row colors
    const fill = index % 2 === 0 ? excelFills.tableRowOdd : excelFills.tableRowEven;
    for (let col = 1; col <= 7; col++) {
      row.getCell(col).fill = fill;
      row.getCell(col).border = excelBorders.thin;
    }
  });

  // Totals Row
  const totalsRowNumber = data.items.length + 2;
  const totalsRow = sheet.getRow(totalsRowNumber);
  totalsRow.height = excelRowHeights.tableHeader;

  sheet.mergeCells(totalsRowNumber, 1, totalsRowNumber, 6);
  totalsRow.getCell(1).value = 'SUBTOTAL:';
  totalsRow.getCell(1).font = excelFonts.totalLabel;
  totalsRow.getCell(1).alignment = excelAlignments.right;
  totalsRow.getCell(1).fill = excelFills.totalsSection;

  // Subtotal formula: SUM of all subtotals
  const firstItemRow = getCellReference(1, 6); // G2
  const lastItemRow = getCellReference(data.items.length, 6); // G[last]
  totalsRow.getCell(7).value = {
    formula: getSubtotalFormula(firstItemRow, lastItemRow),
    result: data.totals.subtotal,
  };
  totalsRow.getCell(7).font = excelFonts.totalValue;
  totalsRow.getCell(7).numFmt = excelNumberFormats.currency;
  totalsRow.getCell(7).fill = excelFills.totalsSection;
  totalsRow.getCell(7).border = excelBorders.thick;

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Auto-filter
  sheet.autoFilter = {
    from: { column: 1, row: 1 },
    to: { column: 7, row: 1 },
  };
}

/**
 * Apply borders to a range of cells
 */
function applyBordersToRange(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cell = sheet.getRow(row).getCell(col);
      cell.border = excelBorders.thin;
    }
  }
}

/**
 * Write workbook to buffer for Server Action
 */
export async function writeQuoteExcel(data: QuoteExcelData): Promise<Buffer> {
  const workbook = await createQuoteExcelWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
