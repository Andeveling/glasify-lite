/**
 * Admin Quote Creation Form
 *
 * Client component for creating quotes directly from catalog items.
 * Uses React Hook Form with useFieldArray for dynamic item management.
 *
 * @module app/(dashboard)/admin/quotes/new/_components/admin-quote-creation-form
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/trpc/react'
import { createQuoteFromItemsAction } from '../../../_actions/create-quote.actions'
import { QuoteItemRow } from './quote-item-row'
import {
  type AdminQuoteFormValues,
  adminQuoteFormSchema,
  getAdminQuoteFormDefaults,
} from './schemas/admin-quote-form.schema'

// Catalog data constants
const FIVE_MINUTES_MS = 300_000
const CATALOG_LIMIT = 100

/**
 * Hook to fetch catalog data for quote creation
 */
function useQuoteCreationCatalogData() {
  const { data: modelsData, isLoading: isLoadingModels } = api.catalog['list-models'].useQuery(
    {
      limit: CATALOG_LIMIT,
      page: 1,
      sort: 'name-asc',
    },
    {
      staleTime: FIVE_MINUTES_MS,
    },
  )

  const { data: glassTypesData, isLoading: isLoadingGlassTypes } = api.admin[
    'glass-type'
  ].list.useQuery(
    {
      limit: CATALOG_LIMIT,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    {
      staleTime: FIVE_MINUTES_MS,
    },
  )

  const { data: usersData, isLoading: isLoadingUsers } = api.user['list-all'].useQuery(undefined, {
    staleTime: FIVE_MINUTES_MS,
  })

  // Serialize Decimal fields to numbers
  const serializedGlassTypes = (glassTypesData?.items ?? []).map((gt) => ({
    id: gt.id,
    name: gt.name,
    thicknessMm: gt.thicknessMm,
    pricePerSqm:
      typeof gt.pricePerSqm === 'object' && gt.pricePerSqm !== null
        ? (gt.pricePerSqm as { toNumber: () => number }).toNumber()
        : gt.pricePerSqm,
  }))

  return {
    glassTypes: serializedGlassTypes,
    isLoading: isLoadingModels || isLoadingGlassTypes || isLoadingUsers,
    models: (modelsData?.items ?? []).filter((m: { status: string }) => m.status === 'published'),
    users: usersData ?? [],
  }
}

/**
 * Admin Quote Creation Form Component
 *
 * Features:
 * - Dynamic item array with add/remove
 * - Project info section
 * - Client assignment (optional)
 * - Server action submission via createQuoteFromItemsAction
 */
export function AdminQuoteCreationForm() {
  const router = useRouter()

  // Form setup
  const form = useForm<AdminQuoteFormValues>({
    defaultValues: getAdminQuoteFormDefaults(),
    resolver: zodResolver(adminQuoteFormSchema),
    mode: 'onBlur',
  })

  // Field array for dynamic items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Catalog data
  const { glassTypes, isLoading, models, users } = useQuoteCreationCatalogData()

  // Add new item
  const handleAddItem = useCallback(() => {
    append({
      glassTypeId: '',
      heightMm: 1000,
      modelId: '',
      quantity: 1,
      widthMm: 1000,
    })
  }, [append])

  // Remove item
  const handleRemoveItem = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index)
      }
    },
    [fields.length, remove],
  )

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      // Transform form values to API format
      const { quoteId } = await createQuoteFromItemsAction({
        clientId: values.clientId ?? undefined,
        items: values.items.map((item) => ({
          glassTypeId: item.glassTypeId,
          heightMm: item.heightMm,
          modelId: item.modelId,
          quantity: item.quantity,
          widthMm: item.widthMm,
        })),
        projectAddress: {
          projectCity: values.projectAddress.projectCity,
          projectName: values.projectAddress.projectName,
          projectState: values.projectAddress.projectState,
          projectStreet: values.projectAddress.projectStreet,
        },
        projectName: values.projectName,
      })

      router.push(`/admin/quotes/${quoteId}`)
    } catch {
      // Error handled by toast in createQuoteFromItemsAction
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project Name */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Proyecto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Edificio Parismina - Torre B" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectAddress.projectStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Av. Principal #123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectAddress.projectCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Panama City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectAddress.projectState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado/Región</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Panama" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Client Assignment (optional) */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar a Cliente</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin asignar (cotización propia)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin asignar</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name ?? user.email ?? user.id}
                              {user.role !== 'user' && ` (${user.role})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Opcional: Asigna esta cotización a un cliente existente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ítems de la Cotización</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Agrega los modelos, vidrios y dimensiones para cada ítem
                </p>
              </div>
              <Button onClick={handleAddItem} size="sm" type="button" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Ítem
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Header Row */}
            <div className="hidden text-muted-foreground text-sm md:grid md:grid-cols-13 md:gap-4">
              <div className="md:col-span-4">Modelo</div>
              <div className="md:col-span-3">Tipo de Vidrio</div>
              <div className="md:col-span-1">Ancho</div>
              <div className="md:col-span-1">Alto</div>
              <div className="md:col-span-1">Cantidad</div>
              <div className="md:col-span-2">Precio</div>
              <div className="md:col-span-1" />
            </div>

            {/* Item Rows */}
            {fields.map((field, index) => (
              <QuoteItemRow
                fields={fields}
                glassTypes={glassTypes}
                index={index}
                key={field.id}
                models={models}
                onRemove={handleRemoveItem}
              />
            ))}

            {/* Validation error for items array */}
            {form.formState.errors.items?.root && (
              <p className="text-destructive text-sm">{form.formState.errors.items.root.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={form.formState.isSubmitting || !form.formState.isValid} type="submit">
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Cotización
          </Button>
        </div>
      </form>
    </Form>
  )
}
