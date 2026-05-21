import { useState } from 'react';
import { createTruck, updateTruck, deleteTruck } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';
import { TruckFormModal, TRUCK_STATUS_STYLES } from '@/components/TruckFormModal';
import { Plus, Pencil, Trash2, Truck as TruckIcon } from 'lucide-react';

export function TrucksView() {
  const { trucks: trucksData, loading, refreshAll } = useSync();
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);

  const trucks = trucksData ?? [];

  const openCreate = () => {setEditingTruck(null);setShowForm(true);};
  const openEdit = (t) => {setEditingTruck(t);setShowForm(true);};
  const close = () => {setShowForm(false);setEditingTruck(null);};

  const handleSave = async (form, editingTruckNumber) => {
    if (editingTruckNumber) {
      await updateTruck(editingTruckNumber, {
        owner: form.owner,
        driver: form.driver,
        status: form.status,
        availabilityWindow: form.availabilityWindow
      });
    } else {
      await createTruck({
        truckNumber: form.truckNumber,
        owner: form.owner,
        driver: form.driver,
        status: form.status,
        availabilityWindow: form.availabilityWindow
      });
    }
    refreshAll();
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

      <TruckFormModal
        open={showForm}
        onClose={close}
        initialTruck={editingTruck}
        onSave={handleSave} />

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
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TRUCK_STATUS_STYLES[t.status] || 'bg-neutral-100 text-neutral-500'}`}>{t.status}</span>
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
