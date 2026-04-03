import { useState, useMemo } from 'react';
import {
  createDocument, updateDocument, deleteDocument } from

'@/services/api';
import { useSync } from '@/hooks/SyncContext';
import { Plus, Pencil, Trash2, X, Check, Filter } from 'lucide-react';

const DOC_STATUS_OPTIONS = ['Valid', 'Expired', 'Pending', 'Rejected'];
const DOC_STATUS_STYLE = {
  Valid: 'bg-green-100 text-green-700',
  Expired: 'bg-red-100 text-red-600',
  Pending: 'bg-amber-100 text-amber-700',
  Rejected: 'bg-red-100 text-red-700'
};

const PERSONAL_DOC_TYPES = ['Driving License', 'Aadhar Card', 'PAN Card', 'Medical Certificate', 'Police Verification', 'Address Proof'];
const TRUCK_DOC_TYPES = ['Registration Certificate (RC)', 'Insurance', 'Fitness Certificate', 'Pollution Certificate (PUC)', 'National Permit', 'Road Tax Receipt'];





const emptyDocForm = {
  ownerType: 'Driver', ownerId: '', docType: PERSONAL_DOC_TYPES[0],
  docNumber: '', issueDate: '', expiryDate: '', status: 'Valid', notes: ''
};

export function DocumentsView() {
  const [filterType, setFilterType] = useState('');
  const [filterId, setFilterId] = useState('');

  const { documents: allDocs, drivers, trucks, loading, refreshAll } = useSync();

  /* Client-side filtering from the synced document list */
  const docs = useMemo(() => {
    let filtered = allDocs;
    if (filterType) filtered = filtered.filter((d) => d.ownerType === filterType);
    if (filterId) filtered = filtered.filter((d) => d.ownerId === filterId);
    return filtered;
  }, [allDocs, filterType, filterId]);

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState(emptyDocForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const docTypeOptions = form.ownerType === 'Driver' ? PERSONAL_DOC_TYPES : TRUCK_DOC_TYPES;

  const openCreate = () => {setForm(emptyDocForm);setEditingDoc(null);setShowForm(true);setError('');};
  const openEdit = (d) => {
    setForm({
      ownerType: d.ownerType, ownerId: d.ownerId, docType: d.docType,
      docNumber: d.docNumber || '', issueDate: d.issueDate || '', expiryDate: d.expiryDate || '',
      status: d.status, notes: d.notes || ''
    });
    setEditingDoc(d._id);setShowForm(true);setError('');
  };
  const close = () => {setShowForm(false);setEditingDoc(null);setError('');};

  const handleSave = async () => {
    if (!form.ownerId.trim() || !form.docType.trim()) {setError('Owner and document type are required');return;}
    setSaving(true);setError('');
    try {
      if (editingDoc) {
        await updateDocument(editingDoc, { docType: form.docType, docNumber: form.docNumber, issueDate: form.issueDate, expiryDate: form.expiryDate, status: form.status, notes: form.notes });
      } else {
        await createDocument(form);
      }
      close();refreshAll();
    } catch (e) {setError(e.message || 'Failed to save');} finally
    {setSaving(false);}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {await deleteDocument(id);refreshAll();} catch (e) {alert(e.message || 'Failed to delete');}
  };

  return (
    <div>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-neutral-500">
                    <Filter size={15} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Filter</span>
                </div>
                <select value={filterType} onChange={(e) => {setFilterType(e.target.value);setFilterId('');}}
        className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                    <option value="">All Documents</option>
                    <option value="Driver">Personal (Driver)</option>
                    <option value="Truck">Truck</option>
                </select>
                {filterType === 'Driver' &&
        <select value={filterId} onChange={(e) => setFilterId(e.target.value)}
        className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                        <option value="">All Drivers</option>
                        {(drivers ?? []).map((d) => <option key={d.licenseNumber} value={d.licenseNumber}>{d.name} ({d.licenseNumber})</option>)}
                    </select>
        }
                {filterType === 'Truck' &&
        <select value={filterId} onChange={(e) => setFilterId(e.target.value)}
        className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                        <option value="">All Trucks</option>
                        {(trucks ?? []).map((t) => <option key={t.truckNumber} value={t.truckNumber}>{t.truckNumber}</option>)}
                    </select>
        }
                <div className="flex-1" />
                <button onClick={openCreate}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                    <Plus size={16} /> Add Document
                </button>
            </div>

            {/* Modal */}
            {showForm &&
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={close}>
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-neutral-900">{editingDoc ? 'Edit Document' : 'Add Document'}</h3>
                            <button onClick={close} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            {!editingDoc &&
            <>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Owner Type *</label>
                                        <select value={form.ownerType} onChange={(e) => setForm((f) => ({ ...f, ownerType: e.target.value, ownerId: '', docType: e.target.value === 'Driver' ? PERSONAL_DOC_TYPES[0] : TRUCK_DOC_TYPES[0] }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                                            <option value="Driver">Driver (Personal)</option>
                                            <option value="Truck">Truck</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
                                            {form.ownerType === 'Driver' ? 'Driver *' : 'Truck *'}
                                        </label>
                                        {form.ownerType === 'Driver' ?
                <select value={form.ownerId} onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                                                <option value="">Select a driver…</option>
                                                {(drivers ?? []).map((d) => <option key={d.licenseNumber} value={d.licenseNumber}>{d.name} ({d.licenseNumber})</option>)}
                                            </select> :

                <select value={form.ownerId} onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                                                <option value="">Select a truck…</option>
                                                {(trucks ?? []).map((t) => <option key={t.truckNumber} value={t.truckNumber}>{t.truckNumber}</option>)}
                                            </select>
                }
                                    </div>
                                </>
            }
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Document Type *</label>
                                <select value={form.docType} onChange={(e) => setForm((f) => ({ ...f, docType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                                    {docTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Document Number</label>
                                <input value={form.docNumber} onChange={(e) => setForm((f) => ({ ...f, docNumber: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="e.g. DL-1234-5678" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Issue Date</label>
                                    <input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Expiry Date</label>
                                    <input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Status</label>
                                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                                    {DOC_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none" placeholder="Optional notes…" />
                            </div>
                        </div>

                        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={close} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                                <Check size={16} /> {saving ? 'Saving…' : editingDoc ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
      }

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead><tr className="bg-neutral-50 border-b border-neutral-100">
                        {['Type', 'Owner', 'Doc Type', 'Number', 'Expiry', 'Status', 'Actions'].map((h) =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {loading ?
            <tr><td colSpan={7} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr> :
            docs.length === 0 ?
            <tr><td colSpan={7} className="px-6 py-8 text-sm text-neutral-400 text-center">No documents found.</td></tr> :
            docs.map((d) =>
            <tr key={d._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.ownerType === 'Driver' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                        {d.ownerType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{d.ownerId}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-neutral-900">{d.docType}</td>
                                <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{d.docNumber || '—'}</td>
                                <td className="px-6 py-4 text-sm text-neutral-600">{d.expiryDate || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DOC_STATUS_STYLE[d.status] || 'bg-neutral-100 text-neutral-500'}`}>{d.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors" title="Edit">
                                            <Pencil size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
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