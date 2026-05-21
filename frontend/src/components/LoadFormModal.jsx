import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

export const LOAD_STAGE_OPTIONS = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];
export const LOAD_STAGE_STYLES = {
  CREATED: 'bg-neutral-100 text-neutral-500',
  TAGGED: 'bg-blue-100 text-blue-700',
  LOADING: 'bg-amber-100 text-amber-700',
  LOADED: 'bg-indigo-100 text-indigo-700',
  UNLOADED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-600 text-white'
};

const emptyForm = {
  loadId: '',
  permitNumber: '',
  truckNumber: '',
  currentStage: 'CREATED',
  hasFlag: false
};

export function LoadFormModal({ open, onClose, initialLoad, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialLoad) {
      setForm({
        loadId: initialLoad.loadId || '',
        permitNumber: initialLoad.permitNumber || '',
        truckNumber: initialLoad.truckNumber || '',
        currentStage: initialLoad.currentStage || 'CREATED',
        hasFlag: Boolean(initialLoad.hasFlag)
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [open, initialLoad]);

  if (!open) return null;

  const handleSave = async () => {
    const trimmedLoadId = form.loadId.trim();
    const trimmedPermit = form.permitNumber.trim();
    const trimmedTruck = form.truckNumber.trim();
    if (!initialLoad && (!trimmedLoadId || !trimmedPermit || !trimmedTruck)) {
      setError('Load ID, permit and truck number are required');
      return;
    }
    if (initialLoad && (!trimmedPermit || !trimmedTruck)) {
      setError('Permit and truck number are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          loadId: trimmedLoadId,
          permitNumber: trimmedPermit,
          truckNumber: trimmedTruck,
          currentStage: form.currentStage,
          hasFlag: form.hasFlag
        },
        initialLoad?.loadId
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-neutral-900">{initialLoad ? 'Update Load' : 'Create Load'}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!initialLoad && (
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Load ID *</label>
              <input
                value={form.loadId}
                onChange={(e) => setForm((f) => ({ ...f, loadId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                placeholder="e.g. L-2024-010" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Permit Number *</label>
            <input
              value={form.permitNumber}
              onChange={(e) => setForm((f) => ({ ...f, permitNumber: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="e.g. P-2024-001" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Truck Number *</label>
            <input
              value={form.truckNumber}
              onChange={(e) => setForm((f) => ({ ...f, truckNumber: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="e.g. MH12AB1234" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Stage</label>
            <select
              value={form.currentStage}
              onChange={(e) => setForm((f) => ({ ...f, currentStage: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
              {LOAD_STAGE_OPTIONS.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Flagged</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, hasFlag: !f.hasFlag }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.hasFlag ? 'bg-red-500' : 'bg-neutral-300'}`}>
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.hasFlag ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-xs font-medium ${form.hasFlag ? 'text-red-600' : 'text-neutral-400'}`}>
              {form.hasFlag ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors">
            <Check size={16} /> {saving ? 'Saving…' : initialLoad ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
