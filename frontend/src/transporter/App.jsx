import { useState } from 'react';
import { Home } from './components/Home';
import { Allocation } from './components/Allocation';
import { Payments } from './components/Payments';
import { Menu } from './components/Menu';
import { PermitView } from './components/PermitView';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Activity, Package, DollarSign, Menu as MenuIcon, Truck, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';




const NAV_ITEMS = [
{ id: 'home', label: 'Live Operations', icon: Activity },
{ id: 'allocation', label: 'Allocation', icon: Package },
{ id: 'payments', label: 'Payments', icon: DollarSign },
{ id: 'menu', label: 'Menu', icon: MenuIcon }];


const TAB_LABELS = {
  home: 'Live Operations', allocation: 'Allocation', payments: 'Payments', menu: 'Menu'
};





export default function TransporterApp({ onSwitchToDriver }) {
  const { user, logout } = useAuth();
  const [viewState, setViewState] = useState({ tab: 'home' });
  const navigateToTab = (tab) => setViewState({ tab });
  const navigateToPermit = (permitNumber) => setViewState({ tab: viewState.tab, permitView: permitNumber });
  const navigateBack = () => setViewState({ tab: viewState.tab });
  const openProfile = () => setViewState((prev) => ({ ...prev, showProfile: true }));
  const closeProfile = () => setViewState((prev) => ({ ...prev, showProfile: false }));

  return (
    <div className="flex flex-col h-screen bg-neutral-100 overflow-hidden" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

            {/* FULL-WIDTH TOP HEADER */}
            <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-neutral-900">{TAB_LABELS[viewState.tab]}</span>
                    {viewState.permitView &&
          <><ChevronRight size={14} className="text-neutral-400" />
                            <span className="font-semibold text-neutral-900">Permit {viewState.permitView}</span></>
          }
                    {viewState.showProfile &&
          <><ChevronRight size={14} className="text-neutral-400" />
                            <span className="font-semibold text-neutral-900">Profile</span></>
          }
                </div>
                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                    <span className="text-sm text-neutral-500 font-medium">I3MS Live</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col shrink-0">
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0">
                            <Truck size={15} className="text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-neutral-900 leading-tight">TransportOps</div>
                            <div className="text-xs text-neutral-400">Transporter Console</div>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-0.5">
                        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-3 mb-3">Navigation</div>
                        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = viewState.tab === id && !viewState.permitView;
              return (
                <button key={id} onClick={() => navigateToTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`
                }>
                                    <Icon size={17} className={active ? 'text-white' : 'text-neutral-400'} />
                                    {label}
                                </button>);

            })}
                    </nav>

                    {onSwitchToDriver &&
          <div className="px-3 pb-2">
                            <button onClick={onSwitchToDriver}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all">
                                <ChevronRight size={14} /> Switch to Driver
                            </button>
                        </div>
          }

                    <div className="px-4 py-3 border-t border-neutral-100">
                        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-neutral-50 cursor-pointer" onClick={openProfile}>
                            {user?.avatar ?
              <img src={user.avatar} alt={user.name}
              className="w-7 h-7 rounded-full object-cover shrink-0 bg-neutral-100" /> :

              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white shrink-0">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              }
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-neutral-900 truncate">{user?.name || 'User'}</div>
                                <div className="text-[10px] text-neutral-400 truncate">{user?.nickname ? `"${user.nickname}" · ${user.role}` : user?.role || 'Driver'}</div>
                            </div>
                            <button onClick={(e) => {e.stopPropagation();logout();}} title="Sign out"
              className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors">
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto">
                        {viewState.showProfile ?
            <ProfilePage onBack={closeProfile} /> :
            viewState.permitView ?
            <PermitView permitNumber={viewState.permitView} onBack={navigateBack} onNavigateToPayments={() => setViewState({ tab: 'payments' })} /> :
            <>
                                    {viewState.tab === 'home' && <Home onNavigateToPermit={navigateToPermit} onNavigateToPayments={() => navigateToTab('payments')} />}
                                    {viewState.tab === 'allocation' && <Allocation onNavigateToPermit={navigateToPermit} />}
                                    {viewState.tab === 'payments' && <Payments onNavigateToPermit={navigateToPermit} />}
                                    {viewState.tab === 'menu' && <Menu onNavigateToPermit={navigateToPermit} />}
                                </>
            }
                    </main>
                </div>
            </div>
        </div>);

}