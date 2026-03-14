import { useState } from 'react';
import { Check, Truck as TruckIcon } from 'lucide-react';
import { createTag } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';
interface TagTrucksStepProps {
  permitNumber: string;
  capacity: number;
  tagged: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}
export function TagTrucksStep({ permitNumber, capacity, tagged, onToggle, onNext, onBack }: TagTrucksStepProps) {
  const { approvedTrucks: trucks, loading, refreshAll } = useSync();
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="text-sm text-neutral-400 py-8">Loading trucks…</div>;

  const handleIssue = async () => {
    setIssuing(true); setError('');
    try {
      await Promise.all(tagged.map(truckNumber => createTag({ permitNumber, truckNumber })));
      await refreshAll();
      onNext();
    } catch (e: any) { setError(e.message || 'Failed to create tags'); }
    finally { setIssuing(false); }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Tag Trucks</h2>
      <p className="text-sm text-neutral-500 mb-2">Select pre-approved trucks · {tagged.length}/{capacity} slots filled</p>
      <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-5">
        <div className="bg-neutral-900 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (tagged.length / capacity) * 100)}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {(trucks ?? []).length === 0 && (
          <p className="col-span-2 text-sm text-neutral-400 py-4">No approved trucks available. Seed the database or add trucks with status "Available".</p>
        )}
        {(trucks ?? []).map(truck => (
          <button key={truck.truckNumber} onClick={() => onToggle(truck.truckNumber)}
            className={`text-left border rounded-xl p-3.5 transition-all ${tagged.includes(truck.truckNumber) ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
              }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-semibold text-sm flex items-center gap-1.5 ${tagged.includes(truck.truckNumber) ? 'text-white' : 'text-neutral-900'}`}><TruckIcon size={14} className={tagged.includes(truck.truckNumber) ? 'text-neutral-300' : 'text-neutral-400'} />{truck.truckNumber}</div>
                <div className={`text-xs mt-0.5 ${tagged.includes(truck.truckNumber) ? 'text-neutral-300' : 'text-neutral-500'}`}>{truck.availabilityWindow}</div>
              </div>
              {tagged.includes(truck.truckNumber) && <Check size={16} className="text-white shrink-0" />}
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Back</button>
        <button onClick={handleIssue} disabled={tagged.length === 0 || issuing}
          className="px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium disabled:bg-neutral-300 disabled:text-neutral-400 hover:bg-neutral-800 transition-colors">
          {issuing ? 'Issuing…' : 'Issue DO & QR'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
