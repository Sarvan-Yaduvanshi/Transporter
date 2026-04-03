import { useState, useCallback } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard';
import { LoadsList } from './components/LoadDetails/LoadsList';
import { LoadDetails } from './components/LoadDetails';
import { PaymentsPage } from './components/Payments';
import { TrucksPage } from './components/Trucks';
import { PermitView } from '../transporter/components/PermitView';
import { ProfilePage } from '../pages/ProfilePage';

/**
 * View state for the desktop navigation.
 * Supports sub-views like load detail, invoice, and truck health.
 */








const PAGE_LABELS = {
  dashboard: 'Fleet Overview',
  loads: 'Loads',
  payments: 'Payments',
  trucks: 'My Fleet'
};





export default function DriverApp({ onSwitchToTransporter }) {
  const [view, setView] = useState({ page: 'dashboard' });

  /* ── Navigation helpers ────────────────────────────── */
  const navigateTo = useCallback((page) => {
    setView({ page });
  }, []);

  /** Dashboard → Load Detail */
  const viewLoad = useCallback(
    (loadId) => {
      setView({ page: 'loads', loadId });
    },
    []
  );

  /** Loads → Payment Invoice (or Load Detail → View Invoice) */
  const viewInvoice = useCallback(
    (permitNumber) => {
      setView({ page: 'payments', invoicePermit: permitNumber });
    },
    []
  );

  /** Dashboard → Permit Detail */
  const viewPermit = useCallback(
    (permitNumber) => {
      setView((prev) => ({ ...prev, permitNumber }));
    },
    []
  );

  /** Back from permit detail */
  const backFromPermit = useCallback(() => {
    setView((prev) => ({ ...prev, permitNumber: null }));
  }, []);

  /** Open / close profile */
  const openProfile = useCallback(() => {
    setView((prev) => ({ ...prev, showProfile: true }));
  }, []);
  const closeProfile = useCallback(() => {
    setView((prev) => ({ ...prev, showProfile: false }));
  }, []);

  /** Back from load detail to either dashboard or loads list */
  const backFromLoad = useCallback(() => {
    setView((prev) => ({ page: prev.page, loadId: null }));
  }, []);

  /* ── Breadcrumbs ──────────────────────────────────── */
  const breadcrumbs = [{ label: PAGE_LABELS[view.page], onClick: view.loadId || view.invoicePermit || view.permitNumber || view.showProfile ? () => navigateTo(view.page) : undefined }];
  if (view.showProfile) breadcrumbs.push({ label: 'Profile' });
  if (view.loadId) breadcrumbs.push({ label: `Load ${view.loadId}` });
  if (view.invoicePermit) breadcrumbs.push({ label: `Invoice ${view.invoicePermit}` });
  if (view.permitNumber && !view.loadId && !view.invoicePermit) breadcrumbs.push({ label: `Permit ${view.permitNumber}` });

  /* ── Render content ───────────────────────────────── */
  function renderContent() {
    // Profile page
    if (view.showProfile) {
      return <ProfilePage onBack={closeProfile} />;
    }

    // Permit detail sub-view
    if (view.permitNumber && !view.loadId && !view.invoicePermit) {
      return (
        <PermitView
          permitNumber={view.permitNumber}
          onBack={backFromPermit}
          onNavigateToPayments={() => viewInvoice(view.permitNumber)} />);


    }

    // Load detail sub-view (from dashboard or loads)
    if (view.loadId) {
      return (
        <LoadDetails
          loadId={view.loadId}
          onBack={backFromLoad}
          onViewInvoice={viewInvoice} />);


    }

    switch (view.page) {
      case 'dashboard':
        return <Dashboard onViewLoad={viewLoad} onViewPermit={viewPermit} />;
      case 'loads':
        return <LoadsList onViewLoad={viewLoad} onViewInvoice={viewInvoice} />;
      case 'payments':
        return (
          <PaymentsPage
            initialPermit={view.invoicePermit}
            onClearInitialPermit={() => setView((v) => ({ ...v, invoicePermit: null }))} />);


      case 'trucks':
        return <TrucksPage />;
      default:
        return <Dashboard onViewLoad={viewLoad} onViewPermit={viewPermit} />;
    }
  }

  return (
    <div
      className="flex h-screen bg-neutral-100 overflow-hidden"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      
            {/* Sidebar */}
            <Sidebar
        activePage={view.page}
        onNavigate={navigateTo}
        onSwitchToTransporter={onSwitchToTransporter}
        onOpenProfile={openProfile} />
      

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header breadcrumbs={breadcrumbs} />
                <main className="flex-1 overflow-y-auto">{renderContent()}</main>
            </div>
        </div>);

}