import type { ModelDetailOutput } from '@/server/api/routers/catalog';
import type { Model } from '../_types/model.types';

/**
 * Adapts ModelDetailOutput from tRPC to Model type used in components
 */
export function adaptModelFromServer(serverModel: ModelDetailOutput): Model {
  return {
    basePrice: serverModel.basePrice,
    currency: serverModel.manufacturer?.currency ?? 'USD',
    description: 'Modelo de alta calidad con excelentes características', // TODO: Add description field to Model table
    dimensions: {
      maxHeight: serverModel.maxHeightMm,
      maxWidth: serverModel.maxWidthMm,
      minHeight: serverModel.minHeightMm,
      minWidth: serverModel.minWidthMm,
    },
    features: [
      // TODO: Add features field to Model table
      'Fabricación de alta calidad',
      'Materiales duraderos',
      'Garantía del fabricante',
    ],
    id: serverModel.id,
    imageUrl: '/modern-aluminum-sliding-window.jpg', // TODO: Add imageUrl to Model table
    manufacturer: serverModel.manufacturer?.name ?? 'Fabricante desconocido',
    name: serverModel.name,
  };
}
