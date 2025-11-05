/**
 * Service Row Actions Component
 *
 * Encapsulates action buttons for a service row in the table
 * Follows Single Responsibility Principle (SRP):
 * - Renders action buttons (edit, toggle active, delete)
 * - Emits events to parent component
 * - No business logic (delegated to hooks)
 *
 * @module app/(dashboard)/admin/services/_components/service-row-actions
 */

"use client";

import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ServiceRowActionsProps = {
  /** Service ID */
  serviceId: string;
  /** Service name for accessibility */
  serviceName: string;
  /** Whether the service is currently active */
  isActive: boolean;
  /** Whether actions are currently loading */
  isLoading?: boolean;
  /** Callback when edit button is clicked */
  onEditAction: (serviceId: string) => void;
  /** Callback when toggle active button is clicked */
  onToggleActiveAction: (serviceId: string, currentState: boolean) => void;
  /** Callback when delete button is clicked */
  onDeleteAction: (serviceId: string, serviceName: string) => void;
};

/**
 * Service row actions component
 *
 * Renders three action buttons:
 * - Edit (pencil icon)
 * - Toggle Active/Inactive (power icon)
 * - Delete (trash icon)
 *
 * All buttons have tooltips and loading states
 *
 * @example
 * ```tsx
 * <ServiceRowActions
 *   serviceId="svc-123"
 *   serviceName="Instalación"
 *   isActive={true}
 *   onEditAction={(id) => handleEdit(id)}
 *   onToggleActiveAction={(id, state) => handleToggle(id, state)}
 *   onDeleteAction={(id, name) => handleDelete(id, name)}
 * />
 * ```
 */
export function ServiceRowActions({
  serviceId,
  serviceName,
  isActive,
  isLoading = false,
  onEditAction,
  onToggleActiveAction,
  onDeleteAction,
}: ServiceRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <TooltipProvider>
        {/* Edit Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={isLoading}
              onClick={() => onEditAction(serviceId)}
              size="sm"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar {serviceName}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar servicio</p>
          </TooltipContent>
        </Tooltip>

        {/* Toggle Active Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={isLoading}
              onClick={() => onToggleActiveAction(serviceId, isActive)}
              size="sm"
              variant="ghost"
            >
              {isActive ? (
                <PowerOff className="h-4 w-4 text-orange-500" />
              ) : (
                <Power className="h-4 w-4 text-green-500" />
              )}
              <span className="sr-only">
                {isActive ? "Desactivar" : "Activar"} {serviceName}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isActive ? "Desactivar" : "Activar"} servicio</p>
          </TooltipContent>
        </Tooltip>

        {/* Delete Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={isLoading}
              onClick={() => onDeleteAction(serviceId, serviceName)}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Eliminar {serviceName}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar servicio</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
