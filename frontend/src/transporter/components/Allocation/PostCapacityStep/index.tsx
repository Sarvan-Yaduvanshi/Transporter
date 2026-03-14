interface PostCapacityStepProps {
    permitNumber: string;
    capacity: string;
    onChange: (v: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PostCapacityStep({ permitNumber, capacity, onChange, onNext, onBack }: PostCapacityStepProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">Post Capacity</h2>
            <p className="text-sm text-neutral-500 mb-5">Define how many load slots to create for {permitNumber}</p>
            <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Number of load slots</label>
                <input type="number" value={capacity} onChange={e => onChange(e.target.value)} placeholder="e.g. 10"
                    className="w-full max-w-xs px-4 py-2.5 border border-neutral-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-500" />
                <p className="text-xs text-neutral-400 mt-2">Creates a capacity pool — no real loads generated yet</p>
            </div>
            <div className="flex gap-3">
                <button onClick={onBack} className="px-5 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Back</button>
                <button onClick={onNext} disabled={!capacity || parseInt(capacity) <= 0}
                    className="px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium disabled:bg-neutral-300 disabled:text-neutral-400 hover:bg-neutral-800 transition-colors">
                    Next: Tag Trucks
                </button>
            </div>
        </div>
    );
}