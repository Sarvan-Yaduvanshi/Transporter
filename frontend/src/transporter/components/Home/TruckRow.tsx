import { ChevronRight, Truck } from 'lucide-react';
interface TruckRowProps {
  truckNumber: string;
  permit: string;
  badge?: string;
  onClick: () => void;
}

export function TruckRow({ truckNumber, permit, badge, onClick }: TruckRowProps) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-neutral-50 border border-neutral-200 rounded-lg p-3 hover:bg-neutral-100 hover:border-neutral-300 transition-all mb-2 flex justify-between items-center">
      <div>
        <div className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5"><Truck size={14} className="text-neutral-400" />Truck {truckNumber}</div>
        <div className="text-xs text-neutral-500 mt-0.5">Permit {permit}</div>
      </div>
      {badge
        ? <span className="bg-neutral-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">{badge}</span>
        : <ChevronRight size={15} className="text-neutral-400" />}
    </button>
  );
}
