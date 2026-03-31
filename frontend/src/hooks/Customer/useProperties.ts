// src/hooks/customer/useProperties.ts
import { useState, useEffect, useMemo } from 'react';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { Property } from '@/types/property.types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [propsResult, catsResult] = await Promise.allSettled([
        propertyApi.getAllProperties({ is_available: true, include_images: true }),
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

  const filteredProperties = useMemo(() => {
    return properties.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [properties, searchQuery]);

  const getPrimaryImage = (property: Property): string => {
    const primary = property.images?.find(i => i.is_primary) ?? property.images?.[0];
    return primary?.url ?? '/placeholder.png';
  };

  const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return 'Hubungi Kami';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'Hubungi Kami';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return {
    properties: filteredProperties,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    getPrimaryImage,
    formatPrice,
  };
}