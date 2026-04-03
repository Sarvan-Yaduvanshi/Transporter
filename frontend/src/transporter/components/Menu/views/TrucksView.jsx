import { useState } from 'react';
import { createTruck, updateTruck, deleteTruck } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';
import { Plus, Pencil, Trash2, X, Check, Truck as TruckIcon } from 'lucide-react';

const STATUS_OPTIONS = ['Available', 'In-Transit', 'Loading', 'Maintenance', 'Idle'];
const STATUS_STYLE = {
  Available: 'bg-green-100 text-green-700',
  'In-Transit': 'bg-blue-100 text-blue-700',
  Loading: 'bg-amber-100 text-amber-700',
  Maintenance: 'bg-red-100 text-red-700',
  Idle: 'bg-neutral-100 text-neutral-500'
};


const emptyForm = { truckNumber: '', owner: '', driver: '', status: 'Available', availabilityWindow: '' };

export function TrucksView() {
  const { trucks: trucksData, loading, refreshAll } = useSync();
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const trucks = trucksData ?? [];

  const openCreate = () => {setForm(emptyForm);setEditingTruck(null);setShowForm(true);setError('');};
  const openEdit = (t) => {
    setForm({ truckNumber: t.truckNumber, owner: t.owner || '', driver: t.driver || '', status: t.status, availabilityWindow: t.availabilityWindow || '' });
    setEditingTruck(t.truckNumber);setShowForm(true);setError('');
  };
  const close = () => {setShowForm(false);setEditingTruck(null);setError('');};

  const handleSave = async () => {
    if (!form.truckNumber.trim()) {setError('Truck number is required');return;}
    setSaving(true);setError('');
    try {
      if (editingTruck) {
        await updateTruck(editingTruck, { owner: form.owner, driver: form.driver, status: form.status, availabilityWindow: form.availabilityWindow });
      } else {
        await createTruck({ truckNumber: form.truckNumber.trim(), owner: form.owner, driver: form.driver, status: form.status, availabilityWindow: form.availabilityWindow });
      }
      close();refreshAll();
    } catch (e) {setError(e.message || 'Failed to save');} finally
    {setSaving(false);}
  };

  const handleDelete = async (truckNumber) => {
    if (!confirm(`Delete truck ${truckNumber}? This cannot be undone.`)) return;
    try {await deleteTruck(truckNumber);refreshAll();} catch (e) {alert(e.message || 'Failed to delete');}
  };

  return (
    <div>
      {/* Add truck button */}
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus size={16} /> Add Truck
        </button>
      </div>

      {/* Modal Overlay */}
      {showForm &&
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={close}>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-neutral-900">{editingTruck ? 'Edit Truck' : 'Add Truck'}</h3>
              <button onClick={close} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Truck Number *</label>
                <input value={form.truckNumber} onChange={(e) => setForm((f) => ({ ...f, truckNumber: e.target.value }))} disabled={!!editingTruck}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-50 disabled:text-neutral-400"
              placeholder="e.g. MH12AB1234" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Owner</label>
                <input value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="Owner name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Driver</label>
                <input value={form.driver} onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="Driver name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Availability Window</label>
                <input value={form.availabilityWindow} onChange={(e) => setForm((f) => ({ ...f, availabilityWindow: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="e.g. 6 AM – 6 PM" />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={close} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                <Check size={16} /> {saving ? 'Saving…' : editingTruck ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-neutral-50 border-b border-neutral-100">
            {['Truck Number', 'Owner', 'Driver', 'Status', 'Actions'].map((h) =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ?
            <tr><td colSpan={5} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr> :
            trucks.length === 0 ?
            <tr><td colSpan={5} className="px-6 py-8 text-sm text-neutral-400 text-center">No trucks found. Add one to get started.</td></tr> :
            trucks.map((t) =>
            <tr key={t.truckNumber} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm font-semibold text-neutral-900"><span className="inline-flex items-center gap-1.5"><TruckIcon size={14} className="text-neutral-400" />{t.truckNumber}</span></td>
                <td className="px-6 py-4 text-sm text-neutral-600">{t.owner || '—'}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{t.driver || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[t.status] || 'bg-neutral-100 text-neutral-500'}`}>{t.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(t.truckNumber)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
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