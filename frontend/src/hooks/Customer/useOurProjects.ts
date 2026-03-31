// src/hooks/customer/useOurProjects.ts
import { useState, useEffect, useMemo } from 'react';
import { projectApi } from '@/api/projectApi';
import { categoryApi } from '@/api/categoryApi';
import type { Project } from '@/types/project.types';
import type { Category } from '@/types/category.types';

export function useOurProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [projectsResult, categoriesResult] = await Promise.allSettled([
        projectApi.getAllProjects({ is_published: true, include_photos: true }),
        categoryApi.getAllCategories({ is_active: true }),
      ]);

      if (cancelled) return;

      if (projectsResult.status === 'fulfilled' && projectsResult.value.success) {
        setProjects(projectsResult.value.data);
      }
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.success) {
        setCategories(categoriesResult.value.data);
      }
      setIsLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.theme ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'All' || p.category?.name === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

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
    projects: filteredProjects,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getHeroImage,
    formatPrice,
  };
}