import { useState, useEffect } from 'react';
import { projectApi } from '@/api/projectApi';
import { categoryApi } from '@/api/categoryApi';
import type { Project } from '@/types/project.types';
import type { Category } from '@/types/category.types';
import type { BookingModel } from '@/types/booking.types';
import Swal from 'sweetalert2';

export function useStep2Models(models: BookingModel[], setModels: (m: BookingModel[]) => void) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [projectsRes, categoriesRes] = await Promise.all([
          projectApi.getAllProjects({ is_published: true, include_photos: true }),
          categoryApi.getAllCategories({ is_active: true }),
        ]);
        if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
        else setError('Gagal memuat data project');
        if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
      } catch {
        setError('Terjadi kesalahan saat memuat data. Silakan refresh halaman.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = selectedCategory === 'all'
    ? projects : projects.filter(p => String(p.category_id) === selectedCategory);

  const handleAddModel = (project: Project) => {
    if (models.find(m => m.project_id === project.id)) {
      Swal.fire('Info', 'Model sudah ditambahkan', 'info');
      return;
    }
    setModels([...models, {
      category_id: project.category_id, project_id: project.id,
      project_title: project.title, price: project.price || '0',
      notes: '', display_order: models.length,
    }]);
  };

  const handleRemoveModel = (index: number) => setModels(models.filter((_, i) => i !== index));

  const handleUpdateNotes = (index: number, notes: string) => {
    const updated = [...models];
    updated[index].notes = notes;
    setModels(updated);
  };

  const getHeroImage = (project: Project) => {
    const heroPhoto = project.photos?.find(p => p.is_hero);
    return heroPhoto?.url || project.photos?.[0]?.url || '';
  };

  return {
    projects, categories, isLoading, error,
    selectedCategory, setSelectedCategory,
    filteredProjects,
    handleAddModel, handleRemoveModel, handleUpdateNotes, getHeroImage,
  };
}