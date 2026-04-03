import { useMemo } from 'react';



import { useSync } from '@/hooks/SyncContext';








const TX_STATUS_STYLES = {
  Paid: 'bg-green-100 text-green-700 border border-green-200',
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  Dispute: 'bg-red-100 text-red-600 border border-red-200',
  'In Progress': 'bg-neutral-100 text-neutral-500 border border-neutral-200',
  'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200',
  Cleared: 'bg-green-100 text-green-700 border border-green-200'
};












function formatINR(n) {return n.toLocaleString('en-IN');}

function useTransactions() {
  const { permits, loads, trucks, flags, loading } = useSync();

  return useMemo(() => {

    // ...rest of the code...
  }, [permits, loads, trucks, flags, loading]);}
// ...rest of the code...