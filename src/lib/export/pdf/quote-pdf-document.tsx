/**
 * Quote PDF Document Component
 *
 * React-PDF template for generating professional quote PDFs.
 * Includes header, project info, items table, totals, and footer.
 *
 * @see https://react-pdf.org/components
 */

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { formatCurrency, formatDateFull } from "@/lib/format";
import type { QuotePDFData } from "@/types/export.types";
import { pdfColors, pdfStyles } from "./pdf-styles";

type QuotePDFDocumentProps = {
  data: QuotePDFData;
};

/**
 * Main PDF Document Component
 */
export function QuotePDFDocument({ data }: QuotePDFDocumentProps) {
  return (
    <Document
      author={data.company.name}
      creator={data.company.name}
      subject={`Cotización #${data.quote.id}`}
      title={`Cotización - ${data.quote.projectName}`}
    >
      <Page size="A4" style={pdfStyles.page}>
        {/* Header with company branding */}
        <PDFHeader data={data} />

        {/* Project Information Section */}
        <PDFProjectInfo data={data} />

        {/* Quote Items Table */}
        <PDFItemsTable data={data} />

        {/* Totals Section */}
        <PDFTotals data={data} />

        {/* Footer with terms and page numbers */}
        <PDFFooter data={data} />
      </Page>
    </Document>
  );
}

/**
 * PDF Header Component
 */
function PDFHeader({ data }: QuotePDFDocumentProps) {
  return (
    <View style={pdfStyles.header}>
      <View style={pdfStyles.headerLeft}>
        {data.company.logoUrl && (
          <Image src={data.company.logoUrl} style={pdfStyles.companyLogo} />
        )}
        <Text style={pdfStyles.companyName}>{data.company.name}</Text>
        {data.company.email && (
          <Text style={pdfStyles.quoteDate}>{data.company.email}</Text>
        )}
        {data.company.phone && (
          <Text style={pdfStyles.quoteDate}>{data.company.phone}</Text>
        )}
      </View>

      <View style={pdfStyles.headerRight}>
        <Text style={pdfStyles.quoteNumber}>Cotización</Text>
        <Text style={pdfStyles.quoteNumber}>Código: {data.quote.id}</Text>
        <Text style={pdfStyles.quoteDate}>
          Fecha: {formatDateFull(data.quote.createdAt, data.formatting)}
        </Text>
        <Text style={pdfStyles.quoteDate}>
          Válida hasta: {formatDateFull(data.quote.validUntil, data.formatting)}
        </Text>
      </View>
    </View>
  );
}

/**
 * PDF Project Information Section
 */
function PDFProjectInfo({ data }: QuotePDFDocumentProps) {
  return (
    <View style={pdfStyles.projectSection}>
      <Text style={pdfStyles.sectionTitle}>Información del Proyecto</Text>

      <View style={pdfStyles.projectInfo}>
        <View style={pdfStyles.projectRow}>
          <Text style={pdfStyles.projectLabel}>Proyecto:</Text>
          <Text style={pdfStyles.projectValue}>{data.quote.projectName}</Text>
        </View>

        <View style={pdfStyles.projectRow}>
          <Text style={pdfStyles.projectLabel}>Cliente:</Text>
          <Text style={pdfStyles.projectValue}>{data.customer.name}</Text>
        </View>

        {data.customer.email && (
          <View style={pdfStyles.projectRow}>
            <Text style={pdfStyles.projectLabel}>Email:</Text>
            <Text style={pdfStyles.projectValue}>{data.customer.email}</Text>
          </View>
        )}

        {data.customer.phone && (
          <View style={pdfStyles.projectRow}>
            <Text style={pdfStyles.projectLabel}>Teléfono:</Text>
            <Text style={pdfStyles.projectValue}>{data.customer.phone}</Text>
          </View>
        )}

        {data.quote.notes && (
          <View style={pdfStyles.projectRow}>
            <Text style={pdfStyles.projectLabel}>Notas:</Text>
            <Text style={pdfStyles.projectValue}>{data.quote.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * PDF Items Table Component
 */
function PDFItemsTable({ data }: QuotePDFDocumentProps) {
  return (
    <View style={pdfStyles.tableSection}>
      <Text style={pdfStyles.sectionTitle}>Detalle de Productos</Text>

      <View style={pdfStyles.table}>
        {/* Table Header */}
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colItem]}>
            Producto
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colDescription]}>
            Descripción
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colDimensions]}>
            Dimensiones
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colQuantity]}>
            Cant.
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colUnitPrice]}>
            Precio Unit.
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colSubtotal]}>
            Subtotal
          </Text>
        </View>

        {/* Table Rows */}
        {data.items.map((item, index) => (
          <View
            key={item.id}
            style={[
              pdfStyles.tableRow,
              ...(index % 2 === 1 ? [pdfStyles.tableRowEven] : []),
            ]}
            wrap={false}
          >
            {/* Producto */}
            <View style={[pdfStyles.tableCell, pdfStyles.colItem]}>
              <Text style={pdfStyles.tableCellLeft}>{item.name}</Text>
              {item.product?.manufacturer && (
                <Text
                  style={[
                    pdfStyles.tableCellLeft,
                    { color: pdfColors.gray600, fontSize: 8 },
                  ]}
                >
                  {item.product.manufacturer}
                </Text>
              )}
            </View>

            {/* Descripción */}
            <View style={[pdfStyles.tableCell, pdfStyles.colDescription]}>
              {item.product?.name && (
                <Text style={pdfStyles.tableCellLeft}>{item.product.name}</Text>
              )}
              {item.glass?.type && (
                <Text style={[pdfStyles.tableCellLeft, { fontSize: 8 }]}>
                  {item.glass.type}
                  {item.glass.thickness && ` ${item.glass.thickness}mm`}
                </Text>
              )}
              {item.glass?.color && (
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    marginTop: 2,
                  }}
                >
                  {item.glass.colorHexCode && (
                    <View
                      style={{
                        backgroundColor: item.glass.colorHexCode,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        height: 10,
                        marginRight: 4,
                        width: 10,
                      }}
                    />
                  )}
                  <Text style={[pdfStyles.tableCellLeft, { fontSize: 8 }]}>
                    Color: {item.glass.color}
                    {item.glass.colorSurchargePercentage &&
                    item.glass.colorSurchargePercentage > 0
                      ? ` (+${item.glass.colorSurchargePercentage}%)`
                      : ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Dimensiones */}
            <Text
              style={[
                pdfStyles.tableCell,
                pdfStyles.colDimensions,
                pdfStyles.tableCellCenter,
              ]}
            >
              {item.dimensions
                ? `${item.dimensions.width}x${item.dimensions.height}`
                : "-"}
            </Text>

            {/* Cantidad */}
            <Text
              style={[
                pdfStyles.tableCell,
                pdfStyles.colQuantity,
                pdfStyles.tableCellCenter,
              ]}
            >
              {item.quantity}
            </Text>

            {/* Precio Unitario */}
            <Text
              style={[
                pdfStyles.tableCell,
                pdfStyles.colUnitPrice,
                pdfStyles.tableCellRight,
              ]}
            >
              {formatCurrency(item.unitPrice, { context: data.formatting })}
            </Text>

            {/* Subtotal */}
            <Text
              style={[
                pdfStyles.tableCell,
                pdfStyles.colSubtotal,
                pdfStyles.tableCellRight,
              ]}
            >
              {formatCurrency(item.subtotal, { context: data.formatting })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * PDF Totals Section Component
 */
function PDFTotals({ data }: QuotePDFDocumentProps) {
  return (
    <View style={pdfStyles.totalsSection}>
      {/* Subtotal */}
      <View style={pdfStyles.totalsRow}>
        <Text style={pdfStyles.totalsLabel}>Subtotal:</Text>
        <Text style={pdfStyles.totalsValue}>
          {formatCurrency(data.totals.subtotal, { context: data.formatting })}
        </Text>
      </View>

      {/* Tax */}
      {data.totals.tax !== undefined && data.totals.tax > 0 && (
        <View style={pdfStyles.totalsRow}>
          <Text style={pdfStyles.totalsLabel}>IVA (19%):</Text>
          <Text style={pdfStyles.totalsValue}>
            {formatCurrency(data.totals.tax, { context: data.formatting })}
          </Text>
        </View>
      )}

      {/* Discount */}
      {data.totals.discount !== undefined && data.totals.discount > 0 && (
        <View style={pdfStyles.totalsRow}>
          <Text style={pdfStyles.totalsLabel}>Descuento:</Text>
          <Text style={pdfStyles.totalsValue}>
            -
            {formatCurrency(data.totals.discount, { context: data.formatting })}
          </Text>
        </View>
      )}

      {/* Total */}
      <View style={[pdfStyles.totalsRow, pdfStyles.totalRow]}>
        <Text style={pdfStyles.totalLabel}>Total:</Text>
        <Text style={pdfStyles.totalValue}>
          {formatCurrency(data.totals.total, { context: data.formatting })}
        </Text>
      </View>
    </View>
  );
}

/**
 * PDF Footer Component
 */
function PDFFooter({ data }: QuotePDFDocumentProps) {
  return (
    <View fixed style={pdfStyles.footer}>
      {data.quote.notes && (
        <Text style={pdfStyles.footerText}>
          <Text style={pdfStyles.footerBold}>Nota: </Text>
          {data.quote.notes}
        </Text>
      )}

      <Text style={pdfStyles.footerText}>
        Cotización válida hasta{" "}
        {formatDateFull(data.quote.validUntil, data.formatting)}
      </Text>

      {data.company.address && (
        <Text style={pdfStyles.footerText}>{data.company.address}</Text>
      )}

      <Text
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
        style={pdfStyles.pageNumber}
      />
    </View>
  );
}

/**
 * Render PDF to buffer for Server Action
 */
export async function renderQuotePDF(data: QuotePDFData): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const pdf = <QuotePDFDocument data={data} />;
  return await renderToBuffer(pdf);
}
