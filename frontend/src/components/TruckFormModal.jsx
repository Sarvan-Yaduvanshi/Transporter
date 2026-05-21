import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

export const TRUCK_STATUS_OPTIONS = ['Available', 'In-Transit', 'Loading', 'Maintenance', 'Idle'];
export const TRUCK_STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Active: 'bg-green-100 text-green-700',
  'In-Transit': 'bg-blue-100 text-blue-700',
  Loading: 'bg-amber-100 text-amber-700',
  Maintenance: 'bg-red-100 text-red-700',
  Idle: 'bg-neutral-100 text-neutral-500'
};

const emptyForm = {
  truckNumber: '',
  owner: '',
  driver: '',
  status: 'Available',
  availabilityWindow: ''
};

export function TruckFormModal({ open, onClose, initialTruck, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialTruck) {
      setForm({
        truckNumber: initialTruck.truckNumber || '',
        owner: initialTruck.owner || '',
        driver: initialTruck.driver || '',
        status: initialTruck.status || 'Available',
        availabilityWindow: initialTruck.availabilityWindow || ''
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [open, initialTruck]);

  if (!open) return null;

  const handleSave = async () => {
    const trimmedNumber = form.truckNumber.trim();
    if (!trimmedNumber) {
      setError('Truck number is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          truckNumber: trimmedNumber,
          owner: form.owner.trim(),
          driver: form.driver.trim(),
          status: form.status,
          availabilityWindow: form.availabilityWindow.trim()
        },
        initialTruck?.truckNumber
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
          <h3 className="text-lg font-bold text-neutral-900">{initialTruck ? 'Edit Truck' : 'Add Truck'}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
              Truck Number *
            </label>
            <input
              value={form.truckNumber}
              onChange={(e) => setForm((f) => ({ ...f, truckNumber: e.target.value }))}
              disabled={!!initialTruck}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-50 disabled:text-neutral-400"
              placeholder="e.g. MH12AB1234" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Owner</label>
            <input
              value={form.owner}
              onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="Owner name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Driver</label>
            <input
              value={form.driver}
              onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="Driver name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
              {TRUCK_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
              Availability Window
            </label>
            <input
              value={form.availabilityWindow}
              onChange={(e) => setForm((f) => ({ ...f, availabilityWindow: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="e.g. 6 AM – 6 PM" />
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
            <Check size={16} /> {saving ? 'Saving…' : initialTruck ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
