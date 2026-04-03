import { Truck } from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';





export function PermitSidebar({ selectedPermit, step, taggedTrucks }) {
  // Permits are kept fresh by the shared sync context
  const { activePermits: permits } = useSync();

  return (
    <div className="space-y-4">
      {selectedPermit && step !== 'select-permit' &&
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Selected Permit</div>
          {(() => {
          const p = (permits ?? []).find((p) => p.permitNumber === selectedPermit);
          return p ?
          <div className="space-y-2">
                <div className="text-sm font-bold text-neutral-900">{p.permitNumber}</div>
                <div className="text-xs text-neutral-500">{p.route.from} → {p.route.to}</div>
                <div className="text-xs text-neutral-500">{p.material}</div>
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <div className="text-xs text-neutral-400">Remaining</div>
                  <div className="text-lg font-bold text-neutral-900">{p.remainingTonnage}T</div>
                </div>
              </div> :
          null;
        })()}
        </div>
      }
      {taggedTrucks.length > 0 &&
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Tagged ({taggedTrucks.length})</div>
          <div className="space-y-1">
            {taggedTrucks.map((t) =>
          <div key={t} className="text-xs text-neutral-700 bg-white border border-neutral-200 rounded px-2.5 py-1.5 font-medium flex items-center gap-1.5"><Truck size={12} className="text-neutral-400" />{t}</div>
          )}
          </div>
        </div>
      }
    </div>);

}