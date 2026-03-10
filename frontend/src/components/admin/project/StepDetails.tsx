// src/components/admin/project/StepDetails.tsx
import { useState } from 'react';
import { Plus, X, GripVertical, Edit2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { CreateCompleteProjectData, ProjectDetail, ProjectDetailItem } from '@/types/project.types';

interface StepDetailsProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
}

type DetailType = 'color_palette' | 'flowers' | 'other';

interface NewDetailState {
  detail_type: DetailType;
  title: string;
  item: string;
}

export function StepDetails({ formData, updateFormData }: StepDetailsProps) {
  const [newDetail, setNewDetail] = useState<NewDetailState>({
    detail_type: 'color_palette',
    title: '',
    item: '',
  });

  const addDetail = () => {
    if (!newDetail.title || !newDetail.item) return;

    const details = formData.details || [];
    const existingDetailIndex = details.findIndex((d) => d.title === newDetail.title);

    if (existingDetailIndex !== -1) {
      const updatedDetails = [...details];
      const existingDetail = updatedDetails[existingDetailIndex];
      const newItem: ProjectDetailItem = {
        content: newDetail.item,
        display_order: existingDetail.items.length,
      };
      updatedDetails[existingDetailIndex] = {
        ...existingDetail,
        items: [...existingDetail.items, newItem],
      };
      updateFormData({ details: updatedDetails });
    } else {
      const newDetailGroup: ProjectDetail = {
        detail_type: newDetail.detail_type,
        title: newDetail.title,
        display_order: details.length,
        items: [{ content: newDetail.item, display_order: 0 }],
      };
      updateFormData({ details: [...details, newDetailGroup] });
    }

    setNewDetail({ ...newDetail, item: '' });
  };

  const removeItem = (detailIndex: number, itemIndex: number) => {
    const details = [...(formData.details || [])];
    const detail = details[detailIndex];
    if (!detail) return;

    const newItems = detail.items.filter((_, i) => i !== itemIndex);

    if (newItems.length > 0) {
      details[detailIndex] = {
        ...detail,
        items: newItems.map((item, idx) => ({ ...item, display_order: idx })),
      };
      updateFormData({ details });
    } else {
      details.splice(detailIndex, 1);
      updateFormData({ details: details.map((d, idx) => ({ ...d, display_order: idx })) });
    }
  };

  const updateDetailMetadata = (index: number, updates: Partial<ProjectDetail>) => {
    const details = [...(formData.details || [])];
    if (!details[index]) return;
    details[index] = { ...details[index], ...updates };
    updateFormData({ details });
  };

  const updateItemContent = (detailIndex: number, itemIndex: number, content: string) => {
    const details = [...(formData.details || [])];
    if (!details[detailIndex]?.items[itemIndex]) return;
    details[detailIndex].items[itemIndex] = { ...details[detailIndex].items[itemIndex], content };
    updateFormData({ details });
  };

  const moveDetail = (fromIndex: number, direction: 'up' | 'down') => {
    const details = [...(formData.details || [])];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= details.length) return;
    [details[fromIndex], details[toIndex]] = [details[toIndex], details[fromIndex]];
    updateFormData({ details: details.map((d, idx) => ({ ...d, display_order: idx })) });
  };

  const moveItem = (detailIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const details = [...(formData.details || [])];
    if (!details[detailIndex]) return;
    const items = [...details[detailIndex].items];
    const toIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;
    [items[itemIndex], items[toIndex]] = [items[toIndex], items[itemIndex]];
    details[detailIndex] = {
      ...details[detailIndex],
      items: items.map((item, idx) => ({ ...item, display_order: idx })),
    };
    updateFormData({ details });
  };

  return (
    <div className="space-y-6">
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Detail Project</h2>

        {/* Add Detail Form */}
        <div className="space-y-4 mb-6 p-4 bg-muted/20 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipe Detail</Label>
              <Select
                value={newDetail.detail_type}
                onValueChange={(v: DetailType) => setNewDetail({ ...newDetail, detail_type: v })}
              >
                <SelectTrigger className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color_palette">Palet Warna</SelectItem>
                  <SelectItem value="flowers">Bunga</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Judul Grup</Label>
              <Input
                value={newDetail.title}
                onChange={(e) => setNewDetail({ ...newDetail, title: e.target.value })}
                placeholder="Contoh: Warna Utama"
                className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
              />
            </div>

            <div className="md:col-span-2 flex items-end gap-2">
              <div className="flex-1">
                <Label>Item</Label>
                <Input
                  value={newDetail.item}
                  onChange={(e) => setNewDetail({ ...newDetail, item: e.target.value })}
                  placeholder="Contoh: #FF5733 atau Mawar Merah"
                  className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDetail())}
                />
              </div>
              <Button
                onClick={addDetail}
                size="icon"
                type="button"
                className="mt-6 bg-[hsl(var(--ocean-deep))] text-white hover:bg-[hsl(var(--ocean-soft))] transition-all"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Details List */}
        {formData.details && formData.details.length > 0 ? (
          <div className="space-y-4">
            {formData.details.map((detail, detailIndex) => (
              <div key={`detail-${detailIndex}`} className="p-4 bg-muted/10 rounded-lg border border-border space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col gap-1 pt-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveDetail(detailIndex, 'up')} disabled={detailIndex === 0} type="button">
                        <GripVertical size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveDetail(detailIndex, 'down')} disabled={detailIndex === (formData.details?.length || 0) - 1} type="button">
                        <GripVertical size={14} className="rotate-180" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{detail.title}</h3>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-muted rounded">
                          {detail.detail_type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {detail.items.map((item, itemIndex) => (
                          <div key={`item-${detailIndex}-${itemIndex}`} className="flex items-center gap-2 group">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => moveItem(detailIndex, itemIndex, 'up')} disabled={itemIndex === 0} type="button">↑</Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => moveItem(detailIndex, itemIndex, 'down')} disabled={itemIndex === detail.items.length - 1} type="button">↓</Button>
                            </div>
                            <Input
                              value={item.content}
                              onChange={(e) => updateItemContent(detailIndex, itemIndex, e.target.value)}
                              className="h-8 text-sm flex-1"
                            />
                            <button type="button" onClick={() => removeItem(detailIndex, itemIndex)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" type="button"><Edit2 size={14} /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Detail Metadata</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Judul</Label>
                          <Input value={detail.title} onChange={(e) => updateDetailMetadata(detailIndex, { title: e.target.value })} />
                        </div>
                        <div>
                          <Label>Tipe</Label>
                          <Select value={detail.detail_type} onValueChange={(v: DetailType) => updateDetailMetadata(detailIndex, { detail_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="color_palette">Palet Warna</SelectItem>
                              <SelectItem value="flowers">Bunga</SelectItem>
                              <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={detail.display_order}
                            onChange={(e) => updateDetailMetadata(detailIndex, { display_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">Belum ada detail ditambahkan</p>
          </div>
        )}
      </div>

      <div className="table-container p-4 bg-ocean-light/10 border-l-4 border-primary">
        <p className="text-sm text-foreground">
          <strong>💡 Tips:</strong> Detail dikelompokkan berdasarkan judul. Gunakan tombol ↑↓ untuk mengatur urutan.
        </p>
      </div>
    </div>
  );
}