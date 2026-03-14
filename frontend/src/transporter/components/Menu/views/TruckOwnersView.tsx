import { useMemo } from 'react';
import { useSync } from '@/hooks/SyncContext';

export function TruckOwnersView() {
  const { trucks, loading } = useSync();

  /* Group trucks by owner field */
  const owners = useMemo(() => {
    const map = new Map<string, { name: string; trucks: number; truckNumbers: string[] }>();
    for (const t of trucks) {
      const ownerName = t.owner?.trim() || 'Unassigned';
      const existing = map.get(ownerName);
      if (existing) {
        existing.trucks += 1;
        existing.truckNumbers.push(t.truckNumber);
      } else {
        map.set(ownerName, { name: ownerName, trucks: 1, truckNumbers: [t.truckNumber] });
      }
    }
    return Array.from(map.values());
  }, [trucks]);

  if (loading) return <div className="text-sm text-neutral-400 py-8 text-center">Loading…</div>;

  if (owners.length === 0) return <div className="text-sm text-neutral-400 py-8 text-center">No truck owners found.</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {owners.map(o => (
        <div key={o.name} className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-bold text-neutral-700 mb-3">{o.name[0]}</div>
          <div className="font-semibold text-neutral-900">{o.name}</div>
          <div className="text-sm text-neutral-500 mt-1">{o.trucks} truck{o.trucks !== 1 ? 's' : ''}</div>
          <div className="text-xs text-neutral-400 mt-1 truncate" title={o.truckNumbers.join(', ')}>
            {o.truckNumbers.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}
