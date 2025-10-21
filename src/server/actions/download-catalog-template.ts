'use server';

import ExcelJS from 'exceljs';

const HEADER_FONT_SIZE = 12;
const TITLE_ROW = 3;
const MODELS_SECTION_ROW = 5;
const GLASS_TYPES_SECTION_ROW = 14;
const SERVICES_SECTION_ROW = 22;
const IMPORTANT_NOTES_ROW = 31;

/**
 * Server Action: Generate Excel template for catalog migration
 *
 * Creates a workbook with 3 sheets: Models, GlassTypes, Services
 * Each sheet contains column headers matching the Prisma schema
 */
export async function downloadCatalogTemplate() {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Modelos
  const modelsSheet = workbook.addWorksheet('Modelos');
  modelsSheet.columns = [
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'Proveedor de Perfiles', key: 'profileSupplier', width: 25 },
    { header: 'Ancho Mínimo (mm)', key: 'minWidthMm', width: 18 },
    { header: 'Ancho Máximo (mm)', key: 'maxWidthMm', width: 18 },
    { header: 'Alto Mínimo (mm)', key: 'minHeightMm', width: 18 },
    { header: 'Alto Máximo (mm)', key: 'maxHeightMm', width: 18 },
    { header: 'Precio Base', key: 'basePrice', width: 15 },
    { header: 'Costo por mm Ancho', key: 'costPerMmWidth', width: 20 },
    { header: 'Costo por mm Alto', key: 'costPerMmHeight', width: 20 },
    { header: 'Precio Accesorios', key: 'accessoryPrice', width: 18 },
    { header: 'Descuento Vidrio Ancho (mm)', key: 'glassDiscountWidthMm', width: 28 },
    { header: 'Descuento Vidrio Alto (mm)', key: 'glassDiscountHeightMm', width: 28 },
    { header: 'Margen Ganancia (%)', key: 'profitMarginPercentage', width: 20 },
    { header: 'Notas de Costos', key: 'costNotes', width: 40 },
  ];

  // Header styling
  modelsSheet.getRow(1).font = { bold: true };
  modelsSheet.getRow(1).fill = {
    fgColor: { argb: 'FF4F46E5' },
    pattern: 'solid',
    type: 'pattern',
  };
  modelsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Example row
  modelsSheet.addRow({
    accessoryPrice: 15_000,
    basePrice: 80_000,
    costNotes: 'Precio referencial para ventana estándar',
    costPerMmHeight: 0.05,
    costPerMmWidth: 0.05,
    glassDiscountHeightMm: -66,
    glassDiscountWidthMm: -7,
    maxHeightMm: 2400,
    maxWidthMm: 2200,
    minHeightMm: 600,
    minWidthMm: 600,
    name: 'Ventana Corredera 2 Paños',
    profileSupplier: 'Vitro Rojas S.A.',
    profitMarginPercentage: 30,
  });

  // Sheet 2: Tipos de Vidrio
  const glassTypesSheet = workbook.addWorksheet('Tipos de Vidrio');
  glassTypesSheet.columns = [
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'Proveedor de Vidrio', key: 'glassSupplier', width: 25 },
    { header: 'SKU', key: 'sku', width: 20 },
    { header: 'Grosor (mm)', key: 'thicknessMm', width: 15 },
    { header: 'Precio por m²', key: 'pricePerSqm', width: 18 },
    { header: 'Valor U (W/m²·K)', key: 'uValue', width: 18 },
    { header: 'Factor Solar (0-1)', key: 'solarFactor', width: 20 },
    { header: 'Transmisión Luz (0-1)', key: 'lightTransmission', width: 22 },
    { header: 'Descripción', key: 'description', width: 40 },
  ];

  glassTypesSheet.getRow(1).font = { bold: true };
  glassTypesSheet.getRow(1).fill = {
    fgColor: { argb: 'FF0EA5E9' },
    pattern: 'solid',
    type: 'pattern',
  };
  glassTypesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Example rows
  glassTypesSheet.addRow({
    description: 'Vidrio transparente estándar 6mm',
    glassSupplier: 'Guardian',
    lightTransmission: 0.88,
    name: 'Vidrio Claro 6mm',
    pricePerSqm: 45_000,
    sku: 'VCL-6',
    solarFactor: 0.82,
    thicknessMm: 6,
    uValue: 5.8,
  });

  glassTypesSheet.addRow({
    description: 'Vidrio laminado 6mm con capa PVB',
    glassSupplier: 'Guardian',
    lightTransmission: 0.85,
    name: 'Vidrio Laminado 6mm',
    pricePerSqm: 60_000,
    sku: 'VLA-6',
    solarFactor: 0.78,
    thicknessMm: 6,
    uValue: 5.6,
  });

  // Sheet 3: Servicios
  const servicesSheet = workbook.addWorksheet('Servicios');
  servicesSheet.columns = [
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'Tipo', key: 'type', width: 15 },
    { header: 'Unidad', key: 'unit', width: 15 },
    { header: 'Tarifa', key: 'rate', width: 15 },
    { header: 'Notas', key: 'notes', width: 40 },
  ];

  servicesSheet.getRow(1).font = { bold: true };
  servicesSheet.getRow(1).fill = {
    fgColor: { argb: 'FF10B981' },
    pattern: 'solid',
    type: 'pattern',
  };
  servicesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Example rows
  servicesSheet.addRow({
    name: 'Instalación',
    notes: 'Instalación profesional incluye mano de obra y herramientas',
    rate: 25_000,
    type: 'area',
    unit: 'sqm',
  });

  servicesSheet.addRow({
    name: 'Templado',
    notes: 'Proceso de templado de vidrio para mayor seguridad',
    rate: 35_000,
    type: 'area',
    unit: 'sqm',
  });

  servicesSheet.addRow({
    name: 'Transporte',
    notes: 'Transporte a obra dentro del área metropolitana',
    rate: 50_000,
    type: 'fixed',
    unit: 'unit',
  });

  // Sheet 4: Instrucciones
  const instructionsSheet = workbook.addWorksheet('Instrucciones');
  instructionsSheet.columns = [{ header: 'Guía de Llenado', key: 'content', width: 100 }];

  instructionsSheet.getRow(1).font = { bold: true, size: 14 };
  instructionsSheet.getRow(1).fill = {
    fgColor: { argb: 'FFF59E0B' },
    pattern: 'solid',
    type: 'pattern',
  };
  instructionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  instructionsSheet.addRow({
    content: '',
  });
  instructionsSheet.addRow({
    content: '📋 INSTRUCCIONES DE LLENADO - PLANTILLA GLASIFY',
  });
  instructionsSheet.getRow(TITLE_ROW).font = { bold: true, size: HEADER_FONT_SIZE };
  instructionsSheet.addRow({ content: '' });

  instructionsSheet.addRow({
    content: '🔹 HOJA: MODELOS',
  });
  instructionsSheet.getRow(MODELS_SECTION_ROW).font = { bold: true };
  instructionsSheet.addRow({
    content: '- Nombre: Nombre descriptivo del modelo (ej: "Ventana Corredera 2 Paños", "Puerta Abatible")',
  });
  instructionsSheet.addRow({
    content: '- Proveedor de Perfiles: Nombre del fabricante de perfiles (ej: "Rehau", "Vitro Rojas S.A.")',
  });
  instructionsSheet.addRow({
    content: '- Dimensiones: Mínimo y máximo permitido en milímetros',
  });
  instructionsSheet.addRow({
    content: '- Precio Base: Costo del kit completo de perfiles (en la moneda local)',
  });
  instructionsSheet.addRow({
    content: '- Costo por mm: Precio adicional por cada milímetro de ancho/alto (puede ser 0)',
  });
  instructionsSheet.addRow({
    content: '- Descuento Vidrio: Milímetros a descontar del tamaño total para calcular área de vidrio',
  });
  instructionsSheet.addRow({
    content: '  Ejemplo: Si ventana es 1000mm y descuento es -7mm, el vidrio será 993mm',
  });
  instructionsSheet.addRow({ content: '' });

  instructionsSheet.addRow({
    content: '🔹 HOJA: TIPOS DE VIDRIO',
  });
  instructionsSheet.getRow(GLASS_TYPES_SECTION_ROW).font = { bold: true };
  instructionsSheet.addRow({
    content: '- Nombre: Tipo y grosor del vidrio (ej: "Vidrio Claro 6mm", "Laminado 8mm", "Reflectivo Bronce 6mm")',
  });
  instructionsSheet.addRow({
    content: '- Proveedor: Fabricante del vidrio (ej: "Guardian", "Saint-Gobain", "Vitro")',
  });
  instructionsSheet.addRow({
    content: '- SKU: Código de producto del proveedor (opcional)',
  });
  instructionsSheet.addRow({
    content: '- Grosor: En milímetros (6, 8, 10, etc.)',
  });
  instructionsSheet.addRow({
    content: '- Precio por m²: Costo del vidrio por metro cuadrado',
  });
  instructionsSheet.addRow({
    content: '- Valor U: Transmitancia térmica (opcional, para vidrios con aislamiento)',
  });
  instructionsSheet.addRow({ content: '' });

  instructionsSheet.addRow({
    content: '🔹 HOJA: SERVICIOS',
  });
  instructionsSheet.getRow(SERVICES_SECTION_ROW).font = { bold: true };
  instructionsSheet.addRow({
    content: '- Nombre: Nombre del servicio (ej: "Instalación", "Templado", "Transporte")',
  });
  instructionsSheet.addRow({
    content: '- Tipo: Cómo se cobra el servicio',
  });
  instructionsSheet.addRow({
    content: '  • area: Por área (m²) - Ejemplo: Instalación',
  });
  instructionsSheet.addRow({
    content: '  • perimeter: Por perímetro (ml) - Ejemplo: Sellado',
  });
  instructionsSheet.addRow({
    content: '  • fixed: Precio fijo - Ejemplo: Transporte',
  });
  instructionsSheet.addRow({
    content: '- Unidad: sqm (m²), ml (metros lineales), unit (unidad)',
  });
  instructionsSheet.addRow({
    content: '- Tarifa: Precio por unidad o precio fijo',
  });
  instructionsSheet.addRow({ content: '' });

  instructionsSheet.addRow({
    content: '⚠️ NOTAS IMPORTANTES:',
  });
  instructionsSheet.getRow(IMPORTANT_NOTES_ROW).font = { bold: true, color: { argb: 'FFDC2626' } };
  instructionsSheet.addRow({
    content: '1. Las filas con ejemplos son SOLO de referencia. Reemplázalas con tus datos reales.',
  });
  instructionsSheet.addRow({
    content: '2. NO borres los encabezados (primera fila de cada hoja).',
  });
  instructionsSheet.addRow({
    content: '3. Los precios deben estar en tu moneda local (sin símbolos, solo números).',
  });
  instructionsSheet.addRow({
    content: '4. Para descuentos de vidrio, usa números negativos (ej: -7, -66).',
  });
  instructionsSheet.addRow({
    content: '5. Una vez completado, envía este archivo de vuelta a tu contacto de Glasify.',
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer).toString('base64'),
    filename: `glasify-plantilla-catalogo-${new Date().toISOString().split('T')[0]}.xlsx`,
  };
}
