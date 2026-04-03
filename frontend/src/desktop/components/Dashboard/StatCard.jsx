







export function StatCard({ label, value, sub, color, dot }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</div>
                    <div className="text-3xl font-bold text-neutral-900 mt-1">{value}</div>
                    <div className="text-xs text-neutral-400 mt-1">{sub}</div>
                </div>
                {dot &&
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>●</span>
        }
            </div>
        </div>);

}