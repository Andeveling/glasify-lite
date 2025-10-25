import logger from '@/lib/logger';
import { db } from '@/server/db';

/**
 * Referential Integrity Service
 *
 * Checks for dependencies before allowing entity deletion.
 * Prevents cascade delete issues and ensures data consistency.
 *
 * @server-side-only This service uses Winston logger (Node.js only)
 */

export interface DependencyCheck {
  entity: string;
  count: number;
  message: string;
}

export interface ReferentialIntegrityResult {
  canDelete: boolean;
  dependencies: DependencyCheck[];
  message: string;
}

/**
 * Check if a ProfileSupplier can be deleted
 * Dependency: Models
 */
export async function canDeleteProfileSupplier(supplierId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for ProfileSupplier', { supplierId });

  const modelCount = await db.model.count({
    where: { profileSupplierId: supplierId },
  });

  const dependencies: DependencyCheck[] = [];

  if (modelCount > 0) {
    dependencies.push({
      count: modelCount,
      entity: 'Model',
      message: `${modelCount} modelo(s) asociado(s)`,
    });
  }

  const canDelete = dependencies.length === 0;

  logger.info('ProfileSupplier referential integrity check complete', {
    canDelete,
    dependencyCount: dependencies.length,
    supplierId,
  });

  return {
    canDelete,
    dependencies,
    message: canDelete
      ? 'El proveedor puede ser eliminado'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  };
}

/**
 * Check if a GlassSupplier can be deleted
 * @deprecated - GlassSupplier.glassTypes relation removed in v2.0
 * GlassSuppliers are now independent entities (can always be deleted if no ProfileSupplier references)
 */
export function canDeleteGlassSupplier(supplierId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for GlassSupplier', { supplierId });

  // Note: glassTypes relation removed in v2.0 static glass taxonomy migration
  // GlassSuppliers are now independent entities
  const dependencies: DependencyCheck[] = [];

  const canDelete = dependencies.length === 0;

  logger.info('GlassSupplier referential integrity check complete', {
    canDelete,
    dependencyCount: dependencies.length,
    supplierId,
  });

  return Promise.resolve({
    canDelete,
    dependencies,
    message: canDelete
      ? 'El proveedor puede ser eliminado'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  });
}

/**
 * Check if a GlassSolution can be deleted
 * Dependency: GlassTypeSolution (pivot table)
 */
export async function canDeleteGlassSolution(solutionId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for GlassSolution', { solutionId });

  const assignmentCount = await db.glassTypeSolution.count({
    where: { solutionId },
  });

  const dependencies: DependencyCheck[] = [];

  if (assignmentCount > 0) {
    dependencies.push({
      count: assignmentCount,
      entity: 'GlassTypeSolution',
      message: `${assignmentCount} tipo(s) de cristal con esta solución`,
    });
  }

  const canDelete = dependencies.length === 0;

  logger.info('GlassSolution referential integrity check complete', {
    canDelete,
    dependencyCount: dependencies.length,
    solutionId,
  });

  return {
    canDelete,
    dependencies,
    message: canDelete
      ? 'La solución puede ser eliminada'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  };
}

/**
 * Check if a GlassCharacteristic can be deleted
 * Dependency: GlassTypeCharacteristic (pivot table)
 */
export async function canDeleteGlassCharacteristic(characteristicId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for GlassCharacteristic', { characteristicId });

  const assignmentCount = await db.glassTypeCharacteristic.count({
    where: { characteristicId },
  });

  const dependencies: DependencyCheck[] = [];

  if (assignmentCount > 0) {
    dependencies.push({
      count: assignmentCount,
      entity: 'GlassTypeCharacteristic',
      message: `${assignmentCount} tipo(s) de cristal con esta característica`,
    });
  }

  const canDelete = dependencies.length === 0;

  logger.info('GlassCharacteristic referential integrity check complete', {
    canDelete,
    characteristicId,
    dependencyCount: dependencies.length,
  });

  return {
    canDelete,
    dependencies,
    message: canDelete
      ? 'La característica puede ser eliminada'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  };
}

/**
 * Check if a GlassType can be deleted
 * Dependencies: QuoteItems, Model compatible glass types
 */
export async function canDeleteGlassType(glassTypeId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for GlassType', { glassTypeId });

  const quoteItemCount = await db.quoteItem.count({
    where: { glassTypeId },
  });

  // Note: compatibleGlassTypeIds is an array field in Model
  // Check if any model has this glass type in their compatible list
  const modelsWithThisGlassType = await db.model.findMany({
    select: { id: true },
    where: {
      compatibleGlassTypeIds: {
        has: glassTypeId,
      },
    },
  });

  const dependencies: DependencyCheck[] = [];

  if (quoteItemCount > 0) {
    dependencies.push({
      count: quoteItemCount,
      entity: 'QuoteItem',
      message: `${quoteItemCount} ítem(s) de cotización asociado(s)`,
    });
  }

  if (modelsWithThisGlassType.length > 0) {
    dependencies.push({
      count: modelsWithThisGlassType.length,
      entity: 'Model',
      message: `${modelsWithThisGlassType.length} modelo(s) con este tipo de cristal como compatible`,
    });
  }

  const canDelete = dependencies.length === 0;

  logger.info('GlassType referential integrity check complete', {
    canDelete,
    dependencyCount: dependencies.length,
    glassTypeId,
  });

  return {
    canDelete,
    dependencies,
    message: canDelete
      ? 'El tipo de cristal puede ser eliminado'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  };
}

/**
 * Check if a Model can be deleted
 * Dependency: QuoteItems
 */
export async function canDeleteModel(modelId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for Model', { modelId });

  const quoteItemCount = await db.quoteItem.count({
    where: { modelId },
  });

  const dependencies: DependencyCheck[] = [];

  if (quoteItemCount > 0) {
    dependencies.push({
      count: quoteItemCount,
      entity: 'QuoteItem',
      message: `${quoteItemCount} ítem(s) de cotización asociado(s)`,
    });
  }

  const canDelete = dependencies.length === 0;

  logger.info('Model referential integrity check complete', {
    canDelete,
    dependencyCount: dependencies.length,
    modelId,
  });

  return {
    canDelete,
    dependencies,
    message: canDelete
      ? 'El modelo puede ser eliminado'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  };
}

/**
 * Check if a Service can be deleted
 * Dependency: QuoteItemServices
 */
export async function canDeleteService(serviceId: string): Promise<ReferentialIntegrityResult> {
  logger.info('Checking referential integrity for Service', { serviceId });

  const quoteItemServiceCount = await db.quoteItemService.count({
    where: { serviceId },
  });

  const dependencies: DependencyCheck[] = [];

  if (quoteItemServiceCount > 0) {
    dependencies.push({
      count: quoteItemServiceCount,
      entity: 'QuoteItemService',
      message: `${quoteItemServiceCount} ítem(s) de cotización con este servicio`,
    });
  }

  const canDelete = dependencies.length === 0;

  logger.info('Service referential integrity check complete', {
    canDelete,
    dependencyCount: dependencies.length,
    serviceId,
  });

  return {
    canDelete,
    dependencies,
    message: canDelete
      ? 'El servicio puede ser eliminado'
      : `No se puede eliminar: ${dependencies.map((d) => d.message).join(', ')}`,
  };
}
