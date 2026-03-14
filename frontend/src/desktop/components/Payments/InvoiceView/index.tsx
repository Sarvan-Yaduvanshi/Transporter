import { useState, useMemo } from 'react';
import {
    ArrowLeft, AlertCircle, CheckCircle, Truck, MapPin,
    Clock, FileText, AlertTriangle, X, ShieldCheck,
} from 'lucide-react';
import { updatePaymentStatus } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';

interface InvoiceViewProps {
    permitNumber: string;
    onBack: () => void;
}

const STAGE_ORDER = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];
const STAGE_LABELS: Record<string, string> = {
    CREATED: 'Assigned',
    TAGGED: 'Tagged',
    LOADING: 'Loading',
    LOADED: 'Loaded',
    UNLOADED: 'Unloaded',
    COMPLETED: 'Completed',
};

const STATUS_BADGE: Record<string, string> = {
    Cleared: 'bg-green-100 text-green-700 border border-green-200',
    Dispute: 'bg-red-100 text-red-600 border border-red-200',
    Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    'In Transit': 'bg-amber-600 text-white',
    Completed: 'bg-green-600 text-white',
    Active: 'bg-amber-600 text-white',
};

function formatINR(n: number): string {
    return n.toLocaleString('en-IN');
}

function formatDate(d: Date): string {
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
// ...rest of the code...
