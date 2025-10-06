import { Home, Shield, Snowflake, Sparkles } from 'lucide-react';
import type { GlassOption, Model, PriceIndicator, Service, ServiceType } from '../_types/model.types';

export const glassOptions: GlassOption[] = [
  {
    benefits: [ 'Claridad óptima', 'Resistencia básica', 'Ideal para clima templado' ],
    description: 'Perfecta para uso diario en espacios interiores y exteriores',
    icon: Home,
    id: 'general-6mm',
    priceIndicator: 'budget',
    purpose: 'general',
    technicalSpecs: {
      features: [ 'Vidrio flotado' ],
      thickness: '6mm',
    },
    title: 'Solución Estándar',
  },
  {
    benefits: [ 'Reduce hasta 40% en costos de climatización', 'Aislamiento térmico superior', 'Reduce condensación' ],
    description: 'Mantén tu hogar fresco en verano y cálido en invierno',
    icon: Snowflake,
    id: 'insulation-6mm',
    priceIndicator: 'premium',
    purpose: 'insulation',
    technicalSpecs: {
      features: [ 'Bajo emisivo (Low-E)', 'Doble acristalamiento' ],
      thickness: '6mm',
    },
    title: 'Ahorro de Energía',
  },
  {
    benefits: [ 'Resistente a impactos', 'Protección contra intrusos', 'Fragmentos seguros en caso de rotura' ],
    description: 'Máxima seguridad para tu familia y tu hogar',
    icon: Shield,
    id: 'security-8mm',
    priceIndicator: 'premium',
    purpose: 'security',
    technicalSpecs: {
      features: [ 'Templado', 'Laminado' ],
      thickness: '8mm',
    },
    title: 'Protección y Seguridad',
  },
  {
    benefits: [ 'Privacidad sin perder luz natural', 'Diseño elegante', 'Fácil mantenimiento' ],
    description: 'Combina estética moderna con privacidad',
    icon: Sparkles,
    id: 'decorative-6mm',
    priceIndicator: 'standard',
    purpose: 'decorative',
    technicalSpecs: {
      features: [ 'Acabado especial', 'Filtro UV' ],
      thickness: '6mm',
    },
    title: 'Estilo y Privacidad',
  },
];

export const priceLabels: Record<PriceIndicator, string> = {
  budget: 'Económico',
  premium: 'Premium',
  standard: 'Estándar',
};

export const MOCK_SERVICES: Service[] = [
  {
    description: 'Corte a medida',
    id: '1',
    name: 'Corte',
    price: 15.0,
    type: 'fixed',
  },
  {
    description: 'Pulido de bordes',
    id: '2',
    name: 'Pulido',
    price: 25.0,
    type: 'perimeter',
  },
  {
    description: 'Perforación',
    id: '3',
    name: 'Perforado',
    price: 10.0,
    type: 'fixed',
  },
  {
    description: 'Templado térmico',
    id: '4',
    name: 'Templado',
    price: 50.0,
    type: 'area',
  },
  {
    description: 'Laminado de seguridad',
    id: '5',
    name: 'Laminado',
    price: 60.0,
    type: 'area',
  },
  {
    description: 'Serigrafía decorativa',
    id: '6',
    name: 'Serigrafía',
    price: 35.0,
    type: 'area',
  },
];

export const MOCK_MODEL: Model = {
  basePrice: 450.0,
  currency: 'USD',
  description: 'Ventana corrediza de aluminio de alta calidad con sistema de cierre multipunto y perfiles reforzados.',
  dimensions: {
    maxHeight: 2400,
    maxWidth: 2000,
    minHeight: 600,
    minWidth: 600,
  },
  features: [
    'Perfiles de aluminio extruido',
    'Sistema de cierre multipunto',
    'Rodamientos de acero inoxidable',
    'Acabado anodizado resistente',
    'Garantía de 10 años',
  ],
  id: 'ventana-corrediza-aluminio-001',
  imageUrl: '/modern-aluminum-sliding-window.jpg',
  manufacturer: 'VentanasTech Pro',
  name: 'Ventana Corrediza Premium',
};

export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    area: 'Por área (m²)',
    fixed: 'Precio fijo',
    perimeter: 'Por perímetro (ml)',
  };
  return labels[ type ];
}
