// src/hooks/customer/useProperties.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { Property } from '@/types/property.types';

const PAGE_SIZE = 8;

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [propsResult, catsResult] = await Promise.allSettled([
        propertyApi.getAllProperties({ is_available: true }),
        propertyCategoryApi.getAllPropertyCategories(),
      ]);

      if (cancelled) return;

      if (propsResult.status === 'fulfilled' && propsResult.value.success) {
        setProperties(propsResult.value.data);
      }
      if (catsResult.status === 'fulfilled' && catsResult.value.success) {
        setCategories(catsResult.value.data);
      }
      setIsLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  const handleSetSelectedCategory = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'All' || p.category?.name === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [properties, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProperties.slice(start, start + PAGE_SIZE);
  }, [filteredProperties, currentPage]);

  const getPrimaryImage = (property: Property): string => {
    return property.image_url ?? '/placeholder.png';
  };

  const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return 'Hubungi Kami';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'Hubungi Kami';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return {
    properties: paginatedProperties,
    totalProperties: filteredProperties.length,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    selectedCategory,
    setSelectedCategory: handleSetSelectedCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    getPrimaryImage,
    formatPrice,
  };
}