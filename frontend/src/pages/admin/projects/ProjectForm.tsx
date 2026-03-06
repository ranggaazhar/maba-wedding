import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StepBasicInfo } from '@/pages/admin/projects/project/StepBasicInfo';
import { StepPhotos } from '@/pages/admin/projects/project/StepPhotos';
import { StepIncludes } from '@/pages/admin/projects/project/StepIncludes';
import { StepReview } from '@/pages/admin/projects/project/StepReview';
import { projectApi, type CreateCompleteProjectData, type ProjectPhoto, type ProjectInclude } from '@/api/projectApi';
import Swal from 'sweetalert2';
import axios from 'axios';

const steps = [
  { id: 1, name: 'Info Dasar', description: 'Informasi project' },
  { id: 2, name: 'Foto', description: 'Upload & detail foto' },
  { id: 3, name: 'Konten', description: 'Yang termasuk' },
  { id: 4, name: 'Review', description: 'Cek & simpan' },
];

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEdit);
  const [existingPhotos, setExistingPhotos] = useState<ProjectPhoto[]>([]);

  const [formData, setFormData] = useState<CreateCompleteProjectData>({
    title: '',
    slug: '',
    category_id: 0,
    price: '',
    theme: '',
    description: '',
    atmosphere_description: '',
    is_featured: false,
    is_published: true,
    photos: [],
    hero_photo_index: 0,
    includes: [],
  });

  const fetchProjectData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingData(true);
      const response = await projectApi.getProjectById(Number(id));
      if (response.success) {
        const p = response.data;

        setFormData({
          title: p.title ?? '',
          slug: p.slug ?? '',
          category_id: p.category_id ?? 0,
          price: p.price ?? '',
          theme: p.theme ?? '',
          description: p.description ?? '',
          atmosphere_description: p.atmosphere_description ?? '',
          is_featured: p.is_featured ?? false,
          is_published: p.is_published ?? false,
          photos: [],
          hero_photo_index: (p.photos ?? []).findIndex((img: ProjectPhoto) => img.is_hero) ?? 0,
          includes: (p.includes ?? []).map((i: ProjectInclude) => ({
            item: i.item,
            display_order: i.display_order,
          })),
        });

        setExistingPhotos(p.photos ?? []);
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat data';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
      navigate('/projects');
    } finally {
      setIsLoadingData(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) fetchProjectData();
  }, [isEdit, fetchProjectData]);

  const updateFormData = (data: Partial<CreateCompleteProjectData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step: number) => {
    if (!saving) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!formData.title || !formData.category_id) {
        Swal.fire({ icon: 'warning', title: 'Oops!', text: 'Lengkapi info dasar dulu bang.' });
        goToStep(1);
        return;
      }

      let response;

      if (isEdit && id) {
        const updatePayload: Partial<CreateCompleteProjectData> = {
          title: formData.title,
          slug: formData.slug,
          category_id: formData.category_id,
          price: formData.price,
          theme: formData.theme,
          description: formData.description,
          atmosphere_description: formData.atmosphere_description,
          is_featured: formData.is_featured,
          is_published: formData.is_published,
          includes: formData.includes,
        };

        if (formData.photos && formData.photos.length > 0) {
          updatePayload.photos = formData.photos;
        }

        if (formData.hero_photo_index !== undefined) {
          updatePayload.hero_photo_index = formData.hero_photo_index;
        }

        response = await projectApi.updateCompleteProject(Number(id), updatePayload, existingPhotos);
      } else {
        response = await projectApi.createCompleteProject(formData);
      }

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Mantap!',
          text: `Project berhasil ${isEdit ? 'diperbarui' : 'disimpan'}`,
          timer: 2000,
          showConfirmButton: false,
        });
        navigate('/projects');
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menyimpan';
      Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Mengambil data project...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full md:px-2 lg:px-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} disabled={saving}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Project' : 'Tambah Project Baru'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Langkah {currentStep}: {steps[currentStep - 1].name}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Progress value={(currentStep / steps.length) * 100} className="h-2 transition-all duration-500" />
        <div className="grid grid-cols-4 gap-1 md:gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={`flex flex-col items-center gap-1 group ${currentStep < step.id ? 'cursor-default' : 'cursor-pointer'}`}
              disabled={saving}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep === step.id ? 'border-primary bg-primary text-white scale-110' :
                currentStep > step.id ? 'border-green-500 bg-green-500 text-white' : 'border-muted text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>
              <span className={`text-[10px] font-medium hidden md:block ${currentStep === step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden min-h-[400px] w-full">
        {currentStep === 1 && (
          <StepBasicInfo formData={formData} updateFormData={updateFormData} onNext={nextStep} />
        )}
        {currentStep === 2 && (
          <StepPhotos
            formData={formData}
            updateFormData={updateFormData}
            existingPhotos={existingPhotos}
            projectId={id ? Number(id) : undefined}
            onRefresh={fetchProjectData}
          />
        )}
        {currentStep === 3 && (
          <StepIncludes formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <StepReview formData={formData} goToStep={goToStep} isEdit={isEdit} existingPhotos={existingPhotos} />
        )}
      </div>

      <div className="flex items-center justify-between py-6 border-t w-full">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || saving}>
          <ArrowLeft size={18} className="mr-2" /> Kembali
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={nextStep} className="px-8 flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md">
            Lanjut <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving} className="px-8 flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md">
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Check size={18} className="mr-2" /> {isEdit ? 'Update Project' : 'Simpan Project'}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}