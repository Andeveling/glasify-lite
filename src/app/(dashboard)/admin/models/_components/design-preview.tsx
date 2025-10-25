/**
 * Design Preview Component
 *
 * Client Component que muestra un preview de un diseño usando DesignRenderer
 * Usado en la galería de selección de diseños
 *
 * Features:
 * - React.memo para optimización de rendering
 * - Tamaño configurable (width, height)
 * - Preview adaptado del diseño con dimensiones base
 * - Click handler opcional para selección
 */

'use client';

import type { ModelType } from '@prisma/client';
import React from 'react';
import { DesignRenderer } from '@/app/_components/design/design-renderer';
import type { AdaptedDesign } from '@/lib/design/types';

interface DesignPreviewProps {
  /** Diseño adaptado con todas las posiciones/tamaños resueltos */
  design: AdaptedDesign;
  /** Ancho del canvas en px */
  width: number;
  /** Alto del canvas en px */
  height: number;
  /** Nombre del diseño en español para mostrar */
  nameEs: string;
  /** Tipo de modelo asociado al diseño */
  modelType: ModelType;
  /** Handler opcional cuando se hace click en el preview */
  onClick?: () => void;
  /** Indica si el diseño está seleccionado actualmente */
  isSelected?: boolean;
  /** ClassName adicional para el contenedor */
  className?: string;
}

/**
 * DesignPreview Component
 *
 * Renderiza un preview de un diseño usando DesignRenderer
 * Optimizado con React.memo para evitar re-renders innecesarios
 */
export const DesignPreview = React.memo<DesignPreviewProps>(
  ({ design, width, height, nameEs, onClick, isSelected = false, className = '' }) => {
    return (
      <button
        aria-label={`Diseño ${nameEs}`}
        aria-pressed={isSelected}
        className={`relative overflow-hidden rounded-lg border-2 bg-gray-50 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
          ${className}
        `}
        onClick={onClick}
        type="button"
      >
        <div className="flex items-center justify-center p-2">
          <DesignRenderer design={design} height={height} width={width} />
        </div>

        {/* Overlay con información del diseño */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="truncate font-medium text-white text-xs">{nameEs}</p>
        </div>

        {/* Indicador de selección */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-white">
              <svg aria-hidden="true" className="size-3" fill="currentColor" viewBox="0 0 20 20">
                <title>Seleccionado</title>
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </button>
    );
  }
);

DesignPreview.displayName = 'DesignPreview';
