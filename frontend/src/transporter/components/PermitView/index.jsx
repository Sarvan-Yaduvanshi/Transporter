import { ArrowLeft } from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';

import { PermitHeader } from './PermitHeader';
import { ActiveLoadsTable } from './ActiveLoadsTable';
import { DisputesPanel } from './DisputesPanel';
import { LoadLifecycle } from './LoadLifecycle';
import { PaymentSummaryCard } from './PaymentSummaryCard';







const STAGES = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];

export function PermitView({ permitNumber, onBack, onNavigateToPayments }) {
  const { getPermitFull, loading, refreshAll } = useSync();
  const permit = getPermitFull(permitNumber);
  const currentStageIdx = permit ? STAGES.indexOf(permit.activeLoads[0]?.currentStage || 'CREATED') : 0;

  if (loading) {
    return <div className="p-8 text-sm text-neutral-400">Loading permit…</div>;
  }

  if (!permit) {
    return (
      <div style={{ padding: '3rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5em', fontFamily: 'var(--font-ui)', color: 'var(--color-muted)', fontSize: '1rem', marginBottom: '2rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
          
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '1.1rem' }}>Permit not found</div>
      </div>);

  }

  const headerStats = [
  { label: 'Total Loads', value: permit.paymentSummary.totalLoads },
  { label: 'Completed', value: permit.paymentSummary.completedLoads },
  { label: 'Pending', value: permit.paymentSummary.pendingLoads },
  { label: 'Remaining Tonnage', value: `${permit.remainingTonnage}T` }];


  return (
    <div style={{ padding: '3rem', maxWidth: '1100px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5em', fontFamily: 'var(--font-ui)', color: 'var(--color-muted)', fontSize: '1rem', marginBottom: '2rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
        
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Left column */}
        <div>
          <PermitHeader
            permitNumber={permit.permitNumber}
            route={permit.route}
            material={permit.material}
            status={permit.status}
            stats={headerStats} />
          

          <ActiveLoadsTable loads={permit.activeLoads} />

          <div className="mt-6">
            <DisputesPanel flags={permit.flags} permitNumber={permit.permitNumber} onRefresh={refreshAll} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <LoadLifecycle stages={STAGES} currentStageIndex={currentStageIdx} />

          <PaymentSummaryCard
            totalAmount={permit.paymentSummary.totalAmount}
            totalLoads={permit.paymentSummary.totalLoads}
            completedLoads={permit.paymentSummary.completedLoads}
            pendingLoads={permit.paymentSummary.pendingLoads}
            onNavigateToPayments={onNavigateToPayments} />
          
        </div>
      </div>
    </div>);

}