/**
 * ModelFilters Component
 * 
 * Search and filter controls for model list
 * Follows Single Responsibility Principle - only renders filter UI
 */

'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Supplier = {
  id: string;
  name: string;
};

type ModelFiltersProps = {
  search: string;
  status: 'all' | 'draft' | 'published';
  profileSupplierId: string;
  suppliers: Supplier[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | 'draft' | 'published') => void;
  onSupplierChange: (value: string) => void;
};

export function ModelFilters({
  onSearchChange,
  onStatusChange,
  onSupplierChange,
  profileSupplierId,
  search,
  status,
  suppliers,
}: ModelFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Busca y filtra modelos</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="search">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              id="search"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, SKU..."
              value={search}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="status">
            Estado
          </label>
          <Select onValueChange={onStatusChange} value={status}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Profile Supplier Filter */}
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="profileSupplierId">
            Proveedor de Perfiles
          </label>
          <Select onValueChange={onSupplierChange} value={profileSupplierId}>
            <SelectTrigger id="profileSupplierId">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Button with Link */}
        <div className="flex items-end">
          <Button asChild className="w-full">
            <Link href="/admin/models/new">
              <Plus className="mr-2 size-4" />
              Nuevo Modelo
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
