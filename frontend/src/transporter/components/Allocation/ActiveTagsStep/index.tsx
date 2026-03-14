import { ArrowLeft, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { deleteTag, updateTag } from '@/services/api';
import { useSync } from '@/hooks/SyncContext';

interface ActiveTagsStepProps {
    onBack: () => void;
    onNavigate: (permitNumber: string) => void;
}

export function ActiveTagsStep({ onBack, onNavigate }: ActiveTagsStepProps) {
    const { tags: tagsData, loading, refreshAll } = useSync();
    const [busy, setBusy] = useState<string | null>(null);

    const tags = (tagsData ?? []).map(t => ({
        _id: t._id,
        truckNumber: t.truckNumber,
        permitNumber: t.permitNumber,
        status: t.status,
        expiryHours: Math.max(1, Math.round((new Date(t.createdAt).getTime() + 8 * 3600000 - Date.now()) / 3600000)),
    }));

    const handleCancel = async (id: string) => {
        setBusy(id);
        try { await updateTag(id, { status: 'Cancelled' }); refreshAll(); }
        catch (e: any) { alert(e.message || 'Failed to cancel tag'); }
        finally { setBusy(null); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently remove this tag?')) return;
        setBusy(id);
        try { await deleteTag(id); refreshAll(); }
        catch (e: any) { alert(e.message || 'Failed to remove tag'); }
        finally { setBusy(null); }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-4 transition-colors">