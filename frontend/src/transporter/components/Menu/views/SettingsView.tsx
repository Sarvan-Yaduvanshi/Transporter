import { useState, useMemo } from 'react';
import { useSync } from '@/hooks/SyncContext';

export function SettingsView() {
  const { lastUpdated, refreshAll } = useSync();
  const [toggles, setToggles] = useState({ loads: true, payments: true, disputes: true });
  const [syncing, setSyncing] = useState(false);

  const lastSyncLabel = useMemo(() => {
    if (!lastUpdated) return 'Never';
    const diff = Math.round((Date.now() - new Date(lastUpdated).getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(lastUpdated).toLocaleTimeString();
  }, [lastUpdated]);

  const handleForceSync = async () => {
    setSyncing(true);
    try { await refreshAll(); } finally { setSyncing(false); }
  };

  return (
    <div className="grid grid-cols-2 gap-6 max-w-3xl">
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Notifications</h3>
        {[
          { key: 'loads' as const, label: 'Load status updates' },
          { key: 'payments' as const, label: 'Payment notifications' },
          { key: 'disputes' as const, label: 'Dispute alerts' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
            <span className="text-sm text-neutral-700">{label}</span>
            <button onClick={() => setToggles(p => ({ ...p, [key]: !p[key] }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${toggles[key] ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${toggles[key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">I3MS Sync</h3>
        <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-green-400" /><span className="text-sm text-neutral-700">Active</span></div>
        <div className="text-xs text-neutral-400 mb-4">Last sync: {lastSyncLabel}</div>
        <button onClick={handleForceSync} disabled={syncing}
          className="w-full bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">
          {syncing ? 'Syncing…' : 'Force Sync Now'}
        </button>
      </div>
    </div>
  );
}
