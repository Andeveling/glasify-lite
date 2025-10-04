'use client';

import { Filter, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FilterOptions = {
  manufacturerId?: string;
  type?: string;
  q?: string;
};

type ModelFilterProps = {
  manufacturers: Array<{ id: string; name: string }>;
  types: Array<{ value: string; label: string }>;
  initialFilters?: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
};

export function ModelFilter({ manufacturers, types, initialFilters = {}, onFilterChange }: ModelFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.q || '');
  const [selectedManufacturer, setSelectedManufacturer] = useState(initialFilters.manufacturerId || 'all');
  const [selectedType, setSelectedType] = useState(initialFilters.type || 'all');

  const hasActiveFilters = Boolean(
    searchQuery || (selectedManufacturer && selectedManufacturer !== 'all') || (selectedType && selectedType !== 'all')
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedManufacturer('all');
    setSelectedType('all');
    onFilterChange({});
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Auto-apply search as user types (debounced in parent component)
    const filters: FilterOptions = {};
    if (value.trim()) {
      filters.q = value.trim();
    }
    if (selectedManufacturer && selectedManufacturer !== 'all') {
      filters.manufacturerId = selectedManufacturer;
    }
    if (selectedType && selectedType !== 'all') {
      filters.type = selectedType;
    }

    onFilterChange(filters);
  };

  const handleManufacturerChange = (value: string) => {
    setSelectedManufacturer(value);
    // Apply filters immediately when select changes
    const filters: FilterOptions = {};
    if (searchQuery.trim()) {
      filters.q = searchQuery.trim();
    }
    if (value && value !== 'all') {
      filters.manufacturerId = value;
    }
    if (selectedType && selectedType !== 'all') {
      filters.type = selectedType;
    }
    onFilterChange(filters);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    const filters: FilterOptions = {};
    if (searchQuery.trim()) {
      filters.q = searchQuery.trim();
    }
    if (selectedManufacturer && selectedManufacturer !== 'all') {
      filters.manufacturerId = selectedManufacturer;
    }
    if (value && value !== 'all') {
      filters.type = value;
    }
    onFilterChange(filters);
  };

  const removeManufacturerFilter = () => {
    setSelectedManufacturer('all');
    const filters: FilterOptions = {};
    if (searchQuery.trim()) {
      filters.q = searchQuery.trim();
    }
    if (selectedType && selectedType !== 'all') {
      filters.type = selectedType;
    }
    onFilterChange(filters);
  };

  const removeTypeFilter = () => {
    setSelectedType('all');
    const filters: FilterOptions = {};
    if (searchQuery.trim()) {
      filters.q = searchQuery.trim();
    }
    if (selectedManufacturer && selectedManufacturer !== 'all') {
      filters.manufacturerId = selectedManufacturer;
    }
    onFilterChange(filters);
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Filtrar modelos</h3>
        {hasActiveFilters && (
          <Button
            className="ml-auto text-muted-foreground text-xs hover:text-foreground"
            onClick={clearAllFilters}
            size="sm"
            variant="ghost"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Buscar modelos por nombre o código"
            className="pl-8"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre o código..."
            value={searchQuery}
          />
        </div>

        {/* Fabricante Filter */}
        <Select onValueChange={handleManufacturerChange} value={selectedManufacturer}>
          <SelectTrigger aria-label="Filtrar por fabricante">
            <SelectValue placeholder="Todos los manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los manufacturer</SelectItem>
            {manufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tipo Filter */}
        <Select onValueChange={handleTypeChange} value={selectedType}>
          <SelectTrigger aria-label="Filtrar por tipo de modelo">
            <SelectValue placeholder="Todos los types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los types</SelectItem>
            {types.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
