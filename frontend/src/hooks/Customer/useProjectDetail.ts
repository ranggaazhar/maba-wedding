// src/hooks/customer/useProjectDetail.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { projectApi } from '@/api/projectApi';
import type { Project } from '@/types/project.types';

export function useProjectDetail(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await projectApi.getProjectById(Number(id));
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
  }, [id]);

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

  const uniqueColors = useMemo(() => {
    const all = project?.photos?.flatMap(p => p.colors ?? []) ?? [];
    return all.filter((c, i, arr) => arr.findIndex(x => x.color_name === c.color_name) === i);
  }, [project]);

  const uniqueFlowers = useMemo(() => {
    const all = project?.photos?.flatMap(p => p.flowers ?? []) ?? [];
    return all.filter((f, i, arr) => arr.findIndex(x => x.flower_name === f.flower_name) === i);
  }, [project]);

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
    uniqueColors,
    uniqueFlowers,
    formatPrice,
  };
}