import { useState } from 'react';
import { Check, Truck as TruckIcon } from 'lucide-react';
import { createTag } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';

interface TagTrucksStepProps {
    permitNumber: string;
    capacity: number;
    tagged: string[];
    onToggle: (id: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function TagTrucksStep({ permitNumber, capacity, tagged, onToggle, onNext, onBack }: TagTrucksStepProps) {
    const { approvedTrucks: trucks, loading, refreshAll } = useSync();
    const [issuing, setIssuing] = useState(false);
    const [error, setError] = useState('');

    if (loading) return <div className="text-sm text-neutral-400 py-8">Loading trucks…</div>;

    const handleIssue = async () => {
        setIssuing(true); setError('');
        try {
            await Promise.all(tagged.map(truckNumber => createTag({ permitNumber, truckNumber })));
            await refreshAll();
            onNext();
        } catch (e: any) { setError(e.message || 'Failed to create tags'); }
        finally { setIssuing(false); }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">Tag Trucks</h2>
            <p className="text-sm text-neutral-500 mb-2">Select pre-approved trucks · {tagged.length}/{capacity} slots filled</p>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-5">
                <div className="bg-neutral-900 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (tagged.length / capacity) * 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
                {(trucks ?? []).length === 0 && (