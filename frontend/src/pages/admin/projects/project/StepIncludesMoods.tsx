// src/components/admin/project/StepIncludesMoods.tsx - COMPLETE WITH METADATA
import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { CreateCompleteProjectData, ProjectInclude, ProjectMood } from '@/api/projectApi';

interface StepIncludesMoodsProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
}

export function StepIncludesMoods({ formData, updateFormData }: StepIncludesMoodsProps) {
  const [newInclude, setNewInclude] = useState('');
  const [newMood, setNewMood] = useState('');

  // === INCLUDES ===
  const addInclude = () => {
    if (!newInclude.trim()) return;
    
    const includes = formData.includes || [];
    const newItem: ProjectInclude = {
      item: newInclude.trim(),
      display_order: includes.length
    };

    updateFormData({
      includes: [...includes, newItem],
    });
    setNewInclude('');
  };

  const removeInclude = (index: number) => {
    const newIncludes = [...(formData.includes || [])];
    newIncludes.splice(index, 1);
    
    // Reorder
    const reordered = newIncludes.map((inc, idx) => ({
      ...inc,
      display_order: idx
    }));

    updateFormData({ includes: reordered });
  };

  const updateIncludeItem = (index: number, item: string) => {
    const includes = [...(formData.includes || [])];
    includes[index] = { ...includes[index], item };
    updateFormData({ includes });
  };

  const moveInclude = (fromIndex: number, direction: 'up' | 'down') => {
    const includes = [...(formData.includes || [])];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= includes.length) return;

    [includes[fromIndex], includes[toIndex]] = [includes[toIndex], includes[fromIndex]];

    // Update display_order
    const reordered = includes.map((inc, idx) => ({
      ...inc,
      display_order: idx
    }));

    updateFormData({ includes: reordered });
  };

  // === MOODS ===
  const addMood = () => {
    if (!newMood.trim()) return;
    
    const moods = formData.moods || [];
    const newItem: ProjectMood = {
      mood: newMood.trim(),
      display_order: moods.length
    };

    updateFormData({
      moods: [...moods, newItem],
    });
    setNewMood('');
  };

  const removeMood = (index: number) => {
    const newMoods = [...(formData.moods || [])];
    newMoods.splice(index, 1);
    
    // Reorder
    const reordered = newMoods.map((mood, idx) => ({
      ...mood,
      display_order: idx
    }));

    updateFormData({ moods: reordered });
  };

  const updateMoodText = (index: number, mood: string) => {
    const moods = [...(formData.moods || [])];
    moods[index] = { ...moods[index], mood };
    updateFormData({ moods });
  };

  const moveMood = (fromIndex: number, direction: 'up' | 'down') => {
    const moods = [...(formData.moods || [])];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= moods.length) return;

    [moods[fromIndex], moods[toIndex]] = [moods[toIndex], moods[fromIndex]];

    // Update display_order
    const reordered = moods.map((mood, idx) => ({
      ...mood,
      display_order: idx
    }));

    updateFormData({ moods: reordered });
  };

  return (
    <div className="space-y-6">
      {/* === INCLUDES SECTION === */}
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Yang Termasuk</h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInclude}
              onChange={(e) => setNewInclude(e.target.value)}
              placeholder="Contoh: 1 Set Pelaminan Utama"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
            />
            <Button onClick={addInclude}
            className="px-8 flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md">
              <Plus size={18} className="mr-2" />
              Tambah
            </Button>
          </div>

          {/* Includes List */}
          {formData.includes && formData.includes.length > 0 ? (
            <div className="space-y-2">
              {formData.includes.map((include, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border group"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={() => moveInclude(index, 'up')}
                      disabled={index === 0}
                      type="button"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={() => moveInclude(index, 'down')}
                      disabled={index === formData.includes!.length - 1}
                      type="button"
                    >
                      ↓
                    </Button>
                  </div>

                  <span className="text-sm text-muted-foreground shrink-0">✓</span>
                  
                  {/* Editable Input */}
                  <Input
                    value={include.item}
                    onChange={(e) => updateIncludeItem(index, e.target.value)}
                    className="h-9 flex-1 text-sm"
                  />

                  {/* Display Order Badge */}
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    #{include.display_order}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeInclude(index)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Belum ada item ditambahkan</p>
          )}
        </div>
      </div>

      {/* === MOODS SECTION === */}
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Suasana / Mood</h2>

        <div className="space-y-4">
          {/* Add Form */}
          <div className="flex gap-2">
            <Input
              value={newMood}
              onChange={(e) => setNewMood(e.target.value)}
              placeholder="Contoh: Romantic"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMood())}
            />
            <Button onClick={addMood}
            className="px-8 flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md">
              <Plus size={18} className="mr-2" />
              Tambah
            </Button>
          </div>

          {/* Moods List */}
          {formData.moods && formData.moods.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {formData.moods.map((mood, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
                        <span className="text-sm font-medium">{mood.mood}</span>
                        <span className="text-xs opacity-60">#{mood.display_order}</span>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Mood</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Mood</Label>
                          <Input
                            value={mood.mood}
                            onChange={(e) => updateMoodText(index, e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => moveMood(index, 'up')}
                            disabled={index === 0}
                            type="button"
                          >
                            <GripVertical size={14} className="mr-2" />
                            Pindah Atas
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => moveMood(index, 'down')}
                            disabled={index === formData.moods!.length - 1}
                            type="button"
                          >
                            <GripVertical size={14} className="mr-2 rotate-180" />
                            Pindah Bawah
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => removeMood(index)}
                            type="button"
                            className="ml-auto"
                          >
                            <X size={14} className="mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Belum ada mood ditambahkan</p>
          )}
        </div>
      </div>

      <div className="table-container p-4 bg-ocean-light/10 border-l-4 border-primary">
        <p className="text-sm text-foreground">
          <strong>💡 Tips:</strong> Gunakan tombol ↑↓ untuk mengatur urutan tampilan. Display Order otomatis diupdate saat reorder.
        </p>
      </div>
    </div>
  );
}