import { useState } from 'react';
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
        // ...rest of the code...
    };
    // ...rest of the code...
}