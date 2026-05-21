import { ChevronRight, Plus, Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSync } from '@/hooks/SyncContext';
import { createTruck, updateTruck, deleteTruck } from '@/services/api';
import { TruckFormModal, TRUCK_STATUS_STYLES } from '@/components/TruckFormModal';






export function TruckList({ onViewTruck }) {
  const [search, setSearch] = useState('');
  const { trucks: trucksData, loading, refreshAll } = useSync();
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);

  const rawTrucks = trucksData ?? [];
  const trucks = rawTrucks.map((t) => ({
    number: t.truckNumber,
    owner: t.owner || '—',
    driver: t.driver || '—',
    status: t.status === 'Available' ? 'Active' : t.status,
    availability: t.availabilityWindow || '—',
    raw: t
  }));

  const filtered = search ?
    trucks.filter(
      (t) =>
        t.number.toLowerCase().includes(search.toLowerCase()) ||
        t.owner.toLowerCase().includes(search.toLowerCase())
    ) :
    trucks;

  const openCreate = () => {setEditingTruck(null);setShowForm(true);};
  const openEdit = (truck) => {setEditingTruck(truck);setShowForm(true);};
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
    try {
      await deleteTruck(truckNumber);
      refreshAll();
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Trucks</h1>
                    <p className="text-sm text-neutral-500 mt-1">Fleet overview — click truck number for health &amp; documents</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search by truck number or owner…"
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400" />
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                        <Plus size={16} /> Add Truck
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Fleet', value: trucks.length, bg: 'bg-neutral-50 border-neutral-200', color: 'text-neutral-900' },
                    { label: 'Active', value: trucks.filter((t) => t.status === 'Active').length, bg: 'bg-green-50 border-green-100', color: 'text-green-700' },
                    { label: 'Other Status', value: trucks.filter((t) => t.status !== 'Active').length, bg: 'bg-amber-50 border-amber-100', color: 'text-amber-700' }
                ].map((s) =>
        <div key={s.label} className={`border rounded-xl p-5 ${s.bg}`}>
                        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{s.label}</div>
                        <div className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</div>
                    </div>
        )}
            </div>

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                            {['Truck Number', 'Owner', 'Driver', 'Status', 'Availability', 'Actions'].map((h) =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">
                                    {h}
                                </th>
              )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ?
            <tr>
                                <td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td>
                            </tr> :
            filtered.length === 0 ?
            <tr>
                                <td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">No trucks found</td>
                            </tr> :

            filtered.map((t) =>
            <tr
              key={t.number}
              onClick={() => onViewTruck(t.number)}
              className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer transition-colors">
               
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900 transition-colors">
                                            {t.number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">{t.owner}</td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">{t.driver}</td>
                                    <td className="px-6 py-4">
                                        <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${TRUCK_STATUS_STYLES[t.status] || 'bg-neutral-100 text-neutral-500'}`}>
                    
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-500">{t.availability}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={(e) => {e.stopPropagation();openEdit(t.raw);}}
                                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                                                title="Edit">
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={(e) => {e.stopPropagation();handleDelete(t.number);}}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                                                title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                            <ChevronRight size={16} className="text-neutral-400" />
                                        </div>
                                    </td>
                                </tr>
            )
            }
                    </tbody>
                </table>
            </div>
            <TruckFormModal
                open={showForm}
                onClose={close}
                initialTruck={editingTruck}
                onSave={handleSave} />
        </div>);

}
