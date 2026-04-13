/**
 * Client Form Component
 *
 * Form for creating/editing clients with validation.
 * - React Hook Form + Zod validation
 * - Fields: name (required), email, phone, company, notes
 * - Optimistic UI with toast notifications
 *
 * Architecture:
 * - Custom hooks handle form state and mutations
 * - Main component orchestrates composition
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useClientForm } from '../_hooks/use-client-form'
import type { ClientUpdateInput } from '../_schemas/client-form.schema'

type ClientFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: ClientUpdateInput & { id: string }
}

/**
 * Main client form component
 * Handles creation and editing of clients with validation
 */
export function ClientForm({ mode, defaultValues }: ClientFormProps) {
  const router = useRouter()
  const { form, onSubmit, isLoading } = useClientForm({
    defaultValues,
    mode,
  })

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}</CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Completa los datos del nuevo cliente para el sistema de cotizaciones'
                : 'Modifica los datos del cliente existente'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez, María García" {...field} />
                  </FormControl>
                  <FormDescription>Nombre completo o razón social del cliente</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: contacto@empresa.com"
                      type="email"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>Correo electrónico de contacto (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: +507 1234-5678"
                      type="tel"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>Número de teléfono de contacto (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Field */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Vidrios La Equidad, Constructora ABC"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>Nombre de la empresa u organización (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px] resize-y"
                      placeholder="Notas adicionales sobre el cliente, preferencias de contacto, información relevante..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Notas u observaciones sobre el cliente (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            disabled={isLoading}
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={isLoading} type="submit">
            {getButtonLabel(isLoading, mode)}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/**
 * Get button label based on loading state and form mode
 */
function getButtonLabel(isLoading: boolean, mode: 'create' | 'edit'): string {
  if (isLoading) {
    return 'Guardando...'
  }
  return mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'
}
