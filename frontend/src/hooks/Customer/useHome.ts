// src/hooks/customer/useHome.ts
import { useState, useEffect } from 'react';
import { projectApi } from '@/api/projectApi';
import { reviewApi } from '@/api/reviewApi';
import type { Project } from '@/types/project.types';
import type { Review } from '@/api/reviewApi';

interface HomeState {
  featuredProjects: Project[];
  testimonials: Review[];
  isLoadingProjects: boolean;
  isLoadingTestimonials: boolean;
}

export function useHome() {
  const [state, setState] = useState<HomeState>({
    featuredProjects: [],
    testimonials: [],
    isLoadingProjects: true,
    isLoadingTestimonials: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [projectsResult, reviewsResult] = await Promise.allSettled([
        projectApi.getAllProjects({ is_published: true, is_featured: true, include_photos: true }),
        reviewApi.getPublishedReviews(6, false),
      ]);

      if (cancelled) return;

      setState({
        featuredProjects:
          projectsResult.status === 'fulfilled' && projectsResult.value.success
            ? projectsResult.value.data
            : [],
        testimonials:
          reviewsResult.status === 'fulfilled' && reviewsResult.value.success
            ? reviewsResult.value.data
            : [],
        isLoadingProjects: false,
        isLoadingTestimonials: false,
      });
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  const getHeroImage = (project: Project): string => {
    const hero = project.photos?.find(p => p.is_hero) ?? project.photos?.[0];
    return hero?.url ?? '/placeholder.png';
  };

  const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return 'Hubungi Kami';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'Hubungi Kami';
    return `Mulai dari Rp ${num.toLocaleString('id-ID')}`;
  };

  return { ...state, getHeroImage, formatPrice };
}