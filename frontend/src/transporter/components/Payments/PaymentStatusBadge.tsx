interface PaymentStatusBadgeProps {
  status: string;
}
const STYLES: Record<string, string> = {
  'Ready': 'bg-green-100 text-green-700 border border-green-200',
  'Pending': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Pending Approval': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Dispute': 'bg-red-100 text-red-600 border border-red-200',
  'Cleared': 'bg-green-100 text-green-700 border border-green-200',
  'Paid': 'bg-blue-100 text-blue-700 border border-blue-200',
  'In Progress': 'bg-neutral-100 text-neutral-500 border border-neutral-200',
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${STYLES[status] || 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
      {status}
    </span>
  );
}
