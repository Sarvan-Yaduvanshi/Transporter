import { useState, useMemo } from 'react';
import {
    ChevronRight, Truck, FileText, Banknote, Loader2,
} from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { updatePaymentStatus } from '@/services/api';

interface PaymentListProps {
    onViewInvoice: (permitNumber: string) => void;
}

type TabType = 'permits' | 'trucks';

/* ── Badge styles ─────────────────────── */
const TX_STATUS_STYLES: Record<string, string> = {
    Paid: 'bg-blue-100 text-blue-700 border border-blue-200',
    Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    Dispute: 'bg-red-100 text-red-600 border border-red-200',
    'In Progress': 'bg-neutral-100 text-neutral-500 border border-neutral-200',
    'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200',
    Cleared: 'bg-green-100 text-green-700 border border-green-200',
};

interface Transaction {
    _id: string;
    loadId: string;
    truckNumber: string;
    permitNumber: string;
    status: string;
    amount: number;
    date: Date;
    currentStage: string;
}

function formatINR(n: number): string { return n.toLocaleString('en-IN'); }

function useTransactions() {
    const { permits, loads, trucks, flags, loading } = useSync();

    return useMemo(() => {
        const rateMap: Record<string, number> = {};
        const permitPayStatus: Record<string, string> = {};
        permits.forEach(p => {
            const total = p.paymentSummary?.totalAmount ?? 0;
            const count = p.paymentSummary?.totalLoads ?? 1;
            rateMap[p.permitNumber] = count > 0 ? Math.round(total / count) : 0;
            permitPayStatus[p.permitNumber] = p.paymentStatus ?? 'Pending';
        });

        const transactions: Transaction[] = loads.map(l => {
            const isPaid = ['COMPLETED', 'UNLOADED'].includes(l.currentStage);
            const isDispute = l.hasFlag;
            const status = isDispute ? 'Dispute'
                : isPaid ? (permitPayStatus[l.permitNumber] === 'Cleared' ? 'Cleared'
                    : permitPayStatus[l.permitNumber] === 'Pending Approval' ? 'Pending Approval' : 'Paid')
                    : 'In Progress';
            return {
                _id: l._id,
                loadId: l.loadId,
                truckNumber: l.truckNumber,
                permitNumber: l.permitNumber,
                status,
                amount: rateMap[l.permitNumber] ?? 0,
                date: l.createdAt ? new Date(l.createdAt) : new Date(),
                currentStage: l.currentStage,
            };
        }).sort((a, b) => b.date.getTime() - a.date.getTime());

        const truckNumbers = trucks.length > 0
            ? [...new Set(trucks.map(t => t.truckNumber))].sort()
            : [...new Set(loads.map(l => l.truckNumber))].sort();

        return { transactions, truckNumbers, loading, permits, trucks, flags };
    }, [permits, loads, trucks, flags, loading]);
}

function computeStats(txns: Transaction[]) {
    const thisMonth = txns.reduce((s, t) => s + t.amount, 0);
    const pending = txns.filter(t => t.status === 'Pending' || t.status === 'Pending Approval' || t.status === 'Paid').reduce((s, t) => s + t.amount, 0);
    const paidTxns = txns.filter(t => t.status === 'Cleared');
    const lastPayment = paidTxns.length > 0 ? paidTxns[0].amount : 0;
    const paidCount = paidTxns.length;
    const pendingCount = txns.filter(t => t.status !== 'Cleared' && t.status !== 'In Progress').length;
    const totalCleared = paidTxns.reduce((s, t) => s + t.amount, 0);
    return { thisMonth, pending, lastPayment, paidCount, pendingCount, totalCleared };
}

export function PaymentList({ onViewInvoice }: PaymentListProps) {
    const { transactions, truckNumbers, loading, permits, trucks, flags } = useTransactions();
    const [activeTab, setActiveTab] = useState<TabType>('permits');
    const { refreshAll } = useSync();
    const [toast, setToast] = useState<string | null>(null);

    const filtered = transactions;

    const stats = useMemo(() => computeStats(filtered), [filtered]);

    /* ── Trucks with completed loads only ── */
    const paymentTrucks = useMemo(() => {
        const completedByTruck = new Map<string, Transaction[]>();
        transactions.forEach(t => {
            if (['COMPLETED', 'UNLOADED'].includes(t.currentStage)) {
                const arr = completedByTruck.get(t.truckNumber) || [];
                arr.push(t);
                completedByTruck.set(t.truckNumber, arr);
            }
        });

        return Array.from(completedByTruck.entries()).map(([truckNum, tLoads]) => {
            const truck = trucks.find(t => t.truckNumber === truckNum);
            const totalEarnings = tLoads.reduce((s, l) => s + l.amount, 0);
            const paidLoads = tLoads.filter(l => l.status === 'Cleared').length;
            const pendingLoads = tLoads.filter(l => l.status !== 'Cleared' && l.status !== 'Dispute').length;
            const flaggedLoads = tLoads.filter(l => l.status === 'Dispute').length;
            const permitNums = [...new Set(tLoads.map(l => l.permitNumber))];
            return {
                truckNumber: truckNum,
                driver: truck?.driver || '—',
                owner: truck?.owner || '—',
                status: truck?.status || 'Active',
                totalEarnings,
                completedLoads: tLoads.length,
                paidLoads,
                pendingLoads,
                flaggedLoads,
                permitNums,
                loads: tLoads,
            };
        }).sort((a, b) => b.totalEarnings - a.totalEarnings);
    }, [transactions, trucks]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

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
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center">
                        <Banknote size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Payments</h1>
                        <p className="text-xs text-neutral-400 mt-0.5">Transaction overview & approval</p>
                    </div>
                </div>
            </div>

            {/* ── Stats ──────────────────────── */}
            <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'This Month', value: `₹${formatINR(stats.thisMonth)}`, sub: `${filtered.length} transactions`, accent: 'bg-blue-500' },
                    { label: 'Pending', value: `₹${formatINR(stats.pending)}`, sub: `${stats.pendingCount} pending`, accent: 'bg-amber-500' },
                    { label: 'Last Payment', value: `₹${formatINR(stats.lastPayment)}`, sub: `${stats.paidCount} cleared`, accent: 'bg-green-500' },
                    { label: 'Total Cleared', value: `₹${formatINR(stats.totalCleared)}`, sub: `${stats.paidCount} loads paid`, accent: 'bg-violet-500' },
                ].map(stat => (
                    <div key={stat.label} className="relative bg-white border border-neutral-200 rounded-2xl p-5 overflow-hidden hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.accent} rounded-l-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{stat.label}</div>
                        <div className="text-2xl font-extrabold text-neutral-900 mt-1.5 tracking-tight">{stat.value}</div>
                        <div className="text-[11px] text-neutral-400 mt-1 font-medium">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Tab bar ────────────────────── */}
            <div className="flex items-center gap-1 bg-neutral-100 rounded-2xl p-1 w-fit mb-6">
                {([
                    { id: 'permits' as TabType, label: 'Transactions', count: filtered.length },
                    { id: 'trucks' as TabType, label: `Trucks (${paymentTrucks.length})` },
                ]).map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                        {tab.id === 'permits' ? <FileText size={14} /> : <Truck size={14} />}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ TRANSACTIONS TAB ═══ */}
            {activeTab === 'permits' && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">
                            Recent Transactions
                            <span className="ml-2 text-neutral-400 font-medium normal-case tracking-normal">({filtered.length})</span>
                        </h2>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                                <Loader2 className="animate-spin text-neutral-400" size={22} />
                            </div>
                            <span className="text-sm text-neutral-400 font-medium">Fetching transactions…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-gradient-to-b from-neutral-50 to-white border border-neutral-200 border-dashed rounded-2xl p-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                                <Banknote size={28} className="text-neutral-300" />
                            </div>
                            <p className="text-sm font-semibold text-neutral-600">No transactions found</p>
                            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">Transactions will appear here once loads are completed</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(tx => {
                                const statusIconBg = tx.status === 'Cleared' ? 'bg-green-100'
                                    : tx.status === 'Dispute' ? 'bg-red-100'
                                        : tx.status === 'Pending Approval' ? 'bg-amber-100'
                                            : tx.status === 'Paid' ? 'bg-blue-100'
                                                : 'bg-neutral-100';
                                const statusIconColor = tx.status === 'Cleared' ? 'text-green-600'
                                    : tx.status === 'Dispute' ? 'text-red-600'
                                        : tx.status === 'Pending Approval' ? 'text-amber-600'
                                            : tx.status === 'Paid' ? 'text-blue-600'
                                                : 'text-neutral-400';
                                const truckInfo = trucks.find(t => t.truckNumber === tx.truckNumber);
                                const permit = permits.find(p => p.permitNumber === tx.permitNumber);
                                const route = permit?.route;
                                const material = permit?.material;
                                return (
                                    <div key={tx._id}
                                        onClick={() => onViewInvoice(tx.permitNumber)}
                                        className="flex items-center gap-5 bg-neutral-50/80 rounded-2xl p-5 cursor-pointer hover:bg-white hover:shadow-md transition-all group">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-full ${statusIconBg} flex items-center justify-center shrink-0`}>
                                            <FileText size={20} className={statusIconColor} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 mb-0.5">
                                                <span className="text-base font-bold text-neutral-900">{tx.truckNumber}</span>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${TX_STATUS_STYLES[tx.status] || 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            {route && (
                                                <div className="text-sm text-neutral-500 mb-1">
                                                    {route.from} → {route.to}{material ? ` · ${material}` : ''}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                <span className="font-medium text-neutral-500">{truckInfo?.driver || '—'}</span>
                                                <span className="text-neutral-300">·</span>
                                                <span>{truckInfo?.owner || '—'}</span>
                                                <span className="text-neutral-300">·</span>
                                                <span className="font-mono">{tx.loadId}</span>
                                            </div>
                                        </div>

                                        {/* Amount + Chevron */}
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <div className="text-xl font-extrabold text-neutral-900 tabular-nums">₹{formatINR(tx.amount)}</div>
                                                <div className="text-xs text-neutral-400 mt-0.5">
                                                    {tx.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ═══ TRUCKS IN PAYMENT TAB ═══ */}
            {activeTab === 'trucks' && (
                <>
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-neutral-900">Trucks in Payment State</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Only trucks with completed loads appear here</p>
                    </div>

                    {paymentTrucks.length === 0 ? (
                        <div className="text-center py-16">
                            <Truck size={32} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-sm text-neutral-500 font-medium">No trucks in payment state yet</p>
                            <p className="text-xs text-neutral-400 mt-1">Update load status to "Payment" to see trucks here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paymentTrucks.map(t => (
                                <div key={t.truckNumber}
                                    onClick={() => onViewInvoice(t.permitNums[0])}
                                    className="flex items-center gap-5 bg-neutral-50/80 rounded-2xl p-5 cursor-pointer hover:bg-white hover:shadow-md transition-all group">
                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Truck size={20} className="text-green-600" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 mb-0.5">
                                            <span className="text-base font-bold text-neutral-900">{t.truckNumber}</span>
                                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                                                {t.completedLoads} load{t.completedLoads !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="text-sm text-neutral-500 mb-2">
                                            {t.driver} · {t.owner}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                                            <span className="font-semibold text-neutral-600">{t.paidLoads}</span>
                                            <span>/ {t.completedLoads} loads</span>
                                            <span>{t.permitNums.length} permit{t.permitNums.length !== 1 ? 's' : ''}</span>
                                            <div className="w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(t.paidLoads / Math.max(t.completedLoads, 1)) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount + Chevron */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <div className="text-xl font-extrabold text-neutral-900 tabular-nums">₹{formatINR(t.totalEarnings)}</div>
                                            <div className="text-xs text-neutral-400 mt-0.5">{t.completedLoads} loads</div>
                                        </div>
                                        <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
