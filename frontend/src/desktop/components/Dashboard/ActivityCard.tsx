import { ChevronRight, Truck, AlertTriangle, CheckCircle } from 'lucide-react';

interface ActivityCardProps {
    loadId: string;
    truckNumber: string;
    permitNumber: string;
    currentStage: string;
    hasFlag: boolean;
    onClick: () => void;
}

const STAGE_STYLES: Record<string, { bg: string; text: string; icon?: typeof Truck }> = {
    LOADING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Truck },
    LOADED: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    TAGGED: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    UNLOADED: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
    COMPLETED: { bg: 'bg-neutral-50 border-neutral-200', text: 'text-neutral-700', icon: CheckCircle },
    CREATED: { bg: 'bg-neutral-50 border-neutral-200', text: 'text-neutral-500' },
};

export function ActivityCard({ loadId, truckNumber, permitNumber, currentStage, hasFlag, onClick }: ActivityCardProps) {
    const style = STAGE_STYLES[currentStage] || STAGE_STYLES.CREATED;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${style.bg}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-neutral-900">{loadId}</span>
                        {hasFlag && (
                            <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                <AlertTriangle size={10} /> Flag
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-neutral-600 mb-2">
                        <span className="font-medium">Truck</span> {truckNumber} · <span className="font-medium">Permit</span> {permitNumber}
                    </div>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${style.text} bg-white/60`}>
                        {currentStage}
                    </span>
                </div>
                <ChevronRight size={16} className="text-neutral-400 mt-1 shrink-0" />
            </div>
        </button>
    );
}
