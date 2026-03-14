import { useState, useMemo } from 'react';
import {
    ChevronRight, Truck, FileText, Banknote, Loader2,
} from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { updatePaymentStatus } from '@/services/api';

interface PaymentListProps {
    onViewInvoice: (permitNumber: string) => void;
}

type TabType = 'permits' | 'trucks';

const TX_STATUS_STYLES: Record<string, string> = {
    Paid: 'bg-green-100 text-green-700 border border-green-200',
    Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    Dispute: 'bg-red-100 text-red-600 border border-red-200',
    'In Progress': 'bg-neutral-100 text-neutral-500 border border-neutral-200',
    'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200',
    Cleared: 'bg-green-100 text-green-700 border border-green-200',
};

interface Transaction {
    _id: string;
    loadId: string;
    truckNumber: string;
    permitNumber: string;
    status: string;
    amount: number;
    date: Date;
    currentStage: string;
}

function formatINR(n: number): string { return n.toLocaleString('en-IN'); }

function useTransactions() {
    const { permits, loads, trucks, flags, loading } = useSync();

    return useMemo(() => {
        // ...rest of the code...
    }, [permits, loads, trucks, flags, loading]);
}
// ...rest of the code...
