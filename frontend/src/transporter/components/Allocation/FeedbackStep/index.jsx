import { Check, X } from 'lucide-react';







export function FeedbackStep({ count, onActiveTags, onNew }) {
  return (
    <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-5">Real-time Feedback</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2"><Check size={16} /><span className="font-semibold text-sm">Success</span></div>
                    <div className="text-sm text-green-700 font-medium">{count} trucks tagged</div>
                    <ul className="text-xs text-green-600 mt-2 space-y-1">
                        <li>• Load IDs generated</li><li>• DOs issued (per load)</li><li>• Static QR codes generated</li>
                    </ul>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2"><X size={16} /><span className="font-semibold text-sm">Failures</span></div>
                    <div className="text-xs text-neutral-400">None</div>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onActiveTags} className="px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">View Active Tags</button>
                <button onClick={onNew} className="px-5 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">Start New Allocation</button>
            </div>
        </div>);

}