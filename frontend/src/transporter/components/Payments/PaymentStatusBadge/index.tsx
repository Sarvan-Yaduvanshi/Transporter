interface PaymentStatusBadgeProps {
    status: string;
}

const STYLES: Record<string, string> = {
    'Ready': 'bg-green-100 text-green-700 border border-green-200',
    'Pending': 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Dispute': 'bg-red-100 text-red-600 border border-red-200',
    'Cleared': 'bg-green-600 text-white',
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    return (
        <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${STYLES[status] || 'bg-neutral-100 text-neutral-600'}`}>
            {status}
        </span>
    );
}