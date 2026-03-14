import { ArrowLeft } from 'lucide-react';
import { TrucksView } from './views/TrucksView';
import { TruckOwnersView } from './views/TruckOwnersView';
import { DriversView } from './views/DriversView';
import { PastPermitsView } from './views/PastPermitsView';
import { PastLoadsView } from './views/PastLoadsView';
import { DocumentsView } from './views/DocumentsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

export type MenuView = 'main' | 'trucks' | 'truck-owners' | 'drivers' | 'past-permits' | 'past-loads' | 'documents' | 'profile' | 'settings';

const VIEW_TITLES: Record<MenuView, string> = {
  main: 'Menu',
  trucks: 'Trucks',
  'truck-owners': 'Truck Owners',
  drivers: 'Drivers',
  'past-permits': 'Past Permits',
  'past-loads': 'Past Loads',
  documents: 'Documents',
  profile: 'Organization Details',
  settings: 'Settings',
};

interface SubViewProps {
  view: MenuView;
  onBack: () => void;
  onNavigateToPermit: (pn: string) => void;
}

export function SubView({ view, onBack, onNavigateToPermit }: SubViewProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Menu
      </button>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">{VIEW_TITLES[view]}</h1>
      {view === 'trucks' && <TrucksView />}
      {view === 'truck-owners' && <TruckOwnersView />}
      {view === 'drivers' && <DriversView />}
      {view === 'past-permits' && <PastPermitsView onNavigateToPermit={onNavigateToPermit} />}
      {view === 'past-loads' && <PastLoadsView />}
      {view === 'documents' && <DocumentsView />}
      {view === 'profile' && <ProfileView />}
      {view === 'settings' && <SettingsView />}
    </div>
  );
}
