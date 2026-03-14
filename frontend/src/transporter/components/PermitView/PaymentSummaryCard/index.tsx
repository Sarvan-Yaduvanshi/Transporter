interface PaymentSummaryCardProps {
    totalAmount: number;
    totalLoads: number;
    completedLoads: number;
    pendingLoads: number;
    onNavigateToPayments: () => void;
}

export function PaymentSummaryCard({ totalAmount, totalLoads, completedLoads, pendingLoads, onNavigateToPayments }: PaymentSummaryCardProps) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-4">Payment Summary</h2>
            <div className="text-2xl font-bold text-neutral-900">₹{totalAmount.toLocaleString()}</div>
            <div className="text-xs text-neutral-400 mt-0.5">total amount</div>
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Total loads</span>
                    <span className="font-semibold text-neutral-800">{totalLoads}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Completed</span>
                    <span className="font-semibold text-green-600">{completedLoads}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Pending</span>
                    <span className="font-semibold text-amber-600">{pendingLoads}</span>
                </div>
            </div>
            <button onClick={onNavigateToPayments} className="w-full mt-4 bg-neutral-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors">
                Go to Payments
            </button>
        </div>
    );
}