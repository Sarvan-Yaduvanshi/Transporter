import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, CheckCircle, ArrowUpCircle, X, Plus, ShieldAlert } from 'lucide-react';
import { updateFlag, createFlag, deleteFlag } from '@/services/api';

interface DisputesPanelProps {
  flags: {
    _id: string;
    permitNumber?: string;
    loadId: string;
    reason: string;
    status: string;
  }[];
  permitNumber?: string;
  onRefresh?: () => void;
}

const STATUS_STYLE: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  'Under Review': { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', text: 'text-amber-900' },
  Resolved: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', text: 'text-green-900' },
  Escalated: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', text: 'text-red-900' },
};

export function DisputesPanel({ flags, permitNumber, onRefresh }: DisputesPanelProps) {
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [newFlag, setNewFlag] = useState({ loadId: '', reason: '' });
  const [error, setError] = useState('');
  const [withdrawConfirmId, setWithdrawConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const handleUpdateStatus = async (flagId: string, status: string) => {
    setBusy(flagId);
    setActionError('');
    try { await updateFlag(flagId, { status }); onRefresh?.(); }
    catch (e: any) { setActionError(e.message || 'Failed to update flag'); }
    finally { setBusy(null); }
  };

  const handleWithdraw = async (flagId: string) => {
    setBusy(flagId);
    setActionError('');
    try { await deleteFlag(flagId); setWithdrawConfirmId(null); onRefresh?.(); }
    catch (e: any) { setActionError(e.message || 'Failed to withdraw flag'); }
    finally { setBusy(null); }
  };

  const handleRaise = async () => {
    if (!newFlag.loadId.trim() || !newFlag.reason.trim()) { setError('Load ID and reason are required'); return; }
    if (!permitNumber) { setError('Permit number unknown'); return; }
    setBusy('new');
    try {
      await createFlag({ permitNumber, loadId: newFlag.loadId.trim(), reason: newFlag.reason.trim() });
      setShowRaiseForm(false); setNewFlag({ loadId: '', reason: '' }); setError(''); onRefresh?.();
    } catch (e: any) { setError(e.message || 'Failed to raise flag'); }
    finally { setBusy(null); }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-4">Disputes / Flags</h2>
      <p className="text-xs text-neutral-400 mb-3">Non-blocking flags — resolve, escalate, or raise new ones</p>

      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg px-3 py-2 mb-3">
          <AlertTriangle size={12} className="shrink-0" /> {actionError}
        </div>
      )}

      {flags.length > 0 ? (
        <div className="space-y-3 mb-4">
          {flags.map(flag => {
            const style = STATUS_STYLE[flag.status] || STATUS_STYLE['Under Review'];
            const isWithdrawing = withdrawConfirmId === flag._id;
            return (
              <div key={flag._id} className={`${style.bg} border ${style.border} rounded-lg p-3.5 transition-all`}>
                {isWithdrawing ? (
                  /* ── Withdraw Confirmation Inline ── */
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <ShieldAlert size={16} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">Withdraw this flag?</div>
                        <p className="text-xs text-neutral-500 mt-1">
                          This will permanently remove the flag on <span className="font-semibold">"{flag.reason}"</span> for load {flag.loadId}. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <button onClick={() => handleWithdraw(flag._id)} disabled={busy === flag._id}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {busy === flag._id ? 'Withdrawing…' : 'Yes, Withdraw'}
                      </button>
                      <button onClick={() => setWithdrawConfirmId(null)}
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal Flag Card ── */
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className={`${style.icon} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${style.text}`}>{flag.reason}</div>
                      <div className="text-xs text-neutral-500 mt-1">Load: {flag.loadId} · Status: <span className="font-semibold">{flag.status}</span></div>
                      {flag.status === 'Under Review' && user?.role === 'Transporter' && (
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => handleUpdateStatus(flag._id, 'Resolved')} disabled={busy === flag._id}
                            className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50">
                            <CheckCircle size={13} /> Resolve
                          </button>
                        </div>
                      )}
                      {flag.status === 'Escalated' && user?.role === 'Transporter' && (
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => handleUpdateStatus(flag._id, 'Resolved')} disabled={busy === flag._id}
                            className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50">
                            <CheckCircle size={13} /> Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-neutral-400 mb-4">No active flags</div>
      )}

      {/* Raise Flag form (only for non-drivers) */}
      {user?.role !== 'Driver' && (
        showRaiseForm ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-800">Raise a New Flag</span>
              <button onClick={() => { setShowRaiseForm(false); setError(''); }} className="text-neutral-400 hover:text-neutral-700"><X size={16} /></button>
            </div>
            <input value={newFlag.loadId} onChange={e => setNewFlag(f => ({ ...f, loadId: e.target.value }))}
              placeholder="Load ID (e.g. L-2024-001)" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
            <textarea value={newFlag.reason} onChange={e => setNewFlag(f => ({ ...f, reason: e.target.value }))}
              placeholder="Reason for flag…" rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleRaise} disabled={busy === 'new'}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors">
              {busy === 'new' ? 'Submitting…' : 'Submit Flag'}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowRaiseForm(true)}
            className="flex items-center gap-2 px-5 py-2 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors">
            <Plus size={15} /> Raise Flag
          </button>
        )
      )}
    </div>
  );
}
