import { useState } from 'react';
import { Search, ChevronRight, Truck, User, FileText, Building, Settings, Bell, Users, FolderOpen } from 'lucide-react';
import { SubView } from './SubView';





const SECTIONS = [
{
  title: 'DIRECTORY', items: [
  { id: 'trucks', icon: Truck, label: 'Trucks', sub: 'Fleet directory' },
  { id: 'truck-owners', icon: User, label: 'Truck Owners', sub: 'Owner records' },
  { id: 'drivers', icon: Users, label: 'Drivers', sub: 'Driver directory' }]

},
{
  title: 'RECORDS', items: [
  { id: 'past-permits', icon: FileText, label: 'Past Permits', sub: 'Historical permits' },
  { id: 'past-loads', icon: FileText, label: 'Loads', sub: 'All loads — create, update, delete' },
  { id: 'documents', icon: FolderOpen, label: 'Documents', sub: 'Driver & truck documents' }]

},
{
  title: 'TRANSPORTER PROFILE', items: [
  { id: 'profile', icon: Building, label: 'Organization Details', sub: 'View company info' }]

},
{
  title: 'SETTINGS', items: [
  { id: 'settings', icon: Bell, label: 'Notifications', sub: 'Manage alerts' },
  { id: 'settings', icon: Settings, label: 'I3MS Sync Status', sub: 'Last sync: 2 mins ago' }]

}];


export function Menu({ onNavigateToPermit }) {
  const [currentView, setCurrentView] = useState('main');
  const [search, setSearch] = useState('');

  if (currentView !== 'main') {
    return <SubView view={currentView} onBack={() => setCurrentView('main')} onNavigateToPermit={onNavigateToPermit} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Menu</h1>
          <p className="text-sm text-neutral-500 mt-1">Directory, records & settings</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search records..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {SECTIONS.map((section) =>
        <div key={section.title}>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">{section.title}</div>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {section.items.map((item, i) =>
            <button key={i} onClick={() => setCurrentView(item.id)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0 text-left">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <item.icon size={17} className="text-neutral-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">{item.label}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{item.sub}</div>
                  </div>
                  <ChevronRight className="text-neutral-300 shrink-0" size={18} />
                </button>
            )}
            </div>
          </div>
        )}
      </div>
    </div>);

}