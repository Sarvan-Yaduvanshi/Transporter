import { useState, useMemo } from 'react';
import {
  ArrowLeft, Truck, MapPin, AlertTriangle, CheckCircle, Clock,
  FileText, ShieldCheck, Package, ArrowRight,
  Loader2, ArrowDownToLine, Banknote, Send, Hash, ShieldAlert } from
'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { updateLoad, updatePaymentStatus, createFlag, updateFlag, deleteFlag } from '@/services/api';







/* ── 4-Step Flow ───────────────────────── */
const FLOW_STEPS = ['IN_TRANSIT', 'LOADING', 'UNLOADING', 'PAYMENT'];


const FLOW_META = {
  IN_TRANSIT: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Truck, gradient: 'from-blue-500 to-blue-600', accent: 'bg-blue-500' },
  LOADING: { label: 'Loading', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ArrowDownToLine, gradient: 'from-amber-500 to-amber-600', accent: 'bg-amber-500' },
  UNLOADING: { label: 'Unloading', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: Package, gradient: 'from-violet-500 to-violet-600', accent: 'bg-violet-500' },
  PAYMENT: { label: 'Payment', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: Banknote, gradient: 'from-green-500 to-green-600', accent: 'bg-green-500' }
};

function toFlowStep(backendStage) {
  switch (backendStage) {
    case 'CREATED':case 'TAGGED':return 'IN_TRANSIT';
    case 'LOADING':return 'LOADING';
    case 'LOADED':case 'UNLOADED':return 'UNLOADING';
    case 'COMPLETED':return 'PAYMENT';
    default:return 'IN_TRANSIT';
  }
}

function flowStepToBackend(step) {
  switch (step) {
    case 'IN_TRANSIT':return 'TAGGED';
    case 'LOADING':return 'LOADING';
    case 'UNLOADING':return 'UNLOADED';
    case 'PAYMENT':return 'COMPLETED';
  }
}

function getNextFlowStep(current) {
  const idx = FLOW_STEPS.indexOf(current);
  return idx >= 0 && idx < FLOW_STEPS.length - 1 ? FLOW_STEPS[idx + 1] : null;
}

function formatINR(n) {return n.toLocaleString('en-IN');}

/* ── Horizontal 4-Step Flow Bar ──────── */
function FlowBar({ currentStep }) {
  const currentIdx = FLOW_STEPS.indexOf(currentStep);
  return (
    <div className="flex items-start">
            {FLOW_STEPS.map((step, i) => {
        const meta = FLOW_META[step];
        const Icon = meta.icon;
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex items-start flex-1 last:flex-initial">
                        {/* Step node + label */}
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDone ?
              'bg-green-500 shadow-lg shadow-green-500/25' :
              isCurrent ?
              `bg-gradient-to-br ${meta.gradient} shadow-lg` :
              'bg-neutral-100 border-2 border-neutral-200'}`
              }>
                                {isDone ?
                <CheckCircle size={26} className="text-white" /> :
                <Icon size={26} className={isCurrent ? 'text-white' : 'text-neutral-400'} />
                }
                            </div>
                            <span className={`text-xs font-bold mt-3 tracking-wide ${isDone ? 'text-green-600' : isCurrent ? meta.color : 'text-neutral-400'}`
              }>{meta.label}</span>
                        </div>
                        {/* Connector line */}
                        {i < FLOW_STEPS.length - 1 &&
            <div className="flex-1 flex items-center pt-8 px-2">
                                <div className={`h-0.5 w-full rounded-full ${i < currentIdx ? 'bg-green-400' : 'bg-neutral-200'}`
              } />
                            </div>
            }
                    </div>);

      })}
        </div>);

}

export function LoadDetails({ loadId, onBack, onViewInvoice }) {
  const { loads, permits, flags, mines, loading: syncLoading, refreshAll } = useSync();
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [reportModal, setReportModal] = useState(false);
  const [withdrawConfirmId, setWithdrawConfirmId] = useState(null);

  const load = loads.find((l) => l.loadId === loadId) ?? null;
  const permit = load ? permits.find((p) => p.permitNumber === load.permitNumber) ?? null : null;
  const loadFlags = useMemo(() => flags.filter((f) => f.permitNumber === load?.permitNumber && f.loadId === loadId && f.status === 'Under Review'), [flags, load, loadId]);

  const showToast = (msg) => {setToast(msg);setTimeout(() => setToast(null), 3000);};

  if (syncLoading && !load) {
    return (
      <div className="p-8">
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-neutral-400 mr-3" size={20} />
                    <span className="text-sm text-neutral-400">Loading…</span>
                </div>
            </div>);

  }
  if (!load) {
    return (
      <div className="p-8">
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="text-center py-20 text-neutral-400">Load not found</div>
            </div>);

  }

  const flowStep = toFlowStep(load.currentStage);
  const nextFlowStep = getNextFlowStep(flowStep);
  const isPaymentState = flowStep === 'PAYMENT';
  const flowMeta = FLOW_META[flowStep];
  const FlowIcon = flowMeta.icon;

  /* Permit-level load stats */
  const permitLoads = loads.filter((l) => l.permitNumber === load.permitNumber);
  const completedCount = permitLoads.filter((l) => toFlowStep(l.currentStage) === 'PAYMENT').length;
  const totalAmount = permit?.paymentSummary?.totalAmount ?? 0;
  const totalLoads = permit?.paymentSummary?.totalLoads ?? permitLoads.length;

  /* ── Advance to next flow step ───────── */
  const handleAdvance = async () => {
    if (!nextFlowStep) return;
    setUpdating(true);
    try {
      const nextBackendStage = flowStepToBackend(nextFlowStep);
      await updateLoad(load.loadId, { currentStage: nextBackendStage });
      await refreshAll();
      showToast(`Status updated to ${FLOW_META[nextFlowStep].label}`);
    } catch {showToast('Failed to update status');} finally
    {setUpdating(false);}
  };

  /* ── Send for transporter approval ──── */
  const handleSendForApproval = async () => {
    if (!permit) return;
    setUpdating(true);
    try {
      await updatePaymentStatus(permit.permitNumber, 'Pending Approval');
      await refreshAll();
      showToast('Sent for transporter approval');
    } catch {showToast('Failed to send for approval');} finally
    {setUpdating(false);}
  };

  /* ── Contextual hint texts ──────────── */
  const flowHints = {
    IN_TRANSIT: 'Truck is on its way to the loading site',
    LOADING: 'Truck is being loaded at the mine',
    UNLOADING: 'Truck is unloading at destination',
    PAYMENT: 'Load completed — ready for payment processing'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
            {/* Toast */}
            {toast &&
      <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium border border-neutral-700">
                    {toast}
                </div>
      }

            {/* Back */}
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 mb-6 transition-colors group">
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" /> Back to Loads
            </button>

            {/* ── Hero Header Card ──────────── */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6 shadow-sm relative overflow-hidden">
                {/* Subtle accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${flowMeta.accent} rounded-l-2xl`} />

                <div className="flex items-start justify-between pl-3">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${flowMeta.gradient} flex items-center justify-center shadow-lg`}>
                            <FlowIcon size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">{load.truckNumber}</h1>
                                <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${flowMeta.bg} ${flowMeta.color} ${flowMeta.border} border`}>
                                    {flowMeta.label}
                                </span>
                                {load.hasFlag &&
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg font-semibold">
                                        <AlertTriangle size={11} /> Flagged
                                    </span>
                }
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-neutral-400"><Hash size={10} /> <span className="font-mono">{load.loadId}</span></span>
                                <span className="text-neutral-200">·</span>
                                <span className="text-xs text-neutral-400">{load.permitNumber}</span>
                            </div>
                            {/* Route context */}
                            {permit?.route &&
              <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 px-2.5 py-1.5 rounded-lg">
                                        <MapPin size={11} className="text-neutral-400 shrink-0" />
                                        <span className="font-medium">{permit.route.from}</span>
                                        <ArrowRight size={10} className="text-neutral-300" />
                                        <span className="font-medium">{permit.route.to}</span>
                                    </div>
                                    {permit.material &&
                <span className="text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-1.5 rounded-lg font-medium">
                                            {permit.material}
                                        </span>
                }
                                </div>
              }
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPaymentState &&
            <button onClick={() => onViewInvoice(load.permitNumber)}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm">
                                <FileText size={16} /> View Invoice
                            </button>
            }
                    </div>
                </div>
            </div>

            {/* ── 4-Step Flow Bar ────────────── */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Status Flow</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">{flowHints[flowStep]}</p>
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-lg">
                        Step {FLOW_STEPS.indexOf(flowStep) + 1} of {FLOW_STEPS.length}
                    </span>
                </div>
                <FlowBar currentStep={flowStep} />
            </div>



            {/* Main content: 2-col */}
            <div className="grid grid-cols-3 gap-6">
                {/* ── LEFT COLUMN ──────────────── */}
                <div className="col-span-2 space-y-6">
                    {/* Load + Permit info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-4">Load Information</h3>
                            <div className="space-y-3">
                                {[
                { icon: Truck, label: 'Truck', value: load.truckNumber },
                { icon: FileText, label: 'Load ID', value: load.loadId },
                { icon: Clock, label: 'Status', value: flowMeta.label },
                { icon: MapPin, label: 'Permit', value: load.permitNumber }].
                map((r) =>
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                        <div className="flex items-center gap-2.5 text-sm text-neutral-500"><r.icon size={14} className="text-neutral-400" />{r.label}</div>
                                        <span className="text-sm font-semibold text-neutral-900">{r.value}</span>
                                    </div>
                )}
                            </div>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-4">Permit Details</h3>
                            {!permit ?
              <div className="text-sm text-neutral-400">Loading…</div> :

              <div className="space-y-3">
                                    {[
                { icon: MapPin, label: 'Route', value: `${permit.route.from} → ${permit.route.to}` },
                { icon: Package, label: 'Material', value: permit.material },
                { icon: Truck, label: 'Remaining', value: `${permit.remainingTonnage}T` },
                { icon: Clock, label: 'Status', value: permit.status }].
                map((r) =>
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <div className="flex items-center gap-2.5 text-sm text-neutral-500"><r.icon size={14} className="text-neutral-400" />{r.label}</div>
                                            <span className="text-sm font-semibold text-neutral-900">{r.value}</span>
                                        </div>
                )}
                                </div>
              }
                        </div>
                    </div>

                    {/* Permit loads */}
                    {permitLoads.length > 0 &&
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-neutral-100">
                                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Permit Loads</h3>
                                <p className="text-xs text-neutral-400 mt-0.5">{permitLoads.length} total · {completedCount} in payment</p>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {permitLoads.map((l) => {
                const isCurrent = l.loadId === load.loadId;
                const lStep = toFlowStep(l.currentStage);
                const lMeta = FLOW_META[lStep];
                const lFlag = flags.some((f) => f.loadId === l.loadId && f.status === 'Under Review');
                return (
                  <div key={l._id} className={`flex items-center gap-4 px-5 py-3 ${isCurrent ? 'bg-neutral-50' : ''}`}>
                                            <Truck size={14} className="text-neutral-400 shrink-0" />
                                            <span className="text-sm font-medium text-neutral-700 w-28">{l.truckNumber}</span>
                                            <span className="text-xs text-neutral-400 w-24">{l.loadId}</span>
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${lMeta.bg} ${lMeta.color}`}>
                                                {lMeta.label}
                                            </span>
                                            {lFlag && <span className="flex items-center gap-1 text-xs text-red-500 ml-auto"><AlertTriangle size={12} /> Flagged</span>}
                                            {isCurrent && <span className="text-[10px] text-neutral-400 ml-auto uppercase tracking-wider font-semibold">Current</span>}
                                        </div>);

              })}
                            </div>
                        </div>
          }

                    {/* Flags / disputes */}
                    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-neutral-100">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Disputes / Flags</h3>
                            <p className="text-xs text-neutral-400 mt-0.5">Issues on this load</p>
                        </div>
                        <div className="p-4 space-y-3">
                            {loadFlags.length === 0 ?
              <div className="text-sm text-neutral-400 text-center py-4">No active flags</div> :
              loadFlags.map((flag) =>
              <div key={flag._id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 transition-all">
                                    {withdrawConfirmId === flag._id ? (
                /* ── Withdraw Confirmation ── */
                <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <ShieldAlert size={15} className="text-amber-600 mt-0.5 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-semibold text-neutral-900">Withdraw this flag?</div>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        This will permanently remove the flag <span className="font-semibold">"{flag.reason}"</span> for load {flag.loadId}. This cannot be undone.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pl-5">
                                                <button
                      onClick={async () => {try {await deleteFlag(flag._id);setWithdrawConfirmId(null);await refreshAll();showToast('Flag withdrawn');} catch {showToast('Failed to withdraw');}}}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">
                      
                                                    Yes, Withdraw
                                                </button>
                                                <button onClick={() => setWithdrawConfirmId(null)}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>) : (

                /* ── Normal Flag Card ── */
                <div className="flex items-start gap-2">
                                            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-800">{flag.reason}</div>
                                                <div className="text-xs text-neutral-500 mt-0.5">Load: {flag.loadId} · Status: <span className="font-semibold">{flag.status}</span></div>
                                                {flag.status === 'Under Review' &&
                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                        onClick={async () => {try {await updateFlag(flag._id, { status: 'Escalated' });await refreshAll();showToast('Flag escalated');} catch {showToast('Failed to escalate');}}}
                        className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-md transition-colors">
                        
                                                            Escalate
                                                        </button>
                                                        <button
                        onClick={() => setWithdrawConfirmId(flag._id)}
                        className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded-md transition-colors">
                        
                                                            Withdraw
                                                        </button>
                                                    </div>
                    }
                                                {flag.status === 'Escalated' &&
                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                        onClick={async () => {try {await updateFlag(flag._id, { status: 'Resolved' });await refreshAll();showToast('Flag resolved');} catch {showToast('Failed to resolve');}}}
                        className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1 rounded-md transition-colors">
                        
                                                            Resolve
                                                        </button>
                                                        <button
                        onClick={() => setWithdrawConfirmId(flag._id)}
                        className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded-md transition-colors">
                        
                                                            Withdraw
                                                        </button>
                                                    </div>
                    }
                                            </div>
                                        </div>)
                }
                                </div>
              )}
                            {/* Only allow raising flags in Loading, In Transit, or Unloading stages */}
                            {(flowStep === 'LOADING' || flowStep === 'IN_TRANSIT' || flowStep === 'UNLOADING') &&
              <button
                onClick={() => setReportModal(true)}
                className="flex items-center gap-2 text-sm font-semibold bg-neutral-900 text-white px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors">
                
                                    + Raise Flag
                                </button>
              }
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (sidebar) ───── */}
                <div className="space-y-6">

                    {/* Vertical 4-step flow */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-1">Status Flow</h3>
                        <p className="text-[10px] text-neutral-400 mb-4">In Transit → Loading → Unloading → Payment</p>
                        <div className="space-y-1">
                            {FLOW_STEPS.map((step, i) => {
                const meta = FLOW_META[step];
                const Icon = meta.icon;
                const currentIdx = FLOW_STEPS.indexOf(flowStep);
                const isDone = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={step} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isCurrent ? `bg-gradient-to-r ${meta.bg} ${meta.border} border` :
                  isDone ? 'bg-green-50 border border-green-100' :
                  'bg-neutral-50 border border-transparent'}`
                  }>
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${isCurrent ? `bg-gradient-to-br ${meta.gradient} text-white shadow-sm` :
                    isDone ? 'bg-green-500 text-white' :
                    'bg-neutral-200 text-neutral-400'}`
                    }>{isDone ? <CheckCircle size={14} /> : <Icon size={14} />}</span>
                                        <div>
                                            <span className={`text-sm font-semibold ${isCurrent ? meta.color : isDone ? 'text-green-700' : 'text-neutral-400'}`}>
                                                {meta.label}
                                            </span>
                                            {isCurrent && <div className="text-[10px] text-neutral-500 mt-0.5">Current status</div>}
                                        </div>
                                    </div>);

              })}
                        </div>
                    </div>

                    {/* Update Status Action Card */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-3">Update Status</h3>
                        {nextFlowStep ?
            <div>
                                <p className="text-xs text-neutral-400 mb-3">
                                    Current: <span className={`font-semibold ${flowMeta.color}`}>{flowMeta.label}</span>
                                </p>
                                <button
                disabled={updating}
                onClick={handleAdvance}
                className={`w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 shadow-sm ${FLOW_META[nextFlowStep].label === 'Payment' ?
                'bg-green-600 hover:bg-green-700 shadow-green-600/20' :
                'bg-neutral-900 hover:bg-neutral-800 shadow-neutral-900/20'}`
                }>
                
                                    {updating ?
                <Loader2 size={14} className="animate-spin" /> :

                <>
                                            <ArrowRight size={16} />
                                            Move to {FLOW_META[nextFlowStep].label}
                                        </>
                }
                                </button>
                                <p className="text-[10px] text-neutral-400 mt-2 text-center">
                                    {flowHints[flowStep]}
                                </p>
                            </div> :

            <div className="text-center py-2">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                                    <Banknote size={20} className="text-green-600" />
                                </div>
                                <p className="text-sm font-semibold text-neutral-700">Ready for Payment</p>
                                <p className="text-xs text-neutral-400 mt-1">Load completed — proceed with payment</p>
                            </div>
            }
                    </div>

                    {/* Payment Summary + Approval */}
                    {permit &&
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-4">Payment Summary</h3>
                            <div className="text-2xl font-bold text-neutral-900 mb-1">₹{formatINR(totalAmount)}</div>
                            <p className="text-xs text-neutral-400 mb-4">total permit amount</p>
                            <div className="space-y-2">
                                {[
              { label: 'Total loads', value: totalLoads.toString(), color: 'text-neutral-900' },
              { label: 'In Payment', value: completedCount.toString(), color: 'text-green-600' },
              { label: 'Pending', value: (totalLoads - completedCount).toString(), color: 'text-amber-600' }].
              map((s) =>
              <div key={s.label} className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">{s.label}</span>
                                        <span className={`font-semibold ${s.color}`}>{s.value}</span>
                                    </div>
              )}
                            </div>

                            {/* Payment status badge */}
                            {permit.paymentStatus &&
            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Payment Status</span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${permit.paymentStatus === 'Cleared' ? 'bg-green-100 text-green-700 border border-green-200' :
              permit.paymentStatus === 'Pending Approval' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
              permit.paymentStatus === 'Dispute' ? 'bg-red-100 text-red-600 border border-red-200' :
              'bg-neutral-100 text-neutral-600 border border-neutral-200'}`
              }>{permit.paymentStatus}</span>
                                </div>
            }

                            {/* Apply for Approval — only in Payment state */}
                            {isPaymentState && permit.paymentStatus !== 'Pending Approval' && permit.paymentStatus !== 'Cleared' &&
            <div className="mt-4 pt-4 border-t border-neutral-100">
                                    <div className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1.5">
                                        <CheckCircle size={12} /> All loads completed — eligible for payment
                                    </div>
                                    <button
                onClick={handleSendForApproval}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 shadow-sm shadow-amber-500/30">
                
                                        {updating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        Apply for Approval
                                    </button>
                                    <p className="text-[10px] text-neutral-400 mt-2 text-center">
                                        Sends to transporter for payment approval
                                    </p>
                                </div>
            }
                            {permit.paymentStatus === 'Pending Approval' &&
            <div className="mt-4 pt-4 border-t border-neutral-100">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                                        <div>
                                            <div className="text-xs font-semibold text-amber-800">Awaiting Transporter Approval</div>
                                            <div className="text-[10px] text-amber-600 mt-0.5">Payment will be cleared once approved</div>
                                        </div>
                                    </div>
                                </div>
            }
                            {permit.paymentStatus === 'Cleared' &&
            <div className="mt-4 pt-4 border-t border-neutral-100 ">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                                        <CheckCircle size={14} className="text-green-600 shrink-0" />
                                        <div>
                                            <div className="text-xs font-semibold text-green-800">Payment Approved & Cleared</div>
                                            <div className="text-[10px] text-green-600 mt-0.5">Funds have been released</div>
                                        </div>
                                    </div>
                                </div>
            }
                        </div>
          }
                </div>
            </div>

            {/* ── Report Issue Modal ───────────── */}
            {reportModal &&
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setReportModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-neutral-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle size={18} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Report Issue</h3>
                                <p className="text-xs text-neutral-400">Flag a problem with {load.loadId}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {['Weight mismatch', 'Documentation issue', 'Delay at loading', 'Vehicle breakdown', 'Other'].map((reason) =>
            <button key={reason} onClick={async () => {
              try {
                await createFlag({ permitNumber: load.permitNumber, loadId: load.loadId, reason });
                await refreshAll();
                showToast('Flag raised successfully');
              } catch {showToast('Failed to raise flag');}
              setReportModal(false);
            }}
            className="w-full text-left px-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-px transition-all flex items-center gap-3 group">
              
                                    <div className="w-7 h-7 rounded-lg bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                                        <AlertTriangle size={13} className="text-red-400" />
                                    </div>
                                    {reason}
                                </button>
            )}
                        </div>
                        <button onClick={() => setReportModal(false)} className="w-full mt-4 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors py-2">Cancel</button>
                    </div>
                </div>
      }
        </div>);

}