import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, BellOff, CheckCheck, AlertTriangle, DollarSign, Info, Clock } from 'lucide-react';
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type AppNotification,
} from '@/services/api';

interface NotificationPageProps {
    onBack: () => void;
}

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

export function NotificationPage({ onBack }: NotificationPageProps) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<TimeFilter>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNotifications(filter ?? undefined);
            setNotifications(data);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const FILTER_OPTIONS: { label: string; value: TimeFilter }[] = [
        { label: 'All', value: null },
        { label: 'Last 6 hrs', value: 6 },
        { label: 'Last 12 hrs', value: 12 },
        { label: 'Last 24 hrs', value: 24 },
    ];

    return (
        <div className="min-h-full bg-neutral-50 p-6 md:p-10">
            <div className="max-w-2xl mx-auto">

                {/* Back */}
                <button onClick={onBack}
                    className="group flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-900 mb-6 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center group-hover:border-neutral-300 group-hover:shadow-sm transition-all">
                        <ArrowLeft size={15} />
                    </div>
                    Back
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                            <Bell size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Notifications</h1>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-all">
                            <CheckCheck size={13} />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Time filter pills */}
                <div className="flex items-center gap-2 mb-6">
                    <Clock size={14} className="text-neutral-400" />
                    {FILTER_OPTIONS.map((opt) => (
                        <button key={String(opt.value)} onClick={() => setFilter(opt.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                                ${filter === opt.value
                                    ? 'bg-neutral-900 text-white shadow-sm'
                                    : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-700'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                            <BellOff size={24} className="text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-500">No notifications</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            {filter ? `Nothing in the last ${filter} hours` : 'You\u2019re all caught up!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => {
                            const meta = TYPE_META[n.type] || TYPE_META.system;
                            const Icon = meta.icon;
                            return (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && handleMarkRead(n._id)}
                                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer
                                        ${n.read
                                            ? 'bg-white border-neutral-200/80'
                                            : 'bg-white border-neutral-200 shadow-sm hover:shadow-md'}`}
                                >
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                        <Icon size={16} className={meta.iconColor} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${n.read ? 'text-neutral-500' : 'text-neutral-900'}`}>
                                                {n.title}
                                            </span>
                                            {!n.read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className={`text-xs mt-0.5 leading-relaxed ${n.read ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                            {n.message}
                                        </p>
                                        <span className="text-[10px] text-neutral-400 mt-1.5 inline-block">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
