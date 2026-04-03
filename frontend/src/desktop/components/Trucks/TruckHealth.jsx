import { ArrowLeft, Truck, Shield, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

import { useSync } from '@/hooks/SyncContext';






/* Map document status to a display status including "Expiring Soon" */
function docHealthStatus(doc) {
  if (doc.status === 'Expired' || doc.status === 'Rejected') return doc.status;
  if (doc.expiryDate) {
    const daysLeft = Math.round((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000);
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft <= 30) return 'Expiring Soon';
  }
  return doc.status; // 'Valid' | 'Pending'
}

export function TruckHealth({ truckNumber, onBack }) {
  const { trucks, documents: allDocs } = useSync();
  const truck = trucks.find((t) => t.truckNumber === truckNumber) ?? null;
  const loading = !truck;

  /* Filter documents for this truck from the synced document list */
  const docs = allDocs.filter((d) => d.ownerType === 'Truck' && d.ownerId === truckNumber);
  const docsLoading = false; // documents come from sync, no separate loading

  return (
    <div className="p-8 max-w-5xl mx-auto">
            <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        
                <ArrowLeft size={16} /> Back to Trucks
            </button>

            {/* Truck header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                        <Truck size={24} className="text-neutral-400" />
                        {truckNumber}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {loading ?
            'Loading\u2026' :
            `Owner: ${truck.owner || '\u2014'} \u00b7 Driver: ${truck.driver || '\u2014'} \u00b7 Status: ${truck.status}`}
                    </p>
                </div>
                {truck &&
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-semibold ${truck.status === 'Available' ?
          'bg-green-100 text-green-700' :
          'bg-neutral-100 text-neutral-600'}`
          }>
          
                        {truck.status}
                    </span>
        }
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Health overview — from real documents */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Health Status</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Compliance & maintenance</p>
                    </div>
                    <div className="p-4 space-y-3">
                        {docsLoading ?
            <div className="text-sm text-neutral-400 py-4 text-center">Loading documents\u2026</div> :
            docs.length === 0 ?
            <div className="text-sm text-neutral-400 py-4 text-center">No documents found for this truck</div> :

            docs.map((doc) => {
              const healthStatus = docHealthStatus(doc);
              const isGood = healthStatus === 'Valid';
              const isWarning = healthStatus === 'Expiring Soon' || healthStatus === 'Pending';
              const isBad = healthStatus === 'Expired' || healthStatus === 'Rejected';
              const Icon = isBad ? AlertCircle : isWarning ? AlertCircle : Shield;
              return (
                <div
                  key={doc._id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${isWarning ?
                  'bg-amber-50 border-amber-200' :
                  isGood ?
                  'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'}`
                  }>
                  
                                        <Icon
                    size={16}
                    className={
                    isWarning ?
                    'text-amber-500' :
                    isGood ?
                    'text-green-600' :
                    'text-red-500'
                    } />
                  
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-neutral-800">{doc.docType}</div>
                                            <div className="text-xs text-neutral-500">
                                                {doc.expiryDate ? `Expiry: ${doc.expiryDate}` : doc.docNumber || 'No expiry set'}
                                            </div>
                                        </div>
                                        <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isWarning ?
                    'bg-amber-100 text-amber-700' :
                    isGood ?
                    'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-600'}`
                    }>
                    
                                            {healthStatus}
                                        </span>
                                    </div>);

            })
            }
                    </div>
                </div>

                {/* Documents repository — from real documents */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Document Repository</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Uploaded documents & verification</p>
                    </div>
                    <div className="p-4 space-y-2">
                        {docsLoading ?
            <div className="text-sm text-neutral-400 py-4 text-center">Loading\u2026</div> :
            docs.length === 0 ?
            <div className="text-sm text-neutral-400 py-4 text-center">No documents uploaded yet</div> :

            docs.map((doc) =>
            <div
              key={doc._id}
              className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              
                                    <FileText size={16} className="text-neutral-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-neutral-800 truncate">{doc.docType}</div>
                                        <div className="text-xs text-neutral-400">
                                            {doc.issueDate ? `Issued: ${doc.issueDate}` : `Number: ${doc.docNumber || '\u2014'}`}
                                        </div>
                                    </div>
                                    {doc.status === 'Valid' ?
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                            <CheckCircle size={12} /> Valid
                                        </span> :
              doc.status === 'Pending' ?
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                                            <Clock size={12} /> Pending
                                        </span> :

              <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                                            <AlertCircle size={12} /> {doc.status}
                                        </span>
              }
                                </div>
            )
            }
                    </div>
                </div>
            </div>

            {/* Truck info card */}
            {truck &&
      <div className="mt-6 bg-white border border-neutral-200 rounded-xl p-5">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-4">
                        Vehicle Details
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
          { label: 'Truck Number', value: truck.truckNumber },
          { label: 'Owner', value: truck.owner || '\u2014' },
          { label: 'Driver', value: truck.driver || '\u2014' },
          { label: 'Availability', value: truck.availabilityWindow || '\u2014' }].
          map((item) =>
          <div key={item.label}>
                                <div className="text-xs text-neutral-500 font-medium">{item.label}</div>
                                <div className="text-sm font-semibold text-neutral-900 mt-0.5">{item.value}</div>
                            </div>
          )}
                    </div>
                </div>
      }
        </div>);

}