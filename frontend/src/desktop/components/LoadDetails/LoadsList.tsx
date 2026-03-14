import { useState, useMemo } from 'react';
import {
    ChevronRight, Search, AlertTriangle, Truck,
    Package, ArrowRight, Loader2, ArrowDownToLine, Banknote,
    MapPin, Hash, ArrowUpRight,
} from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { updateLoad } from '@/services/api';

interface LoadsListProps {
    onViewLoad: (loadId: string) => void;
    onViewInvoice: (permitNumber: string) => void;
}

/* ── User-facing 4-step flow ─────────── */
const FLOW_STEPS = ['IN_TRANSIT', 'LOADING', 'UNLOADING', 'PAYMENT'] as const;
type FlowStep = typeof FLOW_STEPS[number];

const FLOW_META: Record<FlowStep, { label: string; color: string; bg: string; border: string; icon: any; bgCard: string; accent: string; btnBg: string; btnHover: string; hoverBorder: string }> = {
    IN_TRANSIT: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Truck, bgCard: 'from-blue-50 to-white', accent: 'bg-blue-500', btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20', btnHover: 'hover:border-blue-300 hover:bg-blue-50/50', hoverBorder: 'hover:border-blue-200' },
    LOADING: { label: 'Loading', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ArrowDownToLine, bgCard: 'from-amber-50 to-white', accent: 'bg-amber-500', btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20', btnHover: 'hover:border-amber-300 hover:bg-amber-50/50', hoverBorder: 'hover:border-amber-200' },
    UNLOADING: { label: 'Unloading', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: Package, bgCard: 'from-violet-50 to-white', accent: 'bg-violet-500', btnBg: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20', btnHover: 'hover:border-violet-300 hover:bg-violet-50/50', hoverBorder: 'hover:border-violet-200' },
    PAYMENT: { label: 'Payment', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: Banknote, bgCard: 'from-green-50 to-white', accent: 'bg-green-500', btnBg: 'bg-green-600 hover:bg-green-700 shadow-green-600/20', btnHover: 'hover:border-green-300 hover:bg-green-50/50', hoverBorder: 'hover:border-green-200' },
};

/** Map backend stages to the 4-step flow */
function toFlowStep(backendStage: string): FlowStep {
    switch (backendStage) {
        case 'CREATED': case 'TAGGED': return 'IN_TRANSIT';
        case 'LOADING': return 'LOADING';
        case 'LOADED': case 'UNLOADED': return 'UNLOADING';
        case 'COMPLETED': return 'PAYMENT';
        default: return 'IN_TRANSIT';
    }
}

/** Map a flow step to the backend stage to advance to */
function flowStepToBackend(step: FlowStep): string {
    switch (step) {
        case 'IN_TRANSIT': return 'TAGGED';
        case 'LOADING': return 'LOADING';
        case 'UNLOADING': return 'UNLOADED';
        case 'PAYMENT': return 'COMPLETED';
    }
}

function getNextFlowStep(current: FlowStep): FlowStep | null {
    const idx = FLOW_STEPS.indexOf(current);
    return idx >= 0 && idx < FLOW_STEPS.length - 1 ? FLOW_STEPS[idx + 1] : null;
}

/* ── Mini progress dots for the 4-step flow ── */
function FlowProgress({ currentStep }: { currentStep: FlowStep }) {
    const currentIdx = FLOW_STEPS.indexOf(currentStep);
    return (
        <div className="flex items-center gap-1">
            {FLOW_STEPS.map((step, i) => {
                const isDone = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                    <div key={step} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full transition-all ${isDone ? 'bg-green-500'
                            : isCurrent ? 'bg-neutral-900 ring-2 ring-neutral-900/20 w-2.5 h-2.5'
                                : 'bg-neutral-200'
                            }`} />
                        {i < FLOW_STEPS.length - 1 && (
                            <div className={`w-4 h-0.5 ${i < currentIdx ? 'bg-green-400' : 'bg-neutral-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

type FilterType = 'all' | FlowStep;

export function LoadsList({ onViewLoad, onViewInvoice }: LoadsListProps) {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const { loads: loadsData, permits, loading, refreshAll } = useSync();

    /** Look up permit for a load to get route + material */
    const getPermit = (permitNumber: string) => permits.find(p => p.permitNumber === permitNumber) ?? null;

    const allLoads = loadsData ?? [];
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    /* ── Enriched loads ──────────────────── */
    const enrichedLoads = useMemo(() => {
        return allLoads.map(l => ({
            ...l,
            flowStep: toFlowStep(l.currentStage),
            nextFlowStep: getNextFlowStep(toFlowStep(l.currentStage)),
        }));
    }, [allLoads]);

    /* ── Filtering ───────────────────────── */
    const filtered = useMemo(() => {
        let result = enrichedLoads;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(l =>
                l.loadId.toLowerCase().includes(q) ||
                l.truckNumber.toLowerCase().includes(q) ||
                l.permitNumber.toLowerCase().includes(q)
            );
        }
        if (activeFilter !== 'all') {
            result = result.filter(l => l.flowStep === activeFilter);
        }
        return result;
    }, [enrichedLoads, search, activeFilter]);

    /* ── Stats ───────────────────────────── */
    const stats = useMemo(() => ({
        total: allLoads.length,
        inTransit: enrichedLoads.filter(l => l.flowStep === 'IN_TRANSIT').length,
        loading: enrichedLoads.filter(l => l.flowStep === 'LOADING').length,
        unloading: enrichedLoads.filter(l => l.flowStep === 'UNLOADING').length,
        payment: enrichedLoads.filter(l => l.flowStep === 'PAYMENT').length,
        flagged: allLoads.filter(l => l.hasFlag).length,
    }), [allLoads, enrichedLoads]);

    /* ── Advance load status ─────────────── */
    const handleAdvance = async (load: typeof enrichedLoads[0]) => {
        if (!load.nextFlowStep) return;
        setUpdatingId(load.loadId);
        try {
            const nextBackendStage = flowStepToBackend(load.nextFlowStep);
            await updateLoad(load.loadId, { currentStage: nextBackendStage as any });
            await refreshAll();
            showToast(`${load.truckNumber} → ${FLOW_META[load.nextFlowStep].label}`);
        } catch { showToast('Failed to update status'); }
        finally { setUpdatingId(null); }
    };

    /** Pipeline distribution - percent per step */
    const pipelinePcts = useMemo(() => {
        const t = Math.max(allLoads.length, 1);
        return {
            inTransit: Math.round((stats.inTransit / t) * 100),
            loading: Math.round((stats.loading / t) * 100),
            unloading: Math.round((stats.unloading / t) * 100),
            payment: Math.round((stats.payment / t) * 100),
        };
    }, [stats, allLoads.length]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium backdrop-blur-sm border border-neutral-700">
                    {toast}
                </div>
            )}

            {/* ── Header ─────────────────────── */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center">
                            <Package size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Loads</h1>
                            <p className="text-xs text-neutral-400 mt-0.5">Track and manage all active loads</p>
                        </div>
                    </div>
                </div>
                <div className="relative w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="text"
                        placeholder="Search load, truck or permit…"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 bg-neutral-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 focus:bg-white transition-all placeholder:text-neutral-400"
                    />
                </div>
            </div>

            {/* ── Status Flow Summary Cards ──── */}
            <div className="grid grid-cols-5 gap-3 mb-8">
                {/* Total */}
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`relative rounded-2xl p-5 border overflow-hidden transition-all duration-200 ${activeFilter === 'all'
                        ? 'bg-neutral-50 border-neutral-300 shadow-md scale-[1.02]'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                >
                    {activeFilter === 'all' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-900 rounded-l-2xl" />}
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${activeFilter === 'all' ? 'text-neutral-600' : 'text-neutral-400'}`}>Total</div>
                    <div className={`text-3xl font-extrabold mt-1.5 tracking-tight ${activeFilter === 'all' ? 'text-neutral-900' : 'text-neutral-900'}`}>{stats.total}</div>
                    <div className={`text-[10px] mt-1.5 font-medium ${activeFilter === 'all' ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {stats.flagged > 0 ? `${stats.flagged} flagged` : 'all loads'}
                    </div>
                </button>

                {FLOW_STEPS.map(step => {
                    const meta = FLOW_META[step];
                    const Icon = meta.icon;
                    const count = step === 'IN_TRANSIT' ? stats.inTransit
                        : step === 'LOADING' ? stats.loading
                            : step === 'UNLOADING' ? stats.unloading
                                : stats.payment;
                    const isActive = activeFilter === step;
                    const pct = step === 'IN_TRANSIT' ? pipelinePcts.inTransit
                        : step === 'LOADING' ? pipelinePcts.loading
                            : step === 'UNLOADING' ? pipelinePcts.unloading
                                : pipelinePcts.payment;
                    return (
                        <button
                            key={step}
                            onClick={() => setActiveFilter(isActive ? 'all' : step)}
                            className={`relative rounded-2xl p-5 border overflow-hidden transition-all duration-200 ${isActive
                                ? `${meta.bg} ${meta.border} shadow-md scale-[1.02]`
                                : `bg-white border-neutral-200 ${meta.btnHover} hover:shadow-md hover:-translate-y-0.5`
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? meta.color : 'text-neutral-400'}`}>{meta.label}</div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? `${meta.bg} shadow-sm` : 'bg-neutral-50'}`}>
                                    <Icon size={15} className={isActive ? meta.color : 'text-neutral-400'} />
                                </div>
                            </div>
                            <div className={`text-3xl font-extrabold mt-1.5 tracking-tight ${isActive ? meta.color : 'text-neutral-900'}`}>{count}</div>
                            <div className={`text-[10px] mt-1.5 font-medium ${isActive ? meta.color : 'text-neutral-400'}`}>{pct}% of total</div>
                        </button>
                    );
                })}
            </div>

            {/* ── Section label ─────────────── */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">
                    {activeFilter === 'all' ? 'All Loads' : FLOW_META[activeFilter].label}
                    <span className="ml-2 text-neutral-400 font-medium normal-case tracking-normal">({filtered.length})</span>
                </h2>
            </div>

            {/* ── Load Cards ─────────────────── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin text-neutral-400" size={22} />
                    </div>
                    <span className="text-sm text-neutral-400 font-medium">Fetching loads…</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-gradient-to-b from-neutral-50 to-white border border-neutral-200 border-dashed rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                        <Package size={28} className="text-neutral-300" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-600">No loads found</p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">Try adjusting your search or filter to find what you're looking for</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map(load => {
                        const meta = FLOW_META[load.flowStep];
                        const Icon = meta.icon;
                        const nextMeta = load.nextFlowStep ? FLOW_META[load.nextFlowStep] : null;
                        const isUpdating = updatingId === load.loadId;
                        const isPayment = load.flowStep === 'PAYMENT';
                        const permit = getPermit(load.permitNumber);
                        const route = permit?.route;
                        const material = permit?.material;

                        return (
                            <div
                                key={load._id}
                                onClick={() => onViewLoad(load.loadId)}
                                className={`relative bg-white border border-neutral-200 rounded-2xl hover:shadow-lg hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}
                            >

                                <div className="pl-5 pr-5 py-5">
                                    {/* Top row: truck + status badge + time */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-2xl ${meta.bg} flex items-center justify-center shadow-sm`}>
                                                <Icon size={18} className={meta.color} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[15px] font-bold text-neutral-900 tracking-tight">{load.truckNumber}</span>
                                                    {load.hasFlag && (
                                                        <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md font-semibold">
                                                            <AlertTriangle size={9} /> Flagged
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Hash size={10} className="text-neutral-300" />
                                                    <span className="text-[11px] text-neutral-400 font-mono">{load.loadId}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${meta.bg} ${meta.color} ${meta.border} border`}>
                                                {meta.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Route + Material row */}
                                    {route && (
                                        <div className="flex items-center gap-3 mb-3 pl-0.5">
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 px-2.5 py-1.5 rounded-lg">
                                                <MapPin size={11} className="text-neutral-400 shrink-0" />
                                                <span className="font-medium">{route.from}</span>
                                                <ArrowRight size={10} className="text-neutral-300" />
                                                <span className="font-medium">{route.to}</span>
                                            </div>
                                            {material && (
                                                <span className="text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-1.5 rounded-lg font-medium">
                                                    {material}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action row */}
                                    <div className="flex items-center gap-2">
                                        {/* Advance button */}
                                        {nextMeta ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAdvance(load); }}
                                                disabled={isUpdating}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 text-white shadow-sm ${nextMeta.btnBg}`}
                                            >
                                                {isUpdating ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <ArrowRight size={14} />
                                                        Move to {nextMeta.label}
                                                    </>
                                                )}
                                            </button>
                                        ) : isPayment ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onViewInvoice(load.permitNumber); }}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                                            >
                                                <Banknote size={14} />
                                                View Payment
                                            </button>
                                        ) : null}

                                        {/* Details button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onViewLoad(load.loadId); }}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all group/btn"
                                        >
                                            Details
                                            <ArrowUpRight size={13} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
