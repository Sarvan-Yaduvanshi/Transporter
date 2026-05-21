import { useState } from 'react';
import { createLoad, updateLoad, deleteLoad } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';
import { LoadFormModal, LOAD_STAGE_STYLES } from '@/components/LoadFormModal';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';

export function PastLoadsView() {
  const { loads: loadsData, loading, refreshAll } = useSync();
  const [showForm, setShowForm] = useState(false);
  const [editingLoad, setEditingLoad] = useState(null);

  const loads = loadsData ?? [];

  const openCreate = () => {setEditingLoad(null);setShowForm(true);};
  const openEdit = (l) => {setEditingLoad(l);setShowForm(true);};
  const close = () => {setShowForm(false);setEditingLoad(null);};

  const handleSave = async (form, editingLoadId) => {
    if (editingLoadId) {
      await updateLoad(editingLoadId, {
        permitNumber: form.permitNumber,
        truckNumber: form.truckNumber,
        currentStage: form.currentStage,
        hasFlag: form.hasFlag
      });
    } else {
      await createLoad({
        loadId: form.loadId,
        permitNumber: form.permitNumber,
        truckNumber: form.truckNumber,
        currentStage: form.currentStage,
        hasFlag: form.hasFlag
      });
    }
    refreshAll();
  };

  const handleDelete = async (loadId) => {
    if (!confirm(`Delete load ${loadId}? This cannot be undone.`)) return;
    try {await deleteLoad(loadId);refreshAll();} catch (e) {alert(e.message || 'Failed to delete');}
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus size={16} /> Create Load
        </button>
      </div>

      <LoadFormModal
        open={showForm}
        onClose={close}
        initialLoad={editingLoad}
        onSave={handleSave} />

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-neutral-50 border-b border-neutral-100">
            {['Load ID', 'Truck', 'Permit', 'Stage', 'Flag', 'Actions'].map((h) =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ?
            <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr> :
            loads.length === 0 ?
            <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">No loads found.</td></tr> :
            loads.map((l) =>
            <tr key={l._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm font-mono text-neutral-900">{l.loadId}</td>
                <td className="px-6 py-4 text-sm text-neutral-600"><span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-neutral-400" />{l.truckNumber}</span></td>
                <td className="px-6 py-4 text-sm text-neutral-600">{l.permitNumber}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LOAD_STAGE_STYLES[l.currentStage] || 'bg-neutral-100 text-neutral-500'}`}>{l.currentStage}</span>
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
            )}
          </tbody>
        </table>
      </div>
    </div>);

}
