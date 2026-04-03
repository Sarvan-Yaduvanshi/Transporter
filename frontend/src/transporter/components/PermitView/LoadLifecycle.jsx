



export function LoadLifecycle({ stages, currentStageIndex }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-4">Load Lifecycle</h2>
      <p className="text-xs text-neutral-400 mb-3">Read-only · I3MS authority</p>
      <div className="space-y-2">
        {stages.map((stage, i) =>
        <div key={stage} className={`flex items-center gap-3 p-2.5 rounded-lg ${i === currentStageIndex ? 'bg-neutral-900' : i < currentStageIndex ? 'bg-neutral-50' : 'bg-neutral-50 opacity-50'}`
        }>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === currentStageIndex ? 'bg-white text-neutral-900' : i < currentStageIndex ? 'bg-neutral-900 text-white' : 'border-2 border-neutral-300 text-neutral-400'}`
          }>{i + 1}</div>
            <span className={`text-xs font-semibold ${i === currentStageIndex ? 'text-white' : i < currentStageIndex ? 'text-neutral-700' : 'text-neutral-400'}`
          }>{stage}</span>
          </div>
        )}
      </div>
    </div>);

}