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
  CREATED: 'Assigned', TAGGED: 'Tagged', LOADING: 'Loading',
  LOADED: 'Loaded', UNLOADED: 'Unloaded', COMPLETED: 'Completed'
};

/* ── Status badge ──────────────────────── */
const STATUS_BADGE = {
  Cleared: 'bg-green-100 text-green-700 border border-green-200',
  Dispute: 'bg-red-100 text-red-600 border border-red-200',
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  'In Transit': 'bg-amber-600 text-white',
  Completed: 'bg-green-600 text-white',
  Active: 'bg-amber-600 text-white'
};

function formatINR(n) {return n.toLocaleString('en-IN');}
function formatDate(d) {return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });}
function formatTime(d) {return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });}

/* ── Progress Timeline ──────────────────── */
function ProgressTimeline({ currentStage, loadDate }) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const baseTime = loadDate.getTime();
  return (
    <div className="space-y-0">
      {STAGE_ORDER.map((stage, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const isFuture = i > currentIdx;
        const stageTime = new Date(baseTime + i * 30 * 60 * 1000);
        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? isCurrent ? 'bg-amber-600 text-white' : 'bg-green-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                {done && !isCurrent ? <CheckCircle size={14} /> : null}
                {isCurrent ? <Clock size={14} /> : null}
              </div>
              {i < STAGE_ORDER.length - 1 && <div className={`w-0.5 h-10 ${i < currentIdx ? 'bg-green-400' : 'bg-neutral-200'}`} />}
            </div>
            <div className="pt-0.5 pb-4">
              <div className={`text-sm font-semibold ${isFuture ? 'text-neutral-400' : 'text-neutral-900'}`}>{STAGE_LABELS[stage]}</div>
              {done ? <div className="text-xs text-neutral-400 mt-0.5">{formatDate(stageTime)}, {formatTime(stageTime)}</div> :
              <div className="text-xs text-neutral-300 mt-0.5">—</div>}
            </div>
          </div>);

      })}
    </div>);

}

/* ── Activity Timeline ──────────────────── */
function ActivityTimeline({ currentStage, loadDate }) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const baseTime = loadDate.getTime();
  const LABELS = {
    CREATED: 'Load assigned to truck', TAGGED: 'Truck tagged for permit',
    LOADING: 'Reached loading point', LOADED: 'Truck loaded at mine',
    UNLOADED: 'Load unloaded at destination', COMPLETED: 'Load delivery completed'
  };
  const activities = STAGE_ORDER.slice(0, currentIdx + 1).
  map((stage, i) => ({ label: LABELS[stage] || stage, time: new Date(baseTime + i * 30 * 60 * 1000) })).
  reverse();
  return (
    <div className="space-y-4">
      {activities.map((a, i) =>
      <div key={i} className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-neutral-800">{a.label}</div>
            <div className="text-xs text-neutral-400 mt-0.5">{formatDate(a.time)}, {formatTime(a.time)}</div>
          </div>
        </div>
      )}
    </div>);

}

/* ── Info Row ───────────────────────────── */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>);

}

/* ════════════════════════════════════════════
   Main PermitPaymentView
   ════════════════════════════════════════════ */
export function PermitPaymentView({ permitNumber, onBack, onNavigateToPermit }) {
  const [updating, setUpdating] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);
  const { permits, loads: allLoads, flags: allFlags, mines, loading, refreshAll } = useSync();
  const permit = permits.find((p) => p.permitNumber === permitNumber) ?? null;

  /* ── Derive loads ────────────────────── */
  const permitLoads = useMemo(() => {
    return allLoads.
    filter((l) => l.permitNumber === permitNumber).
    map((l) => {
      const hasDispute = allFlags.some(
        (f) => f.permitNumber === permitNumber && f.loadId === l.loadId && f.status === 'Under Review'
      );
      const loadStatus = hasDispute ? 'Dispute' :
      ['COMPLETED', 'UNLOADED'].includes(l.currentStage) ? 'Cleared' : 'Pending';
      const perLoadRate = permit ?
      Math.round((permit.paymentSummary?.totalAmount ?? 0) / Math.max(permit.paymentSummary?.totalLoads ?? 1, 1)) :
      0;
      return { ...l, paymentStatus: loadStatus, amount: perLoadRate, date: l.createdAt ? new Date(l.createdAt) : new Date() };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allLoads, allFlags, permitNumber, permit]);

  const siteName = useMemo(() => {
    const mine = mines.find((m) => m.routes.some((r) => r.permitNumber === permitNumber));
    return mine?.name ?? permit?.route.from ?? '—';
  }, [mines, permit, permitNumber]);

  const activeLoad = permitLoads[0] ?? null;

  function stageBadgeText(stage) {
    if (['COMPLETED', 'UNLOADED'].includes(stage)) return 'Completed';
    if (['LOADING', 'LOADED'].includes(stage)) return 'In Transit';
    return 'Active';
  }

  const totalAmount = permit?.paymentSummary?.totalAmount ?? 0;
  const totalLoads = permit?.paymentSummary?.totalLoads ?? permitLoads.length;
  const completedLoads = permit?.paymentSummary?.completedLoads ?? permitLoads.filter((l) => l.paymentStatus === 'Cleared').length;
  // Only allow approval if permit is completed (all loads completed)
  const allLoadsCompleted = permitLoads.length > 0 && permitLoads.every((l) => ['COMPLETED', 'UNLOADED'].includes(l.currentStage));
  const needsApproval = permit?.paymentStatus === 'Pending Approval' && allLoadsCompleted;
  const isCleared = permit?.paymentStatus === 'Cleared';

  /* ── Approve handler ─────────────────── */
  const handleApprove = async () => {
    setUpdating(true);
    try {
      await updatePaymentStatus(permitNumber, 'Cleared');
      refreshAll();
      setApproveSuccess(true);
    } catch (e) {
      alert(e.message || 'Failed to approve');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Dispute handler ─────────────────── */
  const handleDispute = async () => {
    setUpdating(true);
    try {
      await updatePaymentStatus(permitNumber, 'Dispute');
      refreshAll();
    } catch (e) {
      alert(e.message || 'Failed to dispute');
    } finally {
      setUpdating(false);
      setDisputeModal(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* ── Back ──────────────────────────── */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Payments
      </button>

      {loading || !activeLoad ?
      <div className="text-sm text-neutral-400">Loading…</div> :

      <>
          {/* ── Approval banner ────────────── */}
          {needsApproval && !approveSuccess &&
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900">Payment Approval Required</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    The desktop operator has requested payment clearance of <span className="font-bold">₹{formatINR(totalAmount)}</span> for permit {permitNumber}.
                    Review the load details below and approve to release funds.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                  onClick={handleApprove}
                  disabled={updating}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  
                      <CheckCircle size={15} /> Approve Payment
                    </button>
                    <button
                  onClick={() => setDisputeModal(true)}
                  disabled={updating}
                  className="px-5 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                  
                      Raise Dispute
                    </button>
                  </div>
                </div>
              </div>
            </div>
        }

          {/* ── Approved toast ──────────────── */}
          {(approveSuccess || isCleared) &&
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-green-800">Payment Approved</div>
                <div className="text-xs text-green-600 mt-0.5">Permit {permitNumber} — ₹{formatINR(totalAmount)} cleared</div>
              </div>
            </div>
        }

          {/* ── Load header card ────────────── */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{activeLoad.loadId}</h1>
                <p className="text-sm text-neutral-500 mt-0.5">{activeLoad.truckNumber}</p>
              </div>
              <span className={`px-3 py-1.5 rounded text-xs font-semibold ${STATUS_BADGE[stageBadgeText(activeLoad.currentStage)] || 'bg-neutral-100 text-neutral-600'}`}>
                {stageBadgeText(activeLoad.currentStage)}
              </span>
            </div>
            <div className="border-t border-neutral-100 pt-3 space-y-0">
              <InfoRow label="Transporter" value={permit?.route.from ?? '—'} />
              <InfoRow label="Site" value={siteName} />
              <InfoRow label="Material" value={permit?.material ?? '—'} />
              <InfoRow label="Tonnage" value={`${permit?.remainingTonnage ?? 0} MT`} />
              <InfoRow label="Amount" value={`₹${formatINR(totalAmount)}`} />
              <InfoRow label="Loads" value={`${completedLoads} / ${totalLoads}`} />
              <InfoRow label="Payment Status" value={permit?.paymentStatus ?? '—'} />
              <InfoRow label="Schedule" value={formatDate(activeLoad.date)} />
            </div>
          </div>

          {/* ── Progress timeline ──────────── */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-bold text-neutral-900 mb-5">Progress</h2>
            <ProgressTimeline currentStage={activeLoad.currentStage} loadDate={activeLoad.date} />
          </div>

          {/* ── Map placeholder ─────────────── */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 flex items-center justify-center min-h-[160px]">
            <div className="text-center text-neutral-400">
              <MapPin size={32} className="mx-auto mb-2 text-neutral-300" />
              <div className="text-sm">Location tracking</div>
              <div className="text-xs mt-0.5">{permit?.route.from} → {permit?.route.to}</div>
            </div>
          </div>

          {/* ── Activity Timeline ──────────── */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-bold text-neutral-900 mb-5">Activity Timeline</h2>
            <ActivityTimeline currentStage={activeLoad.currentStage} loadDate={activeLoad.date} />
          </div>

          {/* ── All Loads table ─────────────── */}
          {permitLoads.length > 0 &&
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">All Loads Under {permitNumber}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{permitLoads.length} loads total</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {permitLoads.map((load) =>
            <div key={load.loadId} className="px-6 py-3 flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${load.paymentStatus === 'Cleared' ? 'bg-green-100' : load.paymentStatus === 'Dispute' ? 'bg-red-100' : 'bg-neutral-100'}`}>
                      <Truck size={16} className={load.paymentStatus === 'Cleared' ? 'text-green-600' : load.paymentStatus === 'Dispute' ? 'text-red-500' : 'text-neutral-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-neutral-900">{load.loadId}</div>
                      <div className="text-xs text-neutral-500">{load.truckNumber} · {load.currentStage}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_BADGE[load.paymentStatus] || 'bg-neutral-100 text-neutral-600'}`}>
                      {load.paymentStatus}
                    </span>
                    <div className="text-sm font-bold text-neutral-900">₹{formatINR(load.amount)}</div>
                  </div>
            )}
              </div>
            </div>
        }

          {/* ── Flag alert ──────────────────── */}
          {activeLoad.hasFlag &&
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Active Flag</h3>
                  <p className="text-xs text-red-600">This load has been flagged for review.</p>
                </div>
              </div>
            </div>
        }

          {/* ── Bottom actions ──────────────── */}
          <div className="flex gap-3">
            {needsApproval && !approveSuccess ?
          <>
                <button onClick={handleApprove} disabled={updating}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <CheckCircle size={16} /> Approve Payment
                </button>
                <button onClick={() => setDisputeModal(true)} disabled={updating}
            className="flex-1 bg-white border-2 border-red-300 text-red-700 py-3 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                  Raise Dispute
                </button>
              </> :

          <>
                <button onClick={() => onNavigateToPermit(permitNumber)}
            className="flex-1 bg-white border border-neutral-200 text-neutral-700 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors">
                  View Full Permit
                </button>
                <button onClick={onBack}
            className="flex-1 bg-white border border-neutral-200 text-neutral-700 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors">
                  Back to Payments
                </button>
              </>
          }
          </div>

          {/* ── Dispute confirmation modal ──── */}
          {disputeModal &&
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setDisputeModal(false)}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-neutral-900">Raise Dispute</h3>
                  <button onClick={() => setDisputeModal(false)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-neutral-500 mb-4">
                  This will mark permit <span className="font-bold text-neutral-800">{permitNumber}</span> as <span className="font-bold text-red-600">Dispute</span> and prevent payment clearance until resolved.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleDispute} disabled={updating}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                    Confirm Dispute
                  </button>
                  <button onClick={() => setDisputeModal(false)}
              className="flex-1 bg-white border border-neutral-300 text-neutral-700 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        }
        </>
      }
    </div>);

}