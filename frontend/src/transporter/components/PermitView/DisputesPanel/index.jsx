import { useState } from 'react';

import { updateFlag } from '@/services/api';













const STATUS_STYLE = {
  'Under Review': { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', text: 'text-amber-900' },
  Resolved: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', text: 'text-green-900' },
  Escalated: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', text: 'text-red-900' }
};

export function DisputesPanel({ flags, permitNumber, onRefresh }) {
  const [busy, setBusy] = useState(null);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [newFlag, setNewFlag] = useState({ loadId: '', reason: '' });
  const [error, setError] = useState('');
  const [withdrawConfirmId, setWithdrawConfirmId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleUpdateStatus = async (flagId, status) => {
    setBusy(flagId);
    setActionError('');
    try {await updateFlag(flagId, { status });onRefresh?.();}
    catch (e) {setActionError(e.message || 'Failed to update flag');} finally
    {setBusy(null);}
  };

  const handleWithdraw = async (flagId) => {
    setBusy(flagId);
    // ...rest of the code...
  };
  // ...rest of the code...
}