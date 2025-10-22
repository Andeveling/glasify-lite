'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadCatalogTemplate } from '@/server/actions/download-catalog-template';

export function DownloadCatalogTemplateButton() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      toast.loading('Generando plantilla...', { id: 'download-template' });

      const { buffer, filename } = await downloadCatalogTemplate();

      // Convert base64 to blob
      const byteCharacters = atob(buffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Plantilla descargada correctamente', { id: 'download-template' });
    } catch (error) {
      toast.error('Error al descargar la plantilla', {
        description: error instanceof Error ? error.message : 'Error desconocido',
        id: 'download-template',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button disabled={isDownloading} onClick={handleDownload} size="lg" variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {isDownloading ? 'Generando...' : 'Descargar Plantilla Excel'}
    </Button>
  );
}
