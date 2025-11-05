import { Users } from "lucide-react";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * User Management Page
 * Task: T038 [P] [US5] - Updated for seller access
 *
 * Server Component with metadata export.
 * Placeholder UI for future user management implementation.
 *
 * This page is accessible by admin and seller roles (protected by middleware).
 * Sellers can view users but cannot modify roles (adminProcedure restriction).
 *
 * Future Implementation TODO:
 * - User list table with role badges
 * - Search and filter by role
 * - Role update modal/dialog (admin-only action)
 * - User creation form (if needed)
 * - User deletion/deactivation (admin-only)
 * - Audit log of role changes
 * - Pagination for large user lists
 * - Export users to CSV
 *
 * tRPC Procedures Available:
 * - user.list-all (T036) - List all users (seller/admin access)
 * - user.update-role (T037) - Update user role (admin-only)
 *
 * Components to Create:
 * - UsersTable (Client Component) - Display users in table format
 * - RoleUpdateDialog (Client Component) - Modal for changing user roles (admin-only)
 * - UserFilters (Client Component) - Search and filter controls
 * - RoleBadge (Component) - Visual indicator of user role
 */
export const metadata: Metadata = {
  description: "Administra roles y permisos de usuarios del sistema",
  title: "Gestión de Usuarios - Glasify",
};

export default function UsersPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">
          Gestión de Usuarios
        </h1>
        <p className="text-muted-foreground">
          Administra roles y permisos de usuarios del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Usuarios del Sistema</CardTitle>
          </div>
          <CardDescription>
            Esta funcionalidad estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-muted-foreground/25 border-dashed bg-muted/50 p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-lg">Próximamente</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              La interfaz de gestión de usuarios está en desarrollo.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Funcionalidades Planificadas:</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Listar todos los usuarios del sistema con sus roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Buscar usuarios por nombre o correo electrónico</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Filtrar usuarios por rol (admin, seller, user)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Cambiar el rol de un usuario con validación</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Ver historial de cotizaciones por usuario</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Registro de auditoría de cambios de roles</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium text-sm">Nota para Desarrolladores</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Los endpoints de tRPC ya están implementados:{" "}
              <code className="rounded bg-background px-1 py-0.5">
                user.list-all
              </code>{" "}
              y{" "}
              <code className="rounded bg-background px-1 py-0.5">
                user.update-role
              </code>
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Ver TODO comments en este archivo para detalles de implementación.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
