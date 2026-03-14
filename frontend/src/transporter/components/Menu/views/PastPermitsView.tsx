import { useSync } from '@/hooks/SyncContext';
import type { PermitFull } from '@/services/api';

interface PastPermitsViewProps {
  onNavigateToPermit: (pn: string) => void;
}

export function PastPermitsView({ onNavigateToPermit }: PastPermitsViewProps) {
  const { permits: permitsData, loading } = useSync();
  const permits = (permitsData ?? []).map(p => ({
    permitNumber: p.permitNumber,
    route: `${p.route.from} → ${p.route.to}`,
    status: p.status,
    date: (p as any).createdAt ? new Date((p as any).createdAt).toISOString().slice(0, 10) : '—',
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead><tr className="bg-neutral-50 border-b border-neutral-100">
          {['Permit', 'Route', 'Date', 'Status'].map(h => <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-6 py-3">{h}</th>)}
        </tr></thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="px-6 py-8 text-sm text-neutral-400 text-center">Loading…</td></tr>
          ) : permits.map(p => (
            <tr key={p.permitNumber} onClick={() => onNavigateToPermit(p.permitNumber)}
              className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer">
              <td className="px-6 py-4 text-sm font-semibold text-neutral-900">{p.permitNumber}</td>
              <td className="px-6 py-4 text-sm text-neutral-600">{p.route}</td>
              <td className="px-6 py-4 text-sm text-neutral-500">{p.date}</td>
              <td className="px-6 py-4"><span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full font-medium">{p.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
