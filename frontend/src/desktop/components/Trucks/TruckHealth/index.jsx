import { ArrowLeft } from 'lucide-react';

import { useSync } from '@/hooks/SyncContext';






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
                {/* ...rest of the code... */}
            </div>
        </div>);

}