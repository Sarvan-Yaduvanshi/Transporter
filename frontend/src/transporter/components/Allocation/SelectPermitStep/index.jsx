import { ChevronRight } from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';






export function SelectPermitStep({ onSelect }) {
  const { activePermits: permits, loading } = useSync();

  if (loading) return <div className="text-sm text-neutral-400 py-8">Loading permits…</div>;

  return (
    <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">Select Permit</h2>
            <p className="text-sm text-neutral-500 mb-5">Choose one active permit to allocate capacity for</p>
            <div className="space-y-3">
                {(permits ?? []).map((p) =>
        <button key={p.permitNumber} onClick={() => onSelect(p.permitNumber)}
        className="w-full text-left bg-neutral-50 border border-neutral-200 rounded-xl p-4 hover:bg-neutral-100 hover:border-neutral-300 transition-all flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-neutral-900">Permit {p.permitNumber}</div>
                            <div className="text-sm text-neutral-500 mt-0.5">{p.route.from} → {p.route.to} · {p.material}</div>
                            <div className="text-sm text-neutral-600 mt-1 font-medium">Remaining: {p.remainingTonnage}T</div>
                        </div>
                        <ChevronRight className="text-neutral-400 shrink-0" size={20} />
                    </button>
        )}
            </div>
        </div>);

}