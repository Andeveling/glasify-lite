'use client'

import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { QuoteItemWizard } from '@/components/admin/quote-item-wizard'
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
import { useAdminQuoteCreation } from '../_hooks/use-admin-quote-creation'
import { QuoteItemRow } from './quote-item-row'

export function AdminQuoteCreationForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const {
    form,
    fields,
    handleSubmit,
    wizardOpen,
    setWizardOpen,
    handleDraftConfirm,
    clients,
    glassTypes,
    models,
    isLoading,
    handleRemoveItem,
  } = useAdminQuoteCreation(clientId)

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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                              {client.company && ` (${client.company})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Selecciona el cliente para esta cotización</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ítems de la Cotización</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Agrega los modelos, vidrios y dimensiones para cada ítem
                </p>
              </div>
              <Button onClick={() => setWizardOpen(true)} size="sm" type="button" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Ítem
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="hidden text-muted-foreground text-sm md:grid md:grid-cols-13 md:gap-4">
              <div className="md:col-span-4">Modelo</div>
              <div className="md:col-span-3">Tipo de Vidrio</div>
              <div className="md:col-span-1">Ancho</div>
              <div className="md:col-span-1">Alto</div>
              <div className="md:col-span-1">Cantidad</div>
              <div className="md:col-span-2">Precio</div>
              <div className="md:col-span-1" />
            </div>

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

            {form.formState.errors.items?.root && (
              <p className="text-destructive text-sm">{form.formState.errors.items.root.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={form.formState.isSubmitting || !form.formState.isValid} type="submit">
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Cotización
          </Button>
        </div>

        <QuoteItemWizard
          clientId={clientId}
          mode="draft"
          onDraftConfirm={handleDraftConfirm}
          onOpenChange={setWizardOpen}
          open={wizardOpen}
        />
      </form>
    </Form>
  )
}
