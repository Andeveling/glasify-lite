/**
 * Status Configuration Utility
 *
 * Provides centralized configuration for quote status labels, icons,
 * tooltips, colors, and CTAs. Used by QuoteStatusBadge and other
 * status-related components.
 *
 * @module StatusConfig
 */

import type { Quote } from '@prisma/client';
import { Edit3, FileText, type LucideIcon, Send, XCircle } from 'lucide-react';

/**
 * Quote status type from Prisma schema
 */
export type QuoteStatus = Quote['status'];

/**
 * Badge variant types (Shadcn/ui Badge component)
 */
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * CTA action types
 */
export type CTAAction = 'edit' | 'view' | 'duplicate' | 'resend';

/**
 * Call-to-action configuration
 */
export interface StatusCTA {
  label: string;
  action: CTAAction;
}

/**
 * Complete status configuration
 */
export interface StatusConfig {
  /** Display label in Spanish */
  label: string;

  /** Lucide icon component */
  icon: LucideIcon;

  /** Icon name (for testing) */
  iconName: string;

  /** Explanatory tooltip text */
  tooltip: string;

  /** Badge color variant */
  variant: BadgeVariant;

  /** Alias for variant (legacy compatibility) */
  color: BadgeVariant;

  /** Optional call-to-action button */
  cta?: StatusCTA;
}

/**
 * Status configuration registry
 *
 * Maps each QuoteStatus to its complete configuration including
 * labels, icons, tooltips, colors, and CTAs.
 */
export const STATUS_CONFIG: Record<QuoteStatus, StatusConfig> = {
  canceled: {
    color: 'destructive', // Red - negative state
    cta: {
      action: 'duplicate',
      label: 'Duplicar',
    },
    icon: XCircle,
    iconName: 'x-circle',
    label: 'Cancelada',
    tooltip: 'Esta cotización fue cancelada y no está activa.',
    variant: 'destructive',
  },
  draft: {
    color: 'secondary', // Yellow/Amber - work in progress
    cta: {
      action: 'edit',
      label: 'Continuar editando',
    },
    icon: Edit3,
    iconName: 'edit',
    label: 'En edición',
    tooltip: 'Esta cotización está en edición. Puedes continuar modificándola.',
    variant: 'secondary',
  },

  sent: {
    color: 'default', // Blue - informational
    cta: {
      action: 'view',
      label: 'Ver detalles',
    },
    icon: Send,
    iconName: 'send',
    label: 'Enviada',
    tooltip: 'Cotización enviada al cliente. Pendiente de respuesta.',
    variant: 'default',
  },
};

/**
 * Default status configuration for unknown/invalid status
 */
const DEFAULT_STATUS_CONFIG: StatusConfig = {
  color: 'outline',
  icon: FileText,
  iconName: 'file-text',
  label: 'Desconocido',
  tooltip: 'Estado de cotización desconocido.',
  variant: 'outline',
};

/**
 * Get complete status configuration
 *
 * @param status - Quote status
 * @returns Complete StatusConfig object
 *
 * @example
 * ```typescript
 * const config = getStatusConfig('draft');
 * console.log(config.label); // 'En edición'
 * console.log(config.iconName); // 'edit'
 * ```
 */
export function getStatusConfig(status: QuoteStatus | string): StatusConfig {
  if (!status || typeof status !== 'string') {
    return DEFAULT_STATUS_CONFIG;
  }

  return STATUS_CONFIG[status as QuoteStatus] ?? DEFAULT_STATUS_CONFIG;
}

/**
 * Get status display label
 *
 * @param status - Quote status
 * @returns Human-readable label in Spanish
 *
 * @example
 * ```typescript
 * getStatusLabel('draft'); // 'En edición'
 * getStatusLabel('sent'); // 'Enviada'
 * ```
 */
export function getStatusLabel(status: QuoteStatus | string): string {
  return getStatusConfig(status).label;
}

/**
 * Get status icon component
 *
 * @param status - Quote status
 * @returns Lucide icon component
 */
export function getStatusIconComponent(status: QuoteStatus | string): LucideIcon {
  return getStatusConfig(status).icon;
}

/**
 * Get status icon name (for testing)
 *
 * @param status - Quote status
 * @returns Icon name as string
 *
 * @example
 * ```typescript
 * getStatusIcon('draft'); // 'edit'
 * getStatusIcon('sent'); // 'send'
 * ```
 */
export function getStatusIcon(status: QuoteStatus | string): string {
  return getStatusConfig(status).iconName;
}

/**
 * Get status tooltip text
 *
 * @param status - Quote status
 * @returns Explanatory tooltip in Spanish
 *
 * @example
 * ```typescript
 * getStatusTooltip('draft');
 * // 'Esta cotización está en edición. Puedes continuar modificándola.'
 * ```
 */
export function getStatusTooltip(status: QuoteStatus | string): string {
  return getStatusConfig(status).tooltip;
}

/**
 * Get status badge color variant
 *
 * @param status - Quote status
 * @returns Badge variant for Shadcn/ui Badge component
 *
 * @example
 * ```typescript
 * getStatusColor('draft'); // 'secondary' (yellow)
 * getStatusColor('sent'); // 'default' (blue)
 * getStatusColor('canceled'); // 'destructive' (red)
 * ```
 */
export function getStatusColor(status: QuoteStatus | string): BadgeVariant {
  return getStatusConfig(status).variant;
}

/**
 * Get status call-to-action
 *
 * @param status - Quote status
 * @returns CTA configuration or undefined
 *
 * @example
 * ```typescript
 * getStatusCTA('draft');
 * // { label: 'Continuar editando', action: 'edit' }
 * ```
 */
export function getStatusCTA(status: QuoteStatus | string): StatusCTA | undefined {
  return getStatusConfig(status).cta;
}

/**
 * Check if a status is valid
 *
 * @param status - Status to check
 * @returns True if status is valid (draft, sent, or canceled)
 */
export function isValidStatus(status: string): status is QuoteStatus {
  return status in STATUS_CONFIG;
}

/**
 * Get all available statuses
 *
 * @returns Array of all valid QuoteStatus values
 */
export function getAllStatuses(): QuoteStatus[] {
  return Object.keys(STATUS_CONFIG) as QuoteStatus[];
}
