/**
 * useModelFilters Hook
 *
 * Custom hook for managing model list filters state
 * Follows Single Responsibility Principle - only handles filter state logic
 */

import { useState } from 'react';

export type ModelFilterState = {
  search: string;
  status: 'all' | 'draft' | 'published';
  profileSupplierId: string;
  page: number;
};

export function useModelFilters() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [profileSupplierId, setProfileSupplierId] = useState<string>('all');
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusChange = (value: 'all' | 'draft' | 'published') => {
    setStatus(value);
    setPage(1); // Reset to first page on filter change
  };

  const handleSupplierChange = (value: string) => {
    setProfileSupplierId(value);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setProfileSupplierId('all');
    setPage(1);
  };

  return {
    filters: {
      page,
      profileSupplierId,
      search,
      status,
    },
    handlers: {
      handlePageChange,
      handleSearchChange,
      handleStatusChange,
      handleSupplierChange,
      resetFilters,
    },
  };
}
