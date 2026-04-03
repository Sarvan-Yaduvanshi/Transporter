import { useState } from 'react';
import {
  createDriver, updateDriver, deleteDriver,
  createDocument, updateDocument, deleteDocument } from

'@/services/api';
import { useSync } from '@/hooks/SyncContext';
import { Plus, Pencil, Trash2, X, Check, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

/* ── Constants ─────────────────────────────────── */
const STATUS_OPTIONS = ['Active', 'On Leave', 'Suspended', 'Inactive'];
const STATUS_STYLE = {
  Active: 'bg-green-100 text-green-700',
  'On Leave': 'bg-amber-100 text-amber-700',
  Suspended: 'bg-red-100 text-red-700',
  Inactive: 'bg-neutral-100 text-neutral-500'
};

const DOC_STATUS_OPTIONS = ['Valid', 'Expired', 'Pending', 'Rejected'];
const DOC_STATUS_STYLE = {
  Valid: 'bg-green-100 text-green-700',
  Expired: 'bg-red-100 text-red-600',
  Pending: 'bg-amber-100 text-amber-700',
  Rejected: 'bg-red-100 text-red-700'
};

const PERSONAL_DOC_TYPES = ['Driving License', 'Aadhar Card', 'PAN Card', 'Medical Certificate', 'Police Verification', 'Address Proof'];
const TRUCK_DOC_TYPES = ['Registration Certificate (RC)', 'Insurance', 'Fitness Certificate', 'Pollution Certificate (PUC)', 'National Permit', 'Road Tax Receipt'];

/* ── Form interfaces ───────────────────────────── */




const emptyDriverForm = {
  name: '', phone: '', licenseNumber: '', licenseExpiry: '',
  assignedTruck: '', status: 'Active', address: '', emergencyContact: ''
};





const emptyDocForm = (ownerType, ownerId) => ({
  ownerType, ownerId, docType: ownerType === 'Driver' ? PERSONAL_DOC_TYPES[0] : TRUCK_DOC_TYPES[0],
  docNumber: '', issueDate: '', expiryDate: '', status: 'Valid', notes: ''
});

/* ════════════════════════════════════════════════ */
export function DriversView() {
  const { drivers: driversData, loading, refreshAll } = useSync();
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState(emptyDriverForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Detail / documents view
  const [selectedDriver, setSelectedDriver] = useState(null);

  const drivers = driversData ?? [];

  /* ── Driver CRUD Handlers ────────────────────── */
  const openCreate = () => {setForm(emptyDriverForm);setEditingDriver(null);setShowForm(true);setError('');};
  const openEdit = (d) => {
    setForm({
      name: d.name, phone: d.phone, licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry || '', assignedTruck: d.assignedTruck || '',
      status: d.status, address: d.address || '', emergencyContact: d.emergencyContact || ''
    });
    setEditingDriver(d.licenseNumber);setShowForm(true);setError('');
  };
  const close = () => {setShowForm(false);setEditingDriver(null);setError('');};

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.licenseNumber.trim()) {
      setError('Name, phone and license number are required');return;
    }
    setSaving(true);setError('');
    try {
      if (editingDriver) {
        const { licenseNumber: _, ...updateData } = form;
        await updateDriver(editingDriver, updateData);
      } else {
        await createDriver(form);
      }
      close();refreshAll();
    } catch (e) {setError(e.message || 'Failed to save');} finally
    {setSaving(false);}
  };

  const handleDelete = async (licenseNumber) => {
    if (!confirm(`Delete this driver and all their documents? This cannot be undone.`)) return;
    try {await deleteDriver(licenseNumber);refreshAll();} catch (e) {alert(e.message || 'Failed to delete');}
  };

  /* ── If viewing a driver's details/documents ─── */
  if (selectedDriver) {
    return <DriverDetailView driver={selectedDriver} onBack={() => {setSelectedDriver(null);refreshAll();}} />;
  }

  /* ── Main driver list ────────────────────────── */
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {/* Modal */}
      {showForm &&
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={close}>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-neutral-900">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h3>
              <button onClick={close} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Phone *</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="+91 98765 00001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">License Number *</label>
                  <input value={form.licenseNumber} onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))} disabled={!!editingDriver}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-50 disabled:text-neutral-400" placeholder="DL12345678" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">License Expiry</label>
                  <input type="date" value={form.licenseExpiry} onChange={(e) => setForm((f) => ({ ...f, licenseExpiry: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Assigned Truck</label>
                  <input value={form.assignedTruck} onChange={(e) => setForm((f) => ({ ...f, assignedTruck: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="MH12AB1234" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="Full address" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Emergency Contact</label>
                <input value={form.emergencyContact} onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="+91 98765 00099" />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={close} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                <Check size={16} /> {saving ? 'Saving…' : editingDriver ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-neutral-50 border-b border-neutral-100">
            {['Name', 'License', 'Phone', 'Truck', 'Status', 'Actions'].map((h) =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ?
            <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr> :
            drivers.length === 0 ?
            <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">No drivers found. Add one to get started.</td></tr> :
            drivers.map((d) =>
            <tr key={d.licenseNumber} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedDriver(d)} className="text-sm font-semibold text-neutral-900 hover:underline text-left flex items-center gap-1.5">
                    {d.name} <ChevronRight size={14} className="text-neutral-400" />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{d.licenseNumber}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{d.phone}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{d.assignedTruck || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[d.status] || 'bg-neutral-100 text-neutral-500'}`}>{d.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setSelectedDriver(d)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors" title="Documents">
                      <FileText size={15} />
                    </button>
                    <button onClick={() => handleDelete(d.licenseNumber)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
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

/* ═══════════════════════════════════════════════════
   DriverDetailView — Personal & Truck Documents
   ═══════════════════════════════════════════════════ */
function DriverDetailView({ driver, onBack }) {
  const [tab, setTab] = useState('personal');

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Drivers
      </button>

      {/* Driver info card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{driver.name}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
              <span className="font-mono">{driver.licenseNumber}</span>
              <span>{driver.phone}</span>
              {driver.assignedTruck && <span>Truck: {driver.assignedTruck}</span>}
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[driver.status] || 'bg-neutral-100 text-neutral-500'}`}>{driver.status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200">
        <button onClick={() => setTab('personal')}
        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'personal' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
          Personal Documents
        </button>
        <button onClick={() => setTab('truck')}
        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'truck' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
          Truck Documents
        </button>
      </div>

      {tab === 'personal' ?
      <DocumentsPanel
        ownerType="Driver"
        ownerId={driver.licenseNumber}
        docTypeOptions={PERSONAL_DOC_TYPES} /> :


      <DocumentsPanel
        ownerType="Truck"
        ownerId={driver.assignedTruck || driver.licenseNumber}
        docTypeOptions={TRUCK_DOC_TYPES}
        truckLabel={driver.assignedTruck} />

      }
    </div>);

}

/* ═══════════════════════════════════════════════════
   DocumentsPanel — reusable doc CRUD for Driver / Truck
   ═══════════════════════════════════════════════════ */
function DocumentsPanel({ ownerType, ownerId, docTypeOptions, truckLabel

}) {
  const { documents: allDocs, loading, refreshAll } = useSync();
  const docs = allDocs.filter((d) => d.ownerType === ownerType && d.ownerId === ownerId);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState(emptyDocForm(ownerType, ownerId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => {setForm(emptyDocForm(ownerType, ownerId));setEditingDoc(null);setShowForm(true);setError('');};
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
    if (!form.docType.trim()) {setError('Document type is required');return;}
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
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-neutral-500">
          {ownerType === 'Truck' && truckLabel ?
          `Documents for truck ${truckLabel}` :
          `Personal documents`}
        </div>
        <button onClick={openCreate}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus size={16} /> Add Document
        </button>
      </div>

      {/* Doc Modal */}
      {showForm &&
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={close}>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-neutral-900">{editingDoc ? 'Edit Document' : 'Add Document'}</h3>
              <button onClick={close} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Document Type *</label>
                <select value={form.docType} onChange={(e) => setForm((f) => ({ ...f, docType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
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
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-white">
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

      {/* Documents table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-neutral-50 border-b border-neutral-100">
            {['Document Type', 'Number', 'Issue Date', 'Expiry Date', 'Status', 'Actions'].map((h) =>
              <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ?
            <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr> :
            docs.length === 0 ?
            <tr><td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">No documents yet. Add one to get started.</td></tr> :
            docs.map((d) =>
            <tr key={d._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm font-semibold text-neutral-900">{d.docType}</td>
                <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{d.docNumber || '—'}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{d.issueDate || '—'}</td>
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