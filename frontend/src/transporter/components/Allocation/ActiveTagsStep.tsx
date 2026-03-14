import { ArrowLeft, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { deleteTag, updateTag } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';
interface ActiveTagsStepProps {
  onBack: () => void;
  onNavigate: (permitNumber: string) => void;
}
export function ActiveTagsStep({ onBack, onNavigate }: ActiveTagsStepProps) {
  const { tags: tagsData, loading, refreshAll } = useSync();
  const [busy, setBusy] = useState<string | null>(null);

  const tags = (tagsData ?? []).map(t => ({
    _id: t._id,
    truckNumber: t.truckNumber,
    permitNumber: t.permitNumber,
    status: t.status,
    expiryHours: Math.max(1, Math.round((new Date(t.createdAt).getTime() + 8 * 3600000 - Date.now()) / 3600000)),
  }));

  const handleCancel = async (id: string) => {
    setBusy(id);
    try { await updateTag(id, { status: 'Cancelled' }); refreshAll(); }
    catch (e: any) { alert(e.message || 'Failed to cancel tag'); }
    finally { setBusy(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this tag?')) return;
    setBusy(id);
    try { await deleteTag(id); refreshAll(); }
    catch (e: any) { alert(e.message || 'Failed to remove tag'); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Feedback
      </button>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Active Tags</h2>
      <p className="text-xs text-neutral-400 mb-5">Read-only view</p>
      {loading ? (
        <div className="text-sm text-neutral-400 py-4">Loading tags…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tags.map(tag => (
            <div key={tag._id}
              className={`text-left border rounded-xl p-4 transition-all ${tag.status === 'Cancelled' ? 'bg-neutral-100 border-neutral-200 opacity-60' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}>
              <div className="flex items-start justify-between">
                <button onClick={() => onNavigate(tag.permitNumber)} className="text-left flex-1">
                  <div className="font-semibold text-neutral-900 text-sm">{tag.truckNumber}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Permit {tag.permitNumber}</div>
                  <div className={`text-xs mt-1.5 font-medium ${tag.status === 'Cancelled' ? 'text-neutral-400' : tag.status === 'Expired' ? 'text-red-500' : 'text-amber-600'
                    }`}>
                    {tag.status === 'Cancelled' ? 'Cancelled' : tag.status === 'Expired' ? 'Expired' : `Expires in ${tag.expiryHours}h`}
                  </div>
                </button>
                {tag.status === 'Tagged' && (
                  <div className="flex flex-col gap-1 ml-2">
                    <button onClick={() => handleCancel(tag._id)} disabled={busy === tag._id}
                      className="text-xs text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Cancel tag">
                      <XIcon size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
