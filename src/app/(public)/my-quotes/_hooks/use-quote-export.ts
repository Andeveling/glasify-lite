/**
 * useQuoteExport Hook
 *
 * Custom hook for exporting quotes to PDF or Excel formats.
 * Handles loading states, error handling, and file downloads.
 */

'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { exportQuoteExcel, exportQuotePDF } from '@/app/_actions/quote-export.actions';
import type { ExportFormat } from '@/types/export.types';

interface UseQuoteExportOptions {
  /** Callback invoked after successful export */
  onSuccess?: (format: ExportFormat) => void;

  /** Callback invoked when export fails */
  onError?: (error: string, format: ExportFormat) => void;
}

interface UseQuoteExportReturn {
  /** Export quote to PDF format */
  exportPDF: (quoteId: string) => Promise<void>;

  /** Export quote to Excel format */
  exportExcel: (quoteId: string) => Promise<void>;

  /** Whether PDF export is in progress */
  isExportingPDF: boolean;

  /** Whether Excel export is in progress */
  isExportingExcel: boolean;

  /** Whether any export is in progress */
  isExporting: boolean;
}

/**
 * Hook for quote export functionality
 */
export function useQuoteExport(options: UseQuoteExportOptions = {}): UseQuoteExportReturn {
  const { onSuccess, onError } = options;

  const [isPendingPDF, startPDFTransition] = useTransition();
  const [isPendingExcel, startExcelTransition] = useTransition();
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  /**
   * Download file from base64 data
   */
  const downloadFile = (data: string, filename: string, mimeType: string) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (_error) {
      throw new Error('Error al descargar el archivo');
    }
  };

  /**
   * Export quote to PDF
   */
  const exportPDF = async (quoteId: string): Promise<void> => {
    setIsDownloadingPDF(true);

    return new Promise((resolve) => {
      startPDFTransition(async () => {
        try {
          const result = await exportQuotePDF({
            format: 'pdf',
            quoteId,
          });

          if (!result.success) {
            const errorMessage = result.error || 'Error al exportar a PDF';
            toast.error(errorMessage);
            onError?.(errorMessage, 'pdf');
            resolve();
            return;
          }

          // Download file
          if (result.data && result.filename && result.mimeType) {
            downloadFile(result.data, result.filename, result.mimeType);
            toast.success(`${result.filename} descargado exitosamente`);
            onSuccess?.('pdf');
          }
          resolve();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          toast.error('Error al exportar la cotización a PDF');
          onError?.(errorMessage, 'pdf');
          resolve();
        } finally {
          setIsDownloadingPDF(false);
        }
      });
    });
  };

  /**
   * Export quote to Excel
   */
  const exportExcel = async (quoteId: string): Promise<void> => {
    setIsDownloadingExcel(true);

    return new Promise((resolve) => {
      startExcelTransition(async () => {
        try {
          const result = await exportQuoteExcel({
            format: 'excel',
            quoteId,
          });

          if (!result.success) {
            const errorMessage = result.error || 'Error al exportar a Excel';
            toast.error(errorMessage);
            onError?.(errorMessage, 'excel');
            resolve();
            return;
          }

          // Download file
          if (result.data && result.filename && result.mimeType) {
            downloadFile(result.data, result.filename, result.mimeType);
            toast.success(`${result.filename} descargado exitosamente`);
            onSuccess?.('excel');
          }
          resolve();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          toast.error('Error al exportar la cotización a Excel');
          onError?.(errorMessage, 'excel');
          resolve();
        } finally {
          setIsDownloadingExcel(false);
        }
      });
    });
  };

  return {
    exportExcel,
    exportPDF,
    isExporting: isPendingPDF || isPendingExcel || isDownloadingPDF || isDownloadingExcel,
    isExportingExcel: isPendingExcel || isDownloadingExcel,
    isExportingPDF: isPendingPDF || isDownloadingPDF,
  };
}
