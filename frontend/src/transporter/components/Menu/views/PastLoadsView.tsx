import { useState } from 'react';
import { createLoad, updateLoad, deleteLoad, type ActiveLoad } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';
import { Plus, Pencil, Trash2, X, Check, Truck } from 'lucide-react';

const STAGE_OPTIONS = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];
const STAGE_STYLE: Record<string, string> = {
  CREATED: 'bg-neutral-100 text-neutral-500',
  TAGGED: 'bg-blue-100 text-blue-700',
  LOADING: 'bg-amber-100 text-amber-700',
  LOADED: 'bg-indigo-100 text-indigo-700',
  UNLOADED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-600 text-white',
};

interface LoadForm { loadId: string; permitNumber: string; truckNumber: string; currentStage: string; hasFlag: boolean }
const emptyForm: LoadForm = { loadId: '', permitNumber: '', truckNumber: '', currentStage: 'CREATED', hasFlag: false };

export function PastLoadsView() {
  const { loads: loadsData, loading, refreshAll } = useSync();
  const [showForm, setShowForm] = useState(false);
  const [editingLoad, setEditingLoad] = useState<string | null>(null);
  const [form, setForm] = useState<LoadForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loads = loadsData ?? [];

  const openCreate = () => { setForm(emptyForm); setEditingLoad(null); setShowForm(true); setError(''); };
  const openEdit = (l: ActiveLoad) => {
    setForm({ loadId: l.loadId, permitNumber: l.permitNumber, truckNumber: l.truckNumber, currentStage: l.currentStage, hasFlag: l.hasFlag });
    setEditingLoad(l.loadId); setShowForm(true); setError('');
  };
  const close = () => { setShowForm(false); setEditingLoad(null); setError(''); };

  const handleSave = async () => {
    if (!editingLoad && (!form.loadId.trim() || !form.permitNumber.trim() || !form.truckNumber.trim())) {
      setError('Load ID, permit and truck number are required'); return;
    }
    setSaving(true); setError('');
    try {
      if (editingLoad) {
        await updateLoad(editingLoad, { permitNumber: form.permitNumber.trim(), truckNumber: form.truckNumber.trim(), currentStage: form.currentStage, hasFlag: form.hasFlag } as any);
      } else {
        await createLoad({ loadId: form.loadId.trim(), permitNumber: form.permitNumber.trim(), truckNumber: form.truckNumber.trim(), currentStage: form.currentStage });
      }
      close(); refreshAll();
    } catch (e: any) { setError(e.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (loadId: string) => {
    if (!confirm(`Delete load ${loadId}? This cannot be undone.`)) return;
    try { await deleteLoad(loadId); refreshAll(); } catch (e: any) { alert(e.message || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus size={16} /> Create Load
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={close}>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-neutral-900">{editingLoad ? 'Update Load' : 'Create Load'}</h3>
              <button onClick={close} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {!editingLoad && (
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Load ID *</label>
                  <input value={form.loadId} onChange={e => setForm(f => ({ ...f, loadId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="e.g. L-2024-010" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Permit Number *</label>
                <input value={form.permitNumber} onChange={e => setForm(f => ({ ...f, permitNumber: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="e.g. P-2024-001" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Truck Number *</label>
                <input value={form.truckNumber} onChange={e => setForm(f => ({ ...f, truckNumber: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="e.g. MH12AB1234" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Stage</label>
                <select value={form.currentStage} onChange={e => setForm(f => ({ ...f, currentStage: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
                  {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Flagged</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, hasFlag: !f.hasFlag }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.hasFlag ? 'bg-red-500' : 'bg-neutral-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.hasFlag ? 'translate-x-5' : ''}`} />
                </button>
                <span className={`text-xs font-medium ${form.hasFlag ? 'text-red-600' : 'text-neutral-400'}`}>{form.hasFlag ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={close} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                <Check size={16} /> {saving ? 'Saving…' : editingLoad ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-neutral-50 border-b border-neutral-100">
            {['Load ID', 'Truck', 'Permit', 'Stage', 'Flag', 'Actions'].map(h =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr>
            ) : loads.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">No loads found.</td></tr>
            ) : loads.map(l => (
              <tr key={l._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm font-mono text-neutral-900">{l.loadId}</td>
                <td className="px-6 py-4 text-sm text-neutral-600"><span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-neutral-400" />{l.truckNumber}</span></td>
                <td className="px-6 py-4 text-sm text-neutral-600">{l.permitNumber}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_STYLE[l.currentStage] || 'bg-neutral-100 text-neutral-500'}`}>{l.currentStage}</span>
                </td>
                <td className="px-6 py-4">
                  {l.hasFlag ? <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-600">Flagged</span> : <span className="text-xs text-neutral-400">—</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors" title="Edit load">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(l.loadId)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
