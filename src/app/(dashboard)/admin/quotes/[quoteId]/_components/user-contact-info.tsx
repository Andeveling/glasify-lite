/**
 * User Contact Info Component (US7 - T029)
 *
 * Displays creator contact information in quote detail view
 *
 * Features:
 * - User name (or email fallback)
 * - Mailto link for email
 * - Tel link for contactPhone (from Quote, not User)
 * - Role badge
 * - Handles deleted user gracefully
 */

"use client";

import { Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRoleBadge } from "../../_components/quote-role-badge";
import type { UserContactInfo as UserInfo } from "../../_types/quote-list.types";

type UserContactInfoProps = {
  user: UserInfo | null;
  contactPhone?: string | null;
};

export function UserContactInfo({ user, contactPhone }: UserContactInfoProps) {
  // Handle deleted user
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Información del Creador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Usuario desconocido</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = user.name || user.email || "Usuario desconocido";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="size-4" />
          Información del Creador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Name with role badge */}
        <div>
          <p className="font-medium text-muted-foreground text-sm">Nombre</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{displayName}</p>
            <QuoteRoleBadge role={user.role} />
          </div>
        </div>

        {/* Email (clickable mailto) */}
        {user.email && (
          <div>
            <p className="font-medium text-muted-foreground text-sm">Email</p>
            <a
              className="flex items-center gap-2 text-primary hover:underline"
              href={`mailto:${user.email}`}
            >
              <Mail className="size-4" />
              {user.email}
            </a>
          </div>
        )}

        {/* Phone (from Quote.contactPhone) */}
        {contactPhone && (
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Teléfono
            </p>
            <a
              className="flex items-center gap-2 text-primary hover:underline"
              href={`tel:${contactPhone}`}
            >
              <Phone className="size-4" />
              {contactPhone}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
