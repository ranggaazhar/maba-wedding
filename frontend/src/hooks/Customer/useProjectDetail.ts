// src/hooks/customer/useProjectDetail.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { projectApi } from '@/api/projectApi';
import type { Project } from '@/types/project.types';

export function useProjectDetail(slug: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await projectApi.getProjectBySlug(slug);
      if (res.success) {
        setProject(res.data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // ── Derived values (memoized) ─────────────────────────────────
  const heroPhoto = useMemo(
    () => project?.photos?.find(p => p.is_hero) ?? project?.photos?.[0] ?? null,
    [project]
  );

  const otherPhotos = useMemo(
    () => project?.photos?.filter(p => !p.is_hero) ?? [],
    [project]
  );

  // ── Helpers ───────────────────────────────────────────────────
  const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return 'Hubungi Kami';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'Hubungi Kami';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return {
    project,
    isLoading,
    notFound,
    heroPhoto,
    otherPhotos,
    formatPrice,
  };
}