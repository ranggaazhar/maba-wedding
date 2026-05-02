// src/hooks/customer/useStep2CustomRequest.ts
import { useState, useRef } from 'react';
import type { CreateCustomRequestData } from '@/types/booking.types';

interface CustomRequestDraft extends CreateCustomRequestData {
  files: File[];
  previewUrls: string[];
}

const MAX_FILES_PER_REQUEST = 7;
const MAX_FILE_SIZE_MB = 10;

function createEmptyDraft(): CustomRequestDraft {
  return {
    title: '',
    description: '',
    color_theme: '',
    reference_images: [],
    files: [],
    previewUrls: [],
  };
}

export function useStep2CustomRequest(
  onChange: (requests: CreateCustomRequestData[], files: Record<number, File[]>) => void
) {
  const [drafts, setDrafts] = useState<CustomRequestDraft[]>([createEmptyDraft()]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Update draft ──────────────────────────────────────────────────────────

  const updateDraft = (index: number, field: keyof CreateCustomRequestData, value: string) => {
    setDrafts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error on change
    if (errors[index]?.[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        if (updated[index]) delete updated[index][field];
        return updated;
      });
    }

    notify(index, field, value);
  };

  const notify = (
    changedIndex: number,
    field: keyof CreateCustomRequestData,
    value: string
  ) => {
    setDrafts((prev) => {
      const requests = prev.map((d) => ({
        title: d.title,
        description: d.description,
        color_theme: d.color_theme,
        reference_images: d.reference_images,
      }));

      // Apply the change
      (requests[changedIndex] as Record<string, unknown>)[field] = value;

      const filesMap: Record<number, File[]> = {};
      prev.forEach((d, i) => { if (d.files.length > 0) filesMap[i] = d.files; });

      onChange(requests, filesMap);
      return prev; // State sudah diupdate sebelumnya
    });
  };

  // ── File upload ───────────────────────────────────────────────────────────

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length === 0) return;

    const current = drafts[index];
    const remaining = MAX_FILES_PER_REQUEST - current.files.length;

    if (remaining <= 0) {
      alert(`Maksimal ${MAX_FILES_PER_REQUEST} foto per request`);
      return;
    }

    const toAdd: File[] = [];
    const skipped: string[] = [];

    newFiles.slice(0, remaining).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        skipped.push(file.name);
      } else {
        toAdd.push(file);
      }
    });

    if (skipped.length > 0) {
      alert(`File berikut melebihi ${MAX_FILE_SIZE_MB}MB dan dilewati:\n${skipped.join('\n')}`);
    }

    if (toAdd.length === 0) return;

    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));

    setDrafts((prev) => {
      const updated = [...prev];
      const draft = { ...updated[index] };
      draft.files = [...draft.files, ...toAdd];
      draft.previewUrls = [...draft.previewUrls, ...newPreviews];
      updated[index] = draft;

      // Notify parent
      const requests = updated.map((d) => ({
        title: d.title,
        description: d.description,
        color_theme: d.color_theme,
        reference_images: d.reference_images,
      }));
      const filesMap: Record<number, File[]> = {};
      updated.forEach((d, i) => { if (d.files.length > 0) filesMap[i] = d.files; });
      onChange(requests, filesMap);

      return updated;
    });

    // Reset input so same file can be re-selected
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const handleRemoveFile = (requestIndex: number, fileIndex: number) => {
    setDrafts((prev) => {
      const updated = [...prev];
      const draft = { ...updated[requestIndex] };

      // Revoke preview URL to free memory
      URL.revokeObjectURL(draft.previewUrls[fileIndex]);

      draft.files = draft.files.filter((_, i) => i !== fileIndex);
      draft.previewUrls = draft.previewUrls.filter((_, i) => i !== fileIndex);
      updated[requestIndex] = draft;

      const requests = updated.map((d) => ({
        title: d.title,
        description: d.description,
        color_theme: d.color_theme,
        reference_images: d.reference_images,
      }));
      const filesMap: Record<number, File[]> = {};
      updated.forEach((d, i) => { if (d.files.length > 0) filesMap[i] = d.files; });
      onChange(requests, filesMap);

      return updated;
    });
  };

  // ── Add / Remove request ──────────────────────────────────────────────────

  const handleAddRequest = () => {
    setDrafts((prev) => [...prev, createEmptyDraft()]);
  };

  const handleRemoveRequest = (index: number) => {
    if (drafts.length === 1) return; // Minimal 1

    setDrafts((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // Revoke all preview URLs for removed draft
      prev[index].previewUrls.forEach((url) => URL.revokeObjectURL(url));

      const requests = updated.map((d) => ({
        title: d.title,
        description: d.description,
        color_theme: d.color_theme,
        reference_images: d.reference_images,
      }));
      const filesMap: Record<number, File[]> = {};
      updated.forEach((d, i) => { if (d.files.length > 0) filesMap[i] = d.files; });
      onChange(requests, filesMap);

      return updated;
    });

    // Hapus error untuk index ini & re-index
    setErrors((prev) => {
      const updated: Record<number, Record<string, string>> = {};
      Object.keys(prev).forEach((key) => {
        const k = Number(key);
        if (k < index) updated[k] = prev[k];
        else if (k > index) updated[k - 1] = prev[k];
      });
      return updated;
    });
  };

  // ── Validate ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let valid = true;

    drafts.forEach((draft, index) => {
      const fieldErrors: Record<string, string> = {};

      if (!draft.title.trim()) {
        fieldErrors.title = 'Judul request wajib diisi';
        valid = false;
      } else if (draft.title.length > 200) {
        fieldErrors.title = 'Judul maksimal 200 karakter';
        valid = false;
      }

      if (!draft.description.trim()) {
        fieldErrors.description = 'Deskripsi wajib diisi';
        valid = false;
      }

      if (draft.color_theme && draft.color_theme.length > 100) {
        fieldErrors.color_theme = 'Tema warna maksimal 100 karakter';
        valid = false;
      }

      if (Object.keys(fieldErrors).length > 0) {
        newErrors[index] = fieldErrors;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  return {
    drafts,
    errors,
    fileInputRefs,

    // Handlers
    updateDraft,
    handleFileChange,
    handleRemoveFile,
    handleAddRequest,
    handleRemoveRequest,
    validate,

    MAX_FILES_PER_REQUEST,
    MAX_FILE_SIZE_MB,
  };
}