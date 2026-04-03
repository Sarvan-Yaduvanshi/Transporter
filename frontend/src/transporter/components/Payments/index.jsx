import { useState, useMemo } from 'react';
import { ChevronRight, IndianRupee, Clock, CheckCircle, ShieldCheck, Truck, FileText } from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PermitPaymentView } from './PermitPaymentView';





/* ── Helpers ──────────────────────────── */
function formatINR(n) {
  return n.toLocaleString('en-IN');
}



/* ── Permit summary row type ──────────── */













/* ── Truck summary row type ───────────── */













export function Payments({ onNavigateToPermit }) {
  const { permits, loads, trucks, loading, refreshAll } = useSync();
  const [activeSection, setActiveSection] = useState('permits');
  const [selectedPermit, setSelectedPermit] = useState(null);

  /* ── Build permit summaries ──────────── */
  const permitSummaries = useMemo(() => {
    return permits.map((p) => {
      const pLoads = loads.filter((l) => l.permitNumber === p.permitNumber);
      const truckNums = [...new Set(pLoads.map((l) => l.truckNumber))];
      return {
        permitNumber: p.permitNumber,
        route: p.route,
        material: p.material,
        paymentStatus: p.paymentStatus ?? 'Pending',
        totalAmount: p.paymentSummary?.totalAmount ?? 0,
        totalLoads: p.paymentSummary?.totalLoads ?? pLoads.length,
        completedLoads: p.paymentSummary?.completedLoads ?? pLoads.filter((l) => ['COMPLETED', 'UNLOADED'].includes(l.currentStage)).length,
        loadCount: pLoads.length,
        truckNumbers: truckNums,
        needsApproval: p.paymentStatus === 'Pending Approval'
      };
    }).sort((a, b) => {
      // Pending Approval first, then by amount desc
      if (a.needsApproval && !b.needsApproval) return -1;
      if (!a.needsApproval && b.needsApproval) return 1;
      return b.totalAmount - a.totalAmount;
    });
  }, [permits, loads]);

  /* ── Build truck summaries (only trucks with completed loads in payment state) ── */
  const truckSummaries = useMemo(() => {
    const rateMap = {};
    permits.forEach((p) => {
      const total = p.paymentSummary?.totalAmount ?? 0;
      const count = p.paymentSummary?.totalLoads ?? 1;
      rateMap[p.permitNumber] = count > 0 ? Math.round(total / count) : 0;
    });

    // Build a lookup for fleet truck info
    const truckInfo = new Map(trucks.map((t) => [t.truckNumber, t]));

    // Only consider loads that are completed / in payment state
    const paymentLoads = loads.filter((l) =>
    ['COMPLETED', 'UNLOADED'].includes(l.currentStage) || l.hasFlag
    );

    const truckMap = new Map();

    paymentLoads.forEach((l) => {
      let entry = truckMap.get(l.truckNumber);
      if (!entry) {
        const info = truckInfo.get(l.truckNumber);
        entry = {
          truckNumber: l.truckNumber,
          owner: info?.owner ?? '—',
          driver: info?.driver ?? '—',
          status: info?.status ?? 'Active',
          totalEarnings: 0,
          loadCount: 0,
          paidLoads: 0,
          pendingLoads: 0,
          disputeLoads: 0,
          permits: []
        };
        truckMap.set(l.truckNumber, entry);
      }
      const rate = rateMap[l.permitNumber] ?? 0;
      entry.totalEarnings += rate;
      entry.loadCount++;
      if (l.hasFlag) entry.disputeLoads++;else
      entry.paidLoads++;
      if (!entry.permits.includes(l.permitNumber)) entry.permits.push(l.permitNumber);
    });

    return [...truckMap.values()].sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [permits, loads, trucks]);

  /* ── Global stats ───────────────────── */
  const stats = useMemo(() => {
    const totalRevenue = permitSummaries.reduce((s, p) => s + p.totalAmount, 0);
    const pendingAmount = permitSummaries.filter((p) => !['Cleared'].includes(p.paymentStatus)).reduce((s, p) => s + p.totalAmount, 0);
    const clearedAmount = permitSummaries.filter((p) => p.paymentStatus === 'Cleared').reduce((s, p) => s + p.totalAmount, 0);
    const approvalCount = permitSummaries.filter((p) => p.needsApproval).length;
    return { totalRevenue, pendingAmount, clearedAmount, approvalCount, totalPermits: permitSummaries.length, totalTrucks: truckSummaries.length };
  }, [permitSummaries, truckSummaries]);

  /* ── Slide-over invoice view ─────────── */
  if (selectedPermit) {
    return <PermitPaymentView permitNumber={selectedPermit} onBack={() => setSelectedPermit(null)} onNavigateToPermit={onNavigateToPermit} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ── Page header ──────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Payments</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage permits & truck earnings</p>
      </div>

      {/* ── Approval banner ──────────────── */}
      {stats.approvalCount > 0 &&
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShieldCheck size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-800">{stats.approvalCount} permit{stats.approvalCount > 1 ? 's' : ''} awaiting your approval</div>
              <div className="text-xs text-amber-600 mt-0.5">Review and approve payments to release funds</div>
            </div>
          </div>
        </div>
      }

      {/* ── Stats row ────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
        { label: 'Total Revenue', value: `₹${formatINR(stats.totalRevenue)}`, sub: `${stats.totalPermits} permits`, icon: <IndianRupee size={16} />, iconBg: 'bg-neutral-100 text-neutral-600' },
        { label: 'Pending', value: `₹${formatINR(stats.pendingAmount)}`, sub: `awaiting clearance`, icon: <Clock size={16} />, iconBg: 'bg-amber-100 text-amber-600' },
        { label: 'Cleared', value: `₹${formatINR(stats.clearedAmount)}`, sub: `funds released`, icon: <CheckCircle size={16} />, iconBg: 'bg-green-100 text-green-600' },
        { label: 'Fleet', value: `${stats.totalTrucks}`, sub: `active trucks`, icon: <Truck size={16} />, iconBg: 'bg-neutral-100 text-neutral-600' }].
        map((stat) =>
        <div key={stat.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{stat.label}</div>
                <div className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</div>
                <div className="text-xs text-neutral-400 mt-1">{stat.sub}</div>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>{stat.icon}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section tabs ─────────────────── */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 mb-6 w-fit">
        {[
        { id: 'permits', label: 'Permits', icon: <FileText size={15} />, count: stats.totalPermits },
        { id: 'trucks', label: 'Trucks', icon: <Truck size={15} />, count: stats.totalTrucks }].
        map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveSection(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeSection === tab.id ?
          'bg-white text-neutral-900 shadow-sm' :
          'text-neutral-500 hover:text-neutral-700'}`
          }>
          
            {tab.icon}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded ${activeSection === tab.id ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-200/60 text-neutral-400'}`}>
              {tab.count}
            </span>
          </button>
        )}
      </div>

      {loading ?
      <div className="text-sm text-neutral-400 py-12 text-center">Loading…</div> :

      <>
          {/* ════════════════════════════════════
             PERMITS SECTION
            ════════════════════════════════════ */}
          {activeSection === 'permits' &&
        <div>
              <h2 className="text-base font-bold text-neutral-900 mb-4">All Permits</h2>

              {permitSummaries.length === 0 ?
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-sm text-neutral-400 text-center">No permits found</div> :

          <div className="space-y-3">
                  {permitSummaries.map((p) =>
            <button
              key={p.permitNumber}
              onClick={() => setSelectedPermit(p.permitNumber)}
              className="w-full bg-white border border-neutral-200 rounded-xl p-5 text-left hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer">
              
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${p.needsApproval ? 'bg-amber-100' : p.paymentStatus === 'Cleared' ? 'bg-green-100' : p.paymentStatus === 'Dispute' ? 'bg-red-100' : 'bg-neutral-100'}`}>
                          {p.needsApproval ?
                  <ShieldCheck size={18} className="text-amber-600" /> :
                  <FileText size={18} className={p.paymentStatus === 'Cleared' ? 'text-green-600' : p.paymentStatus === 'Dispute' ? 'text-red-500' : 'text-neutral-500'} />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-neutral-900">{p.permitNumber}</span>
                            <PaymentStatusBadge status={p.paymentStatus} />
                            {p.needsApproval &&
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                Needs Approval
                              </span>
                    }
                          </div>
                          <div className="text-xs text-neutral-500">{p.route.from} → {p.route.to} · {p.material}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-xs text-neutral-400">
                              <span className="font-semibold text-neutral-700">{p.completedLoads}</span> / {p.totalLoads} loads
                            </div>
                            <div className="text-xs text-neutral-400">
                              {p.truckNumbers.length} truck{p.truckNumbers.length !== 1 ? 's' : ''}
                            </div>
                            {/* Progress bar */}
                            <div className="flex-1 max-w-[120px]">
                              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${p.totalLoads > 0 ? p.completedLoads / p.totalLoads * 100 : 0}%` }} />
                        
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-neutral-900">₹{formatINR(p.totalAmount)}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">{p.loadCount} loads</div>
                        </div>

                        <ChevronRight size={16} className="text-neutral-400 shrink-0 mt-2" />
                      </div>
                    </button>
            )}
                </div>
          }
            </div>
        }

          {/* ════════════════════════════════════
             TRUCKS SECTION
            ════════════════════════════════════ */}
          {activeSection === 'trucks' &&
        <div>
              <h2 className="text-base font-bold text-neutral-900 mb-4">Trucks in Payment State</h2>
              <p className="text-xs text-neutral-500 mb-4 -mt-2">Only trucks with completed loads awaiting or cleared for payment</p>

              {truckSummaries.length === 0 ?
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-sm text-neutral-400 text-center">No trucks in payment state yet — loads must be completed first</div> :

          <div className="space-y-3">
                  {truckSummaries.map((t) =>
            <div
              key={t.truckNumber}
              className="bg-white border border-neutral-200 rounded-xl p-5">
              
                      <div className="flex items-start gap-4">
                        {/* Truck icon */}
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                          <Truck size={18} className="text-neutral-500" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-neutral-900">{t.truckNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${t.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'}`}>
                              {t.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500">{t.driver} · {t.owner}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                              <span className="text-neutral-500"><span className="font-semibold text-neutral-700">{t.paidLoads}</span> paid</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                              <span className="text-neutral-500"><span className="font-semibold text-neutral-700">{t.pendingLoads}</span> pending</span>
                            </div>
                            {t.disputeLoads > 0 &&
                    <div className="flex items-center gap-1 text-xs">
                                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                <span className="text-neutral-500"><span className="font-semibold text-red-600">{t.disputeLoads}</span> flagged</span>
                              </div>
                    }
                            <div className="text-xs text-neutral-400">{t.permits.length} permit{t.permits.length !== 1 ? 's' : ''}</div>
                          </div>
                        </div>

                        {/* Earnings */}
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-neutral-900">₹{formatINR(t.totalEarnings)}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">{t.loadCount} loads</div>
                        </div>
                      </div>

                      {/* Linked permits */}
                      {t.permits.length > 0 &&
              <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-1.5">
                          {t.permits.map((pn) =>
                <button
                  key={pn}
                  onClick={() => setSelectedPermit(pn)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors flex items-center gap-1">
                  
                              <FileText size={12} /> {pn}
                            </button>
                )}
                        </div>
              }
                    </div>
            )}
                </div>
          }
            </div>
        }
        </>
      }
    </div>);

}