import {
    LayoutDashboard,
    Package,
    DollarSign,
    Truck,
    ChevronRight,
    LogOut,
    UserCog,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export type DesktopPage = 'dashboard' | 'loads' | 'payments' | 'trucks';

interface SidebarProps {
    activePage: DesktopPage;
    onNavigate: (page: DesktopPage) => void;
    onSwitchToTransporter?: () => void;
    onOpenProfile?: () => void;
}

const NAV_ITEMS: { id: DesktopPage; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Fleet Overview', icon: LayoutDashboard },
    { id: 'loads', label: 'Loads', icon: Package },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'trucks', label: 'My Fleet', icon: Truck },
];

export function Sidebar({ activePage, onNavigate, onSwitchToTransporter, onOpenProfile }: SidebarProps) {
    const { user, logout } = useAuth();
    return (
        <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col shrink-0">
            {/* Brand */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0">
                    <Truck size={15} className="text-white" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-neutral-900 leading-tight">TransportOps</div>
                    <div className="text-xs text-neutral-400">Driver Console</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-3 mb-3">
                    Navigation
                </div>
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                    const active = activePage === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onNavigate(id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                ? 'bg-neutral-900 text-white'
                                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                }`}
                        >
                            <Icon size={17} className={active ? 'text-white' : 'text-neutral-400'} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Switch to Transporter UI */}
            {onSwitchToTransporter && (
                <div className="px-3 pb-2">
                    <button
                        onClick={onSwitchToTransporter}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all"
                    >
                        <ChevronRight size={14} /> Switch to Transporter
                    </button>
                </div>
            )}

            {/* User */}
            <div className="px-4 py-3 border-t border-neutral-100">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-neutral-50 cursor-pointer" onClick={onOpenProfile}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0 bg-neutral-100" />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-900 truncate">{user?.name || 'User'}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{user?.nickname ? `"${user.nickname}" · ${user.role}` : user?.role || 'Driver'}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); logout(); }} title="Sign out"
                        className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors">
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
