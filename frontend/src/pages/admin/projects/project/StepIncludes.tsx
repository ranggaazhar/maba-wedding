import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CreateCompleteProjectData, ProjectInclude } from '@/api/projectApi';

interface StepIncludesProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
}

export function StepIncludes({ formData, updateFormData }: StepIncludesProps) {
  const [newInclude, setNewInclude] = useState('');

  const addInclude = () => {
    if (!newInclude.trim()) return;

    const includes = formData.includes || [];
    const newItem: ProjectInclude = {
      item: newInclude.trim(),
      display_order: includes.length,
    };

    updateFormData({ includes: [...includes, newItem] });
    setNewInclude('');
  };

  const removeInclude = (index: number) => {
    const newIncludes = [...(formData.includes || [])];
    newIncludes.splice(index, 1);
    const reordered = newIncludes.map((inc, idx) => ({ ...inc, display_order: idx }));
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
    const reordered = includes.map((inc, idx) => ({ ...inc, display_order: idx }));
    updateFormData({ includes: reordered });
  };

  return (
    <div className="space-y-6">
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Yang Termasuk dalam Paket</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Tambahkan item-item yang sudah termasuk dalam paket dekorasi ini.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInclude}
              onChange={(e) => setNewInclude(e.target.value)}
              placeholder="Contoh: 1 Set Pelaminan Utama"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
            />
            <Button
              onClick={addInclude}
              className="px-8 flex items-center justify-center gap-2 bg-[hsl(var(--ocean-deep))] text-white py-2.5 rounded-lg hover:bg-[hsl(var(--ocean-soft))] transition-all font-semibold text-sm shadow-md"
              type="button"
            >
              <Plus size={18} className="mr-2" />
              Tambah
            </Button>
          </div>

          {formData.includes && formData.includes.length > 0 ? (
            <div className="space-y-2">
              {formData.includes.map((include, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border group"
                >
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => moveInclude(index, 'up')} disabled={index === 0} type="button">↑</Button>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => moveInclude(index, 'down')} disabled={index === (formData.includes?.length ?? 0) - 1} type="button">↓</Button>
                  </div>

                  <span className="text-sm text-muted-foreground shrink-0">✓</span>

                  <Input
                    value={include.item}
                    onChange={(e) => updateIncludeItem(index, e.target.value)}
                    className="h-9 flex-1 text-sm"
                  />

                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    #{include.display_order}
                  </span>

                  <button onClick={() => removeInclude(index)} className="text-muted-foreground hover:text-destructive p-1" type="button">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-sm">Belum ada item ditambahkan</p>
            </div>
          )}
        </div>
      </div>

      <div className="table-container p-4 bg-ocean-light/10 border-l-4 border-primary">
        <p className="text-sm text-foreground">
          <strong>💡 Tips:</strong> Gunakan tombol ↑↓ untuk mengatur urutan tampilan. Tekan Enter untuk cepat menambah item.
        </p>
      </div>
    </div>
  );
}