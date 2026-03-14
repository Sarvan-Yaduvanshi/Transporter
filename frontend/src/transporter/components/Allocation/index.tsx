import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { SelectPermitStep } from './SelectPermitStep';
import { PostCapacityStep } from './PostCapacityStep';
import { TagTrucksStep } from './TagTrucksStep';
import { FeedbackStep } from './FeedbackStep';
import { ActiveTagsStep } from './ActiveTagsStep';
import { PermitSidebar } from './PermitSidebar';

interface AllocationProps {
  onNavigateToPermit: (permitNumber: string) => void;
}

type AllocationStep = 'select-permit' | 'post-capacity' | 'tag-trucks' | 'feedback' | 'active-tags';

const STEP_LABELS = ['Select Permit', 'Post Capacity', 'Tag Trucks', 'Issue DO & QR'];
const STEP_KEYS: AllocationStep[] = ['select-permit', 'post-capacity', 'tag-trucks', 'feedback'];

export function Allocation({ onNavigateToPermit }: AllocationProps) {
  const [step, setStep] = useState<AllocationStep>('select-permit');
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [capacity, setCapacity] = useState('');
  const [taggedTrucks, setTaggedTrucks] = useState<string[]>([]);

  const reset = () => {
    setStep('select-permit');
    setSelectedPermit(null);
    setCapacity('');
    setTaggedTrucks([]);
  };

  const stepIdx = STEP_KEYS.indexOf(step);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Allocation</h1>
        <p className="text-sm text-neutral-500 mt-1">Permit → Capacity → Tag → Issue DO & QR</p>
      </div>

      <ProgressBar steps={STEP_LABELS} currentStepIndex={stepIdx} />

      {/* Step content — 2-column layout */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          {step === 'select-permit' && (
            <SelectPermitStep onSelect={p => { setSelectedPermit(p); setStep('post-capacity'); }} />
          )}
          {step === 'post-capacity' && selectedPermit && (
            <PostCapacityStep permitNumber={selectedPermit} capacity={capacity} onChange={setCapacity}
              onNext={() => setStep('tag-trucks')} onBack={reset} />
          )}
          {step === 'tag-trucks' && selectedPermit && (
            <TagTrucksStep permitNumber={selectedPermit} capacity={parseInt(capacity)} tagged={taggedTrucks}
              onToggle={id => setTaggedTrucks(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
              onNext={() => setStep('feedback')} onBack={() => setStep('post-capacity')} />
          )}
          {step === 'feedback' && (
            <FeedbackStep count={taggedTrucks.length} onActiveTags={() => setStep('active-tags')} onNew={reset} />
          )}
          {step === 'active-tags' && (
            <ActiveTagsStep onBack={() => setStep('feedback')} onNavigate={onNavigateToPermit} />
          )}
        </div>

        <PermitSidebar selectedPermit={selectedPermit} step={step} taggedTrucks={taggedTrucks} />
      </div>
    </div>
  );
}
