import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import type { Project, ProjectPhoto } from '@/types/project.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchProjectDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await projectApi.getProjectById(Number(id));
      if (response.success) {
        setProject(response.data);
        const heroIndex = response.data.photos?.findIndex((p: ProjectPhoto) => p.is_hero) ?? 0;
        setActiveIndex(heroIndex >= 0 ? heroIndex : 0);
      }
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Terjadi kesalahan';
      Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: message }).then(() => navigate('/projects'));
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchProjectDetail(); }, [fetchProjectDetail]);

  const handleDelete = async () => {
    if (!project) return;
    const result = await Swal.fire({
      title: 'Yakin hapus project ini?',
      html: `Project <strong>"${project.title}"</strong> akan dihapus permanen!`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        const response = await projectApi.deleteProject(project.id);
        if (response.success) {
          await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Project berhasil dihapus.', timer: 1500, showConfirmButton: false });
          navigate('/projects');
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus' });
      }
    }
  };

  const handleTogglePublish = async () => {
    if (!project) return;
    try {
      const response = await projectApi.togglePublishStatus(project.id);
      if (response.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status diubah', timer: 1500, showConfirmButton: false });
        fetchProjectDetail();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Tidak bisa mengubah status publish.' });
    }
  };

  const handleToggleFeatured = async () => {
    if (!project) return;
    try {
      const response = await projectApi.toggleFeaturedStatus(project.id);
      if (response.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status featured diperbarui', timer: 1500, showConfirmButton: false });
        fetchProjectDetail();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Tidak bisa mengubah status featured.' });
    }
  };

  const formatPrice = (price: string | null | undefined): string => {
    if (!price || price === '0') return 'Hubungi Admin';
    try {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(price));
    } catch { return 'Hubungi Admin'; }
  };

  return {
    project, isLoading, activeIndex, setActiveIndex,
    navigate, fetchProjectDetail,
    handleDelete, handleTogglePublish, handleToggleFeatured, formatPrice,
  };
}