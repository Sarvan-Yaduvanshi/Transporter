import { useState, useMemo } from 'react';
import { Search, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { StatCard } from './StatCard';
import { SectionPanel } from './SectionPanel';
import { TruckRow } from './TruckRow';
import { AlertBanner } from './AlertBanner';






function formatINR(n) {
  return n.toLocaleString('en-IN');
}

export function Home({ onNavigateToPermit, onNavigateToPayments }) {
  const [search, setSearch] = useState('');
  const {
    permits,
    loads,
    trucks,
    flags,
    mines,
    loadingTrucks,
    tagsByPermit,
    stats,
    loading,
    lastUpdated
  } = useSync();

  /* ── Compute real-time stats ────── */
  const liveStats = useMemo(() => {
    const activeLoads = loads.filter((l) =>
    ['LOADING', 'LOADED', 'TAGGED'].includes(l.currentStage)
    );

    const completedLoads = loads.filter((l) =>
    ['COMPLETED', 'UNLOADED'].includes(l.currentStage)
    );

    const flaggedLoads = loads.filter((l) => l.hasFlag);

    const loadingLoads = loads.filter((l) =>
    ['LOADING', 'LOADED'].includes(l.currentStage)
    );

    const activeFlags = flags.filter((f) => f.status === 'Under Review');

    const paymentPermits = permits.filter((p) =>
    ['Ready', 'Pending Approval', 'Dispute'].includes(p.paymentStatus ?? '')
    );

    const totalRevenue = permits.reduce(
      (s, p) => s + (p.paymentSummary?.totalAmount ?? 0),
      0
    );

    const clearedRevenue = permits.
    filter((p) => p.paymentStatus === 'Cleared').
    reduce((s, p) => s + (p.paymentSummary?.totalAmount ?? 0), 0);

    const activeTrucks = trucks.filter(
      (t) => t.status === 'Active' || t.status === 'Available'
    );

    const maintenanceTrucks = trucks.filter(
      (t) => t.status === 'Maintenance'
    );

    return {
      totalLoading: loadingLoads.length,
      totalActive: activeLoads.length,
      totalCompleted: completedLoads.length,
      totalFlagged: flaggedLoads.length,
      activeFlags: activeFlags.length,
      permitsReadyForPayment: paymentPermits.length,
      totalTrucks: trucks.length,
      activeTrucks: activeTrucks.length,
      maintenanceTrucks: maintenanceTrucks.length,
      totalRevenue,
      clearedRevenue
    };
  }, [permits, loads, trucks, flags]);

  const activeFlags = useMemo(
    () => flags.filter((f) => f.status === 'Under Review'),
    [flags]
  );

  const q = search.toLowerCase();

  if (loading && !stats) {
    return <div className="p-8 text-sm text-neutral-400">Loading dashboard…</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Live Operations
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time visibility across all active permits
            {lastUpdated &&
            <span className="ml-2 text-xs text-neutral-400">
                · Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            }
          </p>
        </div>

        <div className="relative w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={16} />
          
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search truck / owner / permit..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400" />
          
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Trucks"
          value={liveStats.totalTrucks.toString()}
          sub={`${liveStats.activeTrucks} active · ${liveStats.maintenanceTrucks} maintenance`} />
        
        <StatCard
          label="Active Loads"
          value={liveStats.totalActive.toString()}
          sub={`${liveStats.totalLoading} loading · ${liveStats.totalCompleted} completed`} />
        
        <StatCard
          label="Revenue"
          value={`₹${formatINR(liveStats.totalRevenue)}`}
          sub={`₹${formatINR(liveStats.clearedRevenue)} cleared`}
          dotColor="bg-green-400" />
        
        <StatCard
          label="Flags / Disputes"
          value={liveStats.activeFlags.toString()}
          sub={`${liveStats.totalFlagged} flagged loads`}
          dotColor="bg-red-500" />
        
      </div>

      {/* Alert banners */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <AlertBanner
          icon={<TrendingUp size={18} className="text-neutral-500" />}
          title="Permits ready for payment"
          subtitle={`${liveStats.permitsReadyForPayment} permit${liveStats.permitsReadyForPayment !== 1 ? 's' : ''} completed, awaiting clearance`}
          badgeCount={liveStats.permitsReadyForPayment.toString()}
          onClick={onNavigateToPayments} />
        
        <AlertBanner
          icon={<AlertCircle size={18} className="text-red-500" />}
          title="Active disputes / flags"
          subtitle={`${liveStats.activeFlags} unresolved — requires review`}
          badgeCount={liveStats.activeFlags.toString()}
          variant="danger"
          onClick={() => {
            const flaggedPermit =
            activeFlags[0]?.permitNumber ||
            Object.keys(loadingTrucks)[0] ||
            Object.keys(tagsByPermit)[0];

            if (flaggedPermit) onNavigateToPermit(flaggedPermit);
          }} />
        
      </div>

      {/* 3-column grid — Operational panels */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        {/* LOADING */}
        <SectionPanel
          title="LOADING"
          subtitle={`${liveStats.totalLoading} trucks actively loading`}>
          
          {Object.entries(loadingTrucks).
          filter(([permit, lts]) =>
          q === '' ||
          lts.some((t) => t.truckNumber.toLowerCase().includes(q)) ||
          permit.toLowerCase().includes(q)
          ).
          map(([permit, lts]) =>
          <div key={permit} className="mb-4">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">
                  Permit {permit}
                </div>
                {lts.map((truck) =>
            <TruckRow
              key={truck.id}
              truckNumber={truck.truckNumber}
              permit={permit}
              onClick={() => onNavigateToPermit(permit)} />

            )}
              </div>
          )}

          {Object.keys(loadingTrucks).length === 0 &&
          <div className="text-xs text-neutral-400 text-center py-4">
              No trucks loading
            </div>
          }
        </SectionPanel>

        {/* TAGS */}
        <SectionPanel
          title="TAGS"
          subtitle={`${Object.values(tagsByPermit).flat().length} active tags`}>
          
          {Object.entries(tagsByPermit).
          filter(([permit, tgs]) =>
          q === '' ||
          tgs.some((t) => t.truckNumber.toLowerCase().includes(q)) ||
          permit.toLowerCase().includes(q)
          ).
          map(([permit, tgs]) =>
          <div key={permit} className="mb-4">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">
                  Permit {permit}
                </div>
                {tgs.map((tag) =>
            <TruckRow
              key={tag.id}
              truckNumber={tag.truckNumber}
              permit={permit}
              badge={tag.status}
              onClick={() => onNavigateToPermit(permit)} />

            )}
              </div>
          )}

          {Object.keys(tagsByPermit).length === 0 &&
          <div className="text-xs text-neutral-400 text-center py-4">
              No active tags
            </div>
          }
        </SectionPanel>

        {/* MINES / ROUTES */}
        <SectionPanel
          title="MINES / ROUTES"
          subtitle={`${mines.length} mine${mines.length !== 1 ? 's' : ''} with active coverage`}>
          
          {mines.map((mine) =>
          <div key={mine._id} className="mb-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-2">
                <div className="text-sm font-semibold text-neutral-800">
                  {mine.name}
                </div>
              </div>

              {mine.routes.map((route) =>
            <button
              key={route._id}
              onClick={() => onNavigateToPermit(route.permitNumber)}
              className="w-full text-left bg-white border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 hover:border-neutral-300 transition-all mb-2 flex justify-between items-start">
              
                  <div>
                    <div className="text-sm font-medium text-neutral-800">
                      {route.from} → {route.to}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {route.activeTrucks} active trucks
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-neutral-400 mt-0.5 shrink-0" />
                </button>
            )}
            </div>
          )}

          {mines.length === 0 &&
          <div className="text-xs text-neutral-400 text-center py-4">
              No mines configured
            </div>
          }
        </SectionPanel>

      </div>

    </div>);

}