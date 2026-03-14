import { AlertTriangle, Truck } from 'lucide-react';

interface ActiveLoadsTableProps {
    loads: {
        loadId: string;
        truckNumber: string;
        currentStage: string;
        hasFlag: boolean;
    }[];
}

export function ActiveLoadsTable({ loads }: ActiveLoadsTableProps) {
    return (
        <table className="w-full">
            <thead><tr className="bg-neutral-50 border-b border-neutral-100">
                {['Truck', 'Load ID', 'Current Stage', 'Flag'].map(h => (
                    <th key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wide text-left px-5 py-3">{h}</th>
                ))}
            </tr></thead>
            <tbody>
                {loads.map(load => (
                    <tr key={load.loadId} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                        <td className="px-5 py-3.5 text-sm font-semibold text-neutral-900"><span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-neutral-400" />{load.truckNumber}</span></td>
                        <td className="px-5 py-3.5 text-xs font-mono text-neutral-500">{load.loadId}</td>
                        <td className="px-5 py-3.5">
                            <span className="bg-neutral-100 text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded-full">{load.currentStage}</span>
                        </td>
                        <td className="px-5 py-3.5">
                            {load.hasFlag && (
                                <div className="flex items-center gap-1.5">
                                    <AlertTriangle size={14} className="text-amber-500" />
                                    <span className="text-xs text-amber-600 font-medium">Flagged</span>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}