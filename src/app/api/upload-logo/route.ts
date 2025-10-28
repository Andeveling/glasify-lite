import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';
import { FileUploadService } from '@/server/services/file-upload.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload-logo
 * Upload tenant logo (admin only)
 *
 * US-009: Configurar datos de branding del tenant
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      logger.warn('Intento de upload de logo sin permiso admin', {
        role: session.user.role,
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    // Upload and optimize logo
    const tenantId = '1'; // Singleton tenant
    const logoUrl = await FileUploadService.uploadLogo(file, tenantId);

    logger.info('Logo subido exitosamente', {
      fileSize: file.size,
      fileType: file.type,
      logoUrl,
      tenantId,
      userId: session.user.id,
    });

    return NextResponse.json({ logoUrl });
  } catch (error) {
    logger.error('Error al subir logo', { error });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
      },
      { status: 500 }
    );
  }
}
