import { Bell, Truck, ChevronRight } from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { useAuth } from '@/hooks/useAuth';
import type { ActiveLoad } from '@/services/api';
import { ActivityCard } from './ActivityCard';
import { StatCard } from './StatCard';

interface DashboardProps {
    onViewLoad: (loadId: string) => void;
    onViewPermit: (permitNumber: string) => void;
}

/* helper: group loads by permitNumber */
function groupByPermit(loads: ActiveLoad[]): Record<string, ActiveLoad[]> {
    return loads.reduce<Record<string, ActiveLoad[]>>((acc, l) => {
        (acc[l.permitNumber] ??= []).push(l);
        return acc;
    }, {});
}

export function Dashboard({ onViewLoad, onViewPermit }: DashboardProps) {
    const { stats, loads: allLoads, permits: allPermits, loading, lastUpdated } = useSync();
    const { user } = useAuth();

    /* Greeting (IST based) */
    const istHour = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    ).getHours();

    const timeGreeting =
        istHour < 12 ? 'Good Morning' :
            istHour < 17 ? 'Good Afternoon' :
                'Good Evening';

    const firstName = user?.name?.split(' ')[0] || 'there';
    const greeting = `${timeGreeting} ${firstName}`;

    if (loading || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">
                Loading dashboard…
            </div>
        );
    }

    /* Fleet stats */
    const totalTrucks = stats.totalTrucks;
    const onLoad = stats.onLoad;
    const idle = stats.idle;
    const maintenance = stats.maintenance;

    /* Filters */
    const activeLoads = allLoads.filter(l =>
        ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED'].includes(l.currentStage)
    );

    const completedLoads = allLoads.filter(l =>
        ['COMPLETED', 'UNLOADED'].includes(l.currentStage)
    );

    const flaggedLoads = allLoads.filter(l => l.hasFlag);

    const activeByPermit = groupByPermit(activeLoads);
    const completedByPermit = groupByPermit(completedLoads);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-8 max-w-7xl mx-auto">

                {/* ───────────────── HEADER ───────────────── */}


                {/* ───────────────── STATS ───────────────── */}
                <div className="grid grid-cols-4 gap-5 mb-10">
                    {[
                        <ActivityCard />, // Example usage of ActivityCard
                        { value: totalTrucks, label: 'Total Trucks', sub: 'in fleet' },
                        { value: onLoad, label: 'On Load', sub: 'currently active' },
                        { value: idle > 0 ? idle : 0, label: 'Idle', sub: 'available' },
                        { value: maintenance, label: 'Maintenance', sub: 'under service' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                {stat.label}
                            </div>

                            <div className="text-3xl font-bold text-neutral-900 mt-2">
                                {stat.value}
                            </div>

                            <div className="text-xs text-neutral-400 mt-1">
                                {stat.sub}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ───────────────── 3 COLUMN GRID ───────────────── */}
                <div className="grid grid-cols-3 gap-6">

                    {/* ACTIVE LOADS */}
                    <Panel
                        title="Active Loads"
                        subtitle="Currently loading & in-transit"
                    >
                        {Object.keys(activeByPermit).length === 0 && (
                            <EmptyState text="No active loads" />
                        )}

                        {Object.entries(activeByPermit).map(([permit, loads]) => (
                            <div key={permit} className="mb-4">
                                <SectionLabel label={`Permit ${permit}`} />

                                {loads.map(load => (
                                    <LoadCard
                                        key={load._id}
                                        truck={load.truckNumber}
                                        permit={load.permitNumber}
                                        onClick={() => onViewLoad(load.loadId)}
                                    />
                                ))}
                            </div>
                        ))}
                    </Panel>

                    {/* COMPLETED */}
                    <Panel
                        title="Completed"
                        subtitle="Delivered loads"
                    >
                        {Object.keys(completedByPermit).length === 0 && (
                            <EmptyState text="No completed loads" />
                        )}

                        {Object.entries(completedByPermit).map(([permit, loads]) => (
                            <div key={permit} className="mb-4">
                                <SectionLabel label={`Permit ${permit}`} />

                                {loads.map(load => (
                                    <LoadCard
                                        key={load._id}
                                        truck={load.truckNumber}
                                        permit={load.permitNumber}
                                        done
                                        onClick={() => onViewLoad(load.loadId)}
                                    />
                                ))}
                            </div>
                        ))}
                    </Panel>

                    {/* PERMITS / FLAGGED */}
                    <Panel
                        title="Permits / Flagged"
                        subtitle="Permit overview & flagged loads"
                    >
                        {flaggedLoads.length > 0 && (
                            <>
                                <SectionLabel label="Flagged" red />

                                {flaggedLoads.map(load => (
                                    <LoadCard
                                        key={load._id}
                                        truck={load.truckNumber}
                                        permit={load.permitNumber}
                                        flagged
                                        onClick={() => onViewLoad(load.loadId)}
                                    />
                                ))}
                            </>
                        )}

                        {allPermits.map(permit => (
                            <button
                                key={permit.permitNumber}
                                onClick={() => onViewPermit(permit.permitNumber)}
                                className="w-full text-left bg-neutral-50 border border-neutral-200 rounded-xl p-4 hover:bg-neutral-100 transition-all mb-2 flex justify-between items-center"
                            >
                                <div>
                                    <div className="text-sm font-semibold text-neutral-800">
                                        {permit.permitNumber}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {permit.route.from} → {permit.route.to}
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-neutral-400" />
                            </button>
                        ))}
                    </Panel>

                </div>
            </div>
        </div>
    );
}

/* ─────────── Small Reusable Components ─────────── */

function Panel({ title, subtitle, children }: any) {
    return (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">
                    {title}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function LoadCard({ truck, permit, onClick, done, flagged }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left border rounded-xl p-3 transition-all mb-2 flex items-center gap-3
                ${flagged
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : done
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}
        >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Truck size={16} className="text-neutral-600" />
            </div>

            <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-800">
                    Truck {truck}
                </div>
                <div className="text-xs text-neutral-500">
                    Permit {permit}
                </div>
            </div>

            {done && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Done
                </span>
            )}

            {flagged && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Flag
                </span>
            )}
        </button>
    );
}

function SectionLabel({ label, red }: any) {
    return (
        <div className={`text-xs font-semibold uppercase tracking-wide mb-2 px-1 
            ${red ? 'text-red-400' : 'text-neutral-400'}`}>
            {label}
        </div>
    );
}

function EmptyState({ text }: any) {
    return (
        <div className="text-sm text-neutral-400 text-center py-8">
            {text}
        </div>
    );
}