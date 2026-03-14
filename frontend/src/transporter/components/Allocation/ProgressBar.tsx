import { Check } from 'lucide-react';
interface ProgressBarProps {
  steps: string[];
  currentStepIndex: number;
}
export function ProgressBar({ steps, currentStepIndex }: ProgressBarProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-0">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= currentStepIndex ? 'text-neutral-900' : 'text-neutral-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < currentStepIndex ? 'bg-neutral-900 text-white' : i === currentStepIndex ? 'bg-neutral-900 text-white ring-4 ring-neutral-200' : 'bg-neutral-100 text-neutral-400'
                }`}>
                {i < currentStepIndex ? <Check size={13} /> : i + 1}
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < currentStepIndex ? 'bg-neutral-900' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}
