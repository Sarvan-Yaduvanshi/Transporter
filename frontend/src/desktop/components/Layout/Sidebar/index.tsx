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
            <nav className="flex-1 py-6 px-2 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activePage === item.id ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>
            {/* Profile/Logout */}
            <div className="px-5 py-4 border-t border-neutral-100 flex items-center gap-3">
                <button
                    className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                    onClick={onOpenProfile}
                >
                    <UserCog size={14} /> Profile
                </button>
                <button
                    className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors ml-auto"
                    onClick={logout}
                >
                    <LogOut size={14} /> Logout
                </button>
            </div>
        </aside>
    );
}
