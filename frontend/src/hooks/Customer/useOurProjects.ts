// src/hooks/Customer/useOurProjects.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { projectApi } from '@/api/projectApi';
import { categoryApi } from '@/api/categoryApi';
import type { Project } from '@/types/project.types';
import type { Category } from '@/types/category.types';

const PAGE_SIZE = 9;

export function useOurProjects() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [projectsResult, categoriesResult] = await Promise.allSettled([
        projectApi.getAllProjects({ is_published: true, include_photos: true }),
        categoryApi.getAllCategories({ is_active: true }),
      ]);

      if (cancelled) return;

      if (projectsResult.status === 'fulfilled' && projectsResult.value.success) {
        setAllProjects(projectsResult.value.data);
      }
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.success) {
        setCategories(categoriesResult.value.data);
      }
      setIsLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Wrapper setters — reset page ke 1 saat filter/search berubah
  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  const handleSetSelectedCategory = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.theme ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'All' || p.category?.name === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [allProjects, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [filteredProjects, currentPage]);

  const getHeroImage = (project: Project): string => {
    const hero = project.photos?.find(p => p.is_hero) ?? project.photos?.[0];
    return hero?.url ?? '/placeholder.png';
  };

  const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return 'Hubungi Kami';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'Hubungi Kami';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return {
    projects: paginatedProjects,
    totalProjects: filteredProjects.length,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    selectedCategory,
    setSelectedCategory: handleSetSelectedCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    getHeroImage,
    formatPrice,
  };
}