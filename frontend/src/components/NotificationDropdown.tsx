import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellOff, CheckCheck, AlertTriangle, DollarSign, Info, Clock, X } from 'lucide-react';
import {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    type AppNotification,
} from '@/services/api';

type TimeFilter = 6 | 12 | 24 | null;

const TYPE_META: Record<string, { icon: typeof Bell; bg: string; iconColor: string }> = {
    payment: { icon: DollarSign, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    flag: { icon: AlertTriangle, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    system: { icon: Info, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

const FILTER_OPTIONS: { label: string; value: TimeFilter }[] = [
    { label: 'All', value: null },
    { label: '6h', value: 6 },
    { label: '12h', value: 12 },
    { label: '24h', value: 24 },
];

export function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<TimeFilter>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Poll unread count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await getUnreadCount();
                setUnread(data.count);
            } catch { /* silent */ }
        };
        fetchCount();
        const id = setInterval(fetchCount, 30000);
        return () => clearInterval(id);
    }, []);

    // Fetch notifications when opened or filter changes
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNotifications(filter ?? undefined);
            setNotifications(data);
            // Refresh unread count
            const cnt = await getUnreadCount();
            setUnread(cnt.count);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnread(u => Math.max(0, u - 1));
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnread(0);
        } catch { /* silent */ }
    };

    const handleClearAll = async () => {
        try {
            await clearAllNotifications();
            setNotifications([]);
            setUnread(0);
        } catch { /* silent */ }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell trigger */}
            <button onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                title="Notifications">
                <Bell size={18} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[380px] bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    style={{ maxHeight: '480px' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                                <Bell size={13} className="text-white" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-neutral-900">Notifications</span>
                                {unread > 0 && (
                                    <span className="ml-2 text-[10px] font-semibold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                                        {unread} new
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {unread > 0 && (
                                <button onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-900 bg-neutral-50 rounded-md hover:bg-neutral-100 transition-all"
                                    title="Mark all read">
                                    <CheckCheck size={11} />
                                    Read all
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={handleClearAll}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-500 hover:text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-all"
                                    title="Clear all notifications">
                                    Clear all
                                </button>
                            )}
                            <button onClick={() => setOpen(false)}
                                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Time filter pills */}
                    <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-neutral-100">
                        <Clock size={11} className="text-neutral-400 shrink-0" />
                        {FILTER_OPTIONS.map((opt) => (
                            <button key={String(opt.value)} onClick={() => setFilter(opt.value)}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all
                                    ${filter === opt.value
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Notification list */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                                    <BellOff size={18} className="text-neutral-400" />
                                </div>
                                <p className="text-xs font-medium text-neutral-500">No notifications</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                    {filter ? `Nothing in the last ${filter}h` : 'You\u2019re all caught up!'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {notifications.map((n) => {
                                    const meta = TYPE_META[n.type] || TYPE_META.system;
                                    const Icon = meta.icon;
                                    return (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.read && handleMarkRead(n._id)}
                                            className={`flex items-start gap-3 px-5 py-3 transition-all cursor-pointer hover:bg-neutral-50
                                                ${!n.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                <Icon size={13} className={meta.iconColor} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-xs font-semibold leading-tight ${n.read ? 'text-neutral-500' : 'text-neutral-900'}`}>
                                                        {n.title}
                                                    </span>
                                                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                                </div>
                                                <p className={`text-[11px] mt-0.5 leading-relaxed ${n.read ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                                    {n.message}
                                                </p>
                                                <span className="text-[9px] text-neutral-400 mt-1 inline-block">{timeAgo(n.createdAt)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
