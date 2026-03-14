import { useState, useMemo } from 'react';
import {
    ChevronRight, Search, AlertTriangle, Truck,
    Package, ArrowRight, Loader2, ArrowDownToLine, Banknote,
    MapPin, Hash, ArrowUpRight,
} from 'lucide-react';
import { useSync } from '@/hooks/SyncContext';
import { updateLoad } from '@/services/api';

interface LoadsListProps {
    onViewLoad: (loadId: string) => void;
    onViewInvoice: (permitNumber: string) => void;
}

const FLOW_STEPS = ['IN_TRANSIT', 'LOADING', 'UNLOADING', 'PAYMENT'] as const;
type FlowStep = typeof FLOW_STEPS[number];

const FLOW_META: Record<FlowStep, { label: string; color: string; bg: string; border: string; icon: any; bgCard: string; accent: string; btnBg: string; btnHover: string; hoverBorder: string }> = {
    IN_TRANSIT: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Truck, bgCard: 'from-blue-50 to-white', accent: 'bg-blue-500', btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20', btnHover: 'hover:border-blue-300 hover:bg-blue-50/50', hoverBorder: 'hover:border-blue-200' },
    LOADING: { label: 'Loading', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ArrowDownToLine, bgCard: 'from-amber-50 to-white', accent: 'bg-amber-500', btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20', btnHover: 'hover:border-amber-300 hover:bg-amber-50/50', hoverBorder: 'hover:border-amber-200' },
    UNLOADING: { label: 'Unloading', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: Package, bgCard: 'from-violet-50 to-white', accent: 'bg-violet-500', btnBg: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20', btnHover: 'hover:border-violet-300 hover:bg-violet-50/50', hoverBorder: 'hover:border-violet-200' },
    PAYMENT: { label: 'Payment', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: Banknote, bgCard: 'from-green-50 to-white', accent: 'bg-green-500', btnBg: 'bg-green-600 hover:bg-green-700 shadow-green-600/20', btnHover: 'hover:border-green-300 hover:bg-green-50/50', hoverBorder: 'hover:border-green-200' },
};

function toFlowStep(backendStage: string): FlowStep {
    switch (backendStage) {
        case 'CREATED': case 'TAGGED': return 'IN_TRANSIT';
        case 'LOADING': return 'LOADING';
        case 'LOADED': case 'UNLOADED': return 'UNLOADING';
        case 'COMPLETED': return 'PAYMENT';
        default: return 'IN_TRANSIT';
    }
}

function flowStepToBackend(step: FlowStep): string {
    switch (step) {
        case 'IN_TRANSIT': return 'TAGGED';
        // ...rest of the code...
    }
}
// ...rest of the code...
