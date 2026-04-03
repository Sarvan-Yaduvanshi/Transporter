import { useState, useMemo } from 'react';
import {
  ArrowLeft, CheckCircle, Truck, MapPin,
  Clock, AlertTriangle, X, ShieldCheck } from
'lucide-react';
import { updatePaymentStatus } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';






/* ── Stage constants ────────────────────── */
const STAGE_ORDER = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];
const STAGE_LABELS = {
  CREATED: 'Assigned',
  TAGGED: 'Tagged',
  LOADING: 'Loading',
  LOADED: 'Loaded',
  UNLOADED: 'Unloaded',
  COMPLETED: 'Completed'
};

/* ── Status badge styles (square) ──────── */
const STATUS_BADGE = {
  Cleared: 'bg-green-100 text-green-700 border border-green-200',
  Dispute: 'bg-red-100 text-red-600 border border-red-200',
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  'In Transit': 'bg-amber-600 text-white',
  Completed: 'bg-green-600 text-white',
  Active: 'bg-amber-600 text-white'
};

function formatINR(n) {
  return n.toLocaleString('en-IN');
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d) {
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/* ── Progress Timeline (vertical, Figma-style) ────── */
function ProgressTimeline({ currentStage, loadDate }) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  // Generate synthetic timestamps for completed stages
  const baseTime = loadDate.getTime();

  return (
    <div className="space-y-0">
            {STAGE_ORDER.map((stage, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const isFuture = i > currentIdx;
        const stageTime = new Date(baseTime + i * 30 * 60 * 1000); // 30 min per stage

        return (
          <div key={stage} className="flex items-start gap-3">
                        {/* Vertical line + dot */}
                        <div className="flex flex-col items-center">
                            <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ?
                isCurrent ?
                'bg-amber-600 text-white' :
                'bg-green-600 text-white' :
                'bg-neutral-200 text-neutral-400'}`
                }>
                
                                {done && !isCurrent ? <CheckCircle size={14} /> : null}
                                {isCurrent ? <Clock size={14} /> : null}
                            </div>
                            {i < STAGE_ORDER.length - 1 &&
              <div className={`w-0.5 h-10 ${i < currentIdx ? 'bg-green-400' : 'bg-neutral-200'}`} />
              }
                        </div>
                        {/* Label + time */}
                        <div className="pt-0.5 pb-4">
                            <div className={`text-sm font-semibold ${isFuture ? 'text-neutral-400' : 'text-neutral-900'}`}>
                                {STAGE_LABELS[stage] || stage}
                            </div>
                            {done ?
              <div className="text-xs text-neutral-400 mt-0.5">
                                    {formatDate(stageTime)}, {formatTime(stageTime)}
                                </div> :

              <div className="text-xs text-neutral-300 mt-0.5">—</div>
              }
                        </div>
                    </div>);

      })}
        </div>);

}

/* ── Activity Timeline ─────────────────── */
function ActivityTimeline({ currentStage, loadDate }) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const baseTime = loadDate.getTime();

  // Build activity entries for completed stages (in reverse order = newest first)
  const activities = STAGE_ORDER.
  slice(0, currentIdx + 1).
  map((stage, i) => {
    const t = new Date(baseTime + i * 30 * 60 * 1000);
    const label = {
      CREATED: 'Load assigned to truck',
      TAGGED: 'Truck tagged for permit',
      LOADING: 'Reached loading point',
      LOADED: 'Truck loaded at mine',
      UNLOADED: 'Load unloaded at destination',
      COMPLETED: 'Load delivery completed'
    };
    return { label: label[stage] || stage, time: t };
  }).
  reverse();

  return (
    <div className="space-y-4">
            {activities.map((a, i) =>
      <div key={i} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-neutral-800">{a.label}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                            {formatDate(a.time)}, {formatTime(a.time)}
                        </div>
                    </div>
                </div>
      )}
        </div>);

}

/* ── Info Row helper ───────────────────── */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2">
            <span className="text-sm text-neutral-500">{label}</span>
            <span className="text-sm font-semibold text-neutral-900">{value}</span>
        </div>);

}

/* ════════════════════════════════════════════
   Main InvoiceView component
   ════════════════════════════════════════════ */
export function InvoiceView({ permitNumber, onBack }) {
  const [statusModal, setStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(null);
  const { permits, loads: allLoads, flags: allFlags, mines, loading, refreshAll } = useSync();
  const permit = permits.find((p) => p.permitNumber === permitNumber) ?? null;

  /* ── Derive loads for this permit ──────── */
  const permitLoads = useMemo(() => {
    return allLoads.
    filter((l) => l.permitNumber === permitNumber).
    map((l) => {
      const hasDispute = allFlags.some(
        (f) => f.permitNumber === permitNumber && f.loadId === l.loadId && f.status === 'Under Review'
      );
      const loadStatus = hasDispute ?
      'Dispute' :
      ['COMPLETED', 'UNLOADED'].includes(l.currentStage) ?
      'Cleared' :
      'Pending';
      const perLoadRate = permit ?
      Math.round((permit.paymentSummary?.totalAmount ?? 0) / Math.max(permit.paymentSummary?.totalLoads ?? 1, 1)) :
      0;
      return {
        ...l,
        paymentStatus: loadStatus,
        amount: perLoadRate,
        date: l.createdAt ? new Date(l.createdAt) : new Date()
      };
    }).
    sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allLoads, allFlags, permitNumber, permit]);

  /* ── Find the mine/site name ──────────── */
  const siteName = useMemo(() => {
    const mine = mines.find((m) => m.routes.some((r) => r.permitNumber === permitNumber));
    return mine?.name ?? permit?.route.from ?? '—';
  }, [mines, permit, permitNumber]);

  /* ── We show the first (most recent) load as the "active load" ── */
  const activeLoad = permitLoads[0] ?? null;

  /* ── Dynamic stage badge text ──────────── */
  function stageBadgeText(stage) {
    if (['COMPLETED', 'UNLOADED'].includes(stage)) return 'Completed';
    if (['LOADING', 'LOADED'].includes(stage)) return 'In Transit';
    return 'Active';
  }

  /* ── Status update handler ────────────── */
  const PAYMENT_STATUS_OPTIONS = ['Pending', 'Pending Approval', 'Ready', 'Dispute'];
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updatePaymentStatus(permitNumber, newStatus);
      refreshAll();
      setStatusSuccess(newStatus);
      setTimeout(() => setStatusSuccess(null), 3000);
    } catch (e) {
      alert(e.message || 'Failed to update status');
    } finally {
      setUpdating(false);
      setStatusModal(false);
    }
  };

  const totalAmount = permit?.paymentSummary?.totalAmount ?? 0;
  const totalLoads = permit?.paymentSummary?.totalLoads ?? permitLoads.length;
  const completedLoads = permit?.paymentSummary?.completedLoads ?? permitLoads.filter((l) => l.paymentStatus === 'Cleared').length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
            {/* ── Back button ──────────────────────── */}
            <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        
                <ArrowLeft size={16} /> Active Load Details
            </button>

            {loading || !activeLoad ?
      <div className="text-sm text-neutral-400">Loading…</div> :

      <>
                    {/* ── Load header card ──────────────── */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900">{activeLoad.loadId}</h1>
                                <p className="text-sm text-neutral-500 mt-0.5">{activeLoad.truckNumber}</p>
                            </div>
                            <span className={`px-3 py-1.5 rounded text-xs font-semibold ${STATUS_BADGE[stageBadgeText(activeLoad.currentStage)] || 'bg-neutral-100 text-neutral-600'}`
            }>
                                {stageBadgeText(activeLoad.currentStage)}
                            </span>
                        </div>

                        {/* Detail rows */}
                        <div className="border-t border-neutral-100 pt-3 space-y-0">
                            <InfoRow label="Transporter" value={permit?.route.from ?? '—'} />
                            <InfoRow label="Site" value={siteName} />
                            <InfoRow label="Material" value={permit?.material ?? '—'} />
                            <InfoRow label="Tonnage" value={`${permit?.remainingTonnage ?? 0} MT`} />
                            <InfoRow label="Amount" value={`₹${formatINR(totalAmount)}`} />
                            <InfoRow label="Loads" value={`${completedLoads} / ${totalLoads}`} />
                            <InfoRow label="Schedule" value={formatDate(activeLoad.date)} />
                        </div>
                    </div>

                    {/* ── Progress timeline ─────────────── */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
                        <h2 className="text-base font-bold text-neutral-900 mb-5">Progress</h2>
                        <ProgressTimeline currentStage={activeLoad.currentStage} loadDate={activeLoad.date} />
                    </div>

                    {/* ── Map placeholder ───────────────── */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 flex items-center justify-center min-h-[160px]">
                        <div className="text-center text-neutral-400">
                            <MapPin size={32} className="mx-auto mb-2 text-neutral-300" />
                            <div className="text-sm">Location tracking</div>
                            <div className="text-xs mt-0.5">{permit?.route.from} → {permit?.route.to}</div>
                        </div>
                    </div>

                    {/* ── Activity Timeline ─────────────── */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
                        <h2 className="text-base font-bold text-neutral-900 mb-5">Activity Timeline</h2>
                        <ActivityTimeline currentStage={activeLoad.currentStage} loadDate={activeLoad.date} />
                    </div>

                    {/* ── Other loads under this permit ──── */}
                    {permitLoads.length > 1 &&
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-neutral-100">
                                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">
                                    All Loads Under {permitNumber}
                                </h2>
                                <p className="text-xs text-neutral-400 mt-0.5">{permitLoads.length} loads total</p>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {permitLoads.map((load) =>
            <div key={load.loadId} className="px-6 py-3 flex items-center gap-4">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${load.paymentStatus === 'Cleared' ? 'bg-green-100' :
              load.paymentStatus === 'Dispute' ? 'bg-red-100' : 'bg-neutral-100'}`
              }>
                                            <Truck size={16} className={
                load.paymentStatus === 'Cleared' ? 'text-green-600' :
                load.paymentStatus === 'Dispute' ? 'text-red-500' : 'text-neutral-500'
                } />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-neutral-900">{load.loadId}</div>
                                            <div className="text-xs text-neutral-500">{load.truckNumber} · {load.currentStage}</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_BADGE[load.paymentStatus] || 'bg-neutral-100 text-neutral-600'}`
              }>
                                            {load.paymentStatus}
                                        </span>
                                        <div className="text-sm font-bold text-neutral-900">₹{formatINR(load.amount)}</div>
                                    </div>
            )}
                            </div>
                        </div>
        }

                    {/* ── Flag alert ────────────────────── */}
                    {activeLoad.hasFlag &&
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 mb-1">Active Flag</h3>
                                    <p className="text-xs text-red-600">
                                        This load has been flagged for review.
                                    </p>
                                </div>
                            </div>
                        </div>
        }

                    {/* ── Success toasts ────────────────── */}
                    {statusSuccess &&
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <CheckCircle size={18} className="text-green-600 shrink-0" />
                            <div>
                                <div className="text-sm font-semibold text-green-800">Payment status updated</div>
                                <div className="text-xs text-green-600 mt-0.5">
                                    Permit {permitNumber} marked as <span className="font-bold">{statusSuccess}</span>
                                </div>
                            </div>
                        </div>
        }

                    {/* ── Action button (Update Status) ── */}
                    <div className="flex gap-3">
                        <button
            onClick={() => setStatusModal(true)}
            className="flex-1 bg-white border border-neutral-200 text-neutral-700 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors">
            
                            Update Status
                        </button>
                    </div>

                    {/* ── Update Status Modal ──────────── */}
                    {statusModal &&
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]" onClick={() => setStatusModal(false)}>
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-neutral-900">Update Payment Status</h3>
                                    <button onClick={() => setStatusModal(false)} className="text-neutral-400 hover:text-neutral-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-sm text-neutral-500 mb-1">
                                    Current status: <span className="font-semibold text-neutral-800">{permit?.paymentStatus ?? '—'}</span>
                                </p>
                                <p className="text-xs text-neutral-400 mb-4">Permit {permitNumber}</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {PAYMENT_STATUS_OPTIONS.filter((s) => s !== permit?.paymentStatus).map((status) =>
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${status === 'Pending Approval' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                status === 'Ready' ? 'bg-neutral-900 text-white hover:bg-neutral-800' :
                status === 'Dispute' ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' :
                'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`
                }>
                
                                            {status === 'Pending Approval' && <ShieldCheck size={14} className="inline mr-1.5 -mt-0.5" />}
                                            {status === 'Pending Approval' ? 'Send for Transporter Approval' : `Mark as ${status}`}
                                        </button>
              )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-neutral-100">
                                    <div className="flex items-start gap-2 text-xs text-neutral-400">
                                        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-neutral-300" />
                                        <span>Payments require transporter approval before being cleared. Send for approval to notify the transporter.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
        }
                </>
      }
        </div>);

}