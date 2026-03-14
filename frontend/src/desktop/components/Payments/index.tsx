import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PaymentList } from './PaymentList';
import { InvoiceView } from './InvoiceView';
// Updated imports to use subfolders
// import { PaymentList } from './PaymentList/index';
// import { InvoiceView } from './InvoiceView/index';

interface PaymentsPageProps {
    /** If set, open this permit's invoice directly (e.g. from Loads → View Invoice) */
    initialPermit?: string | null;
    onClearInitialPermit?: () => void;
}

export function PaymentsPage({ initialPermit, onClearInitialPermit }: PaymentsPageProps) {
    const [selectedPermit, setSelectedPermit] = useState<string | null>(initialPermit ?? null);

    // Sync with external initialPermit prop
    useEffect(() => {
        if (initialPermit) setSelectedPermit(initialPermit);
    }, [initialPermit]);

    const handleViewInvoice = (permitNumber: string) => setSelectedPermit(permitNumber);

    const handleBack = () => {
        setSelectedPermit(null);
        onClearInitialPermit?.();
    };

    return (
        <div className="relative h-full">
            {/* Payment list always visible */}
            <PaymentList onViewInvoice={handleViewInvoice} />

            {/* Slide-over panel */}
            {selectedPermit && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                        onClick={handleBack}
                    />

                    {/* Panel */}
                    <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-neutral-50 shadow-2xl z-50 overflow-y-auto animate-slide-in">
                        {/* Close button */}
                        <button
                            onClick={handleBack}
                            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <InvoiceView permitNumber={selectedPermit} onBack={handleBack} />
                    </div>
                </>
            )}
        </div>
    );
}
