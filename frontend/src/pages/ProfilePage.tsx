import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    User, Mail, Phone, Shield, Camera, ArrowLeft, Check,
    AlertCircle, Loader2, Calendar, Pencil, Sparkles, Palette, X,
} from 'lucide-react';

interface ProfilePageProps {
    onBack: () => void;
}

const ROLE_META: Record<string, { bg: string; text: string; icon: string }> = {
    Driver: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🚛' },
    Transporter: { bg: 'bg-violet-50', text: 'text-violet-700', icon: '📦' },
    Admin: { bg: 'bg-amber-50', text: 'text-amber-700', icon: '⚙️' },
};

/* ── Default avatar gallery (DiceBear Notionists style) ── */
const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Milo', 'Zara', 'Leo', 'Nala',
    'Oscar', 'Chloe', 'Max', 'Ivy', 'Sam', 'Luna',
    'Ravi', 'Priya', 'Kai', 'Ava', 'Omar', 'Suki',
];
const DEFAULT_AVATARS = AVATAR_SEEDS.map(
    (seed) => `https://api.dicebear.com/8.x/notionists/svg?seed=${seed}`
);

/* ── Banner gradient presets ─────────────────────── */
const BANNER_PRESETS = [
    { id: 'dark', css: 'from-neutral-900 via-neutral-800 to-neutral-700', label: 'Charcoal' },
    { id: 'ocean', css: 'from-blue-600 via-cyan-500 to-teal-400', label: 'Ocean' },
    { id: 'sunset', css: 'from-orange-500 via-rose-500 to-pink-500', label: 'Sunset' },
    { id: 'forest', css: 'from-emerald-700 via-green-600 to-lime-500', label: 'Forest' },
    { id: 'galaxy', css: 'from-violet-700 via-purple-600 to-fuchsia-500', label: 'Galaxy' },
    { id: 'midnight', css: 'from-slate-900 via-indigo-900 to-blue-900', label: 'Midnight' },
    { id: 'rose', css: 'from-rose-400 via-pink-400 to-fuchsia-400', label: 'Rose' },
    { id: 'amber', css: 'from-amber-500 via-yellow-500 to-orange-400', label: 'Amber' },
    { id: 'slate', css: 'from-slate-600 via-slate-500 to-zinc-400', label: 'Steel' },
    { id: 'neon', css: 'from-green-400 via-cyan-400 to-blue-500', label: 'Neon' },
];

function getBannerCss(bannerId?: string): string {
    const found = BANNER_PRESETS.find(b => b.id === bannerId);
    return found ? found.css : BANNER_PRESETS[0].css;
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

export function ProfilePage({ onBack }: ProfilePageProps) {
    const { user, updateProfile } = useAuth();

    const [nickname, setNickname] = useState(user?.nickname || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [banner, setBanner] = useState(user?.banner || 'dark');
    const [customAvatarUrl, setCustomAvatarUrl] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [showBannerPicker, setShowBannerPicker] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setNickname(user.nickname || '');
            setAvatar(user.avatar || '');
            setBanner(user.banner || 'dark');
        }
    }, [user]);

    const hasChanges =
        nickname !== (user?.nickname || '') ||
        avatar !== (user?.avatar || '') ||
        banner !== (user?.banner || 'dark');

    const handleSave = async () => {
        setError('');
        setSuccess('');

        if (nickname.trim().length > 30) {
            setError('Nickname cannot exceed 30 characters');
            return;
        }

        setSaving(true);
        try {
            const updates: Record<string, string> = {};
            if (nickname !== (user?.nickname || '')) updates.nickname = nickname.trim();
            if (avatar !== (user?.avatar || '')) updates.avatar = avatar;
            if (banner !== (user?.banner || 'dark')) updates.banner = banner;

            await updateProfile(updates);
            setSuccess('Profile updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const roleMeta = ROLE_META[user?.role || 'Driver'] || ROLE_META.Driver;
    const bannerGradient = getBannerCss(banner);

    return (
        <div className="min-h-full bg-gradient-to-b from-neutral-50 to-neutral-100/60 p-6 md:p-10">
            <div className="max-w-xl mx-auto">

                {/* Back */}
                <button onClick={onBack}
                    className="group flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-900 mb-8 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center group-hover:border-neutral-300 group-hover:shadow-sm transition-all">
                        <ArrowLeft size={15} />
                    </div>
                    Back
                </button>

                {/* ── Hero Card — Avatar + Identity ────────── */}
                <div className="relative bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                    {/* Banner gradient — click to customise */}
                    <div className={`h-24 bg-gradient-to-r ${bannerGradient} transition-all duration-500 cursor-pointer group/banner relative`}
                        onClick={() => setShowBannerPicker(!showBannerPicker)}>
                        <div className="absolute inset-0 bg-black/0 group-hover/banner:bg-black/20 transition-all flex items-center justify-center">
                            <span className="opacity-0 group-hover/banner:opacity-100 transition-all flex items-center gap-1.5 text-white text-[10px] font-semibold drop-shadow-sm">
                                <Palette size={12} /> Change Header
                            </span>
                        </div>
                    </div>

                    <div className="px-6 md:px-8 pb-6">
                        {/* Avatar (overlapping the banner) */}
                        <div className="relative -mt-12 mb-4 flex items-end gap-4">
                            <div className="relative group shrink-0 cursor-pointer"
                                onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                                {avatar ? (
                                    <img src={avatar} alt={user?.name}
                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-neutral-100" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-neutral-900 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-white">
                                        {initials}
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 border-4 border-transparent">
                                    <Camera size={20} className="text-white drop-shadow" />
                                </div>
                            </div>
                            <div className="pb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Name + role + nickname */}
                        <h1 className="text-xl font-bold text-neutral-900 leading-tight">{user?.name || 'User'}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${roleMeta.bg} ${roleMeta.text}`}>
                                {roleMeta.icon} {user?.role}
                            </span>
                            {user?.nickname && (
                                <span className="text-sm text-neutral-400 italic">"{user.nickname}"</span>
                            )}
                        </div>

                        {/* Inline details row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5">
                                <Mail size={12} className="text-neutral-400" />
                                {user?.email || '—'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Phone size={12} className="text-neutral-400" />
                                {user?.phone || 'Not provided'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-neutral-400" />
                                Joined {formatDate(user?.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 shadow-sm">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-5 shadow-sm">
                        <Check size={16} className="shrink-0" />
                        <span className="font-medium">{success}</span>
                    </div>
                )}

                {/* ── Banner Picker (only visible when banner clicked) ── */}
                <div className={`bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden mt-5 transition-all duration-300
                    ${showBannerPicker ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 border-0 mb-0 pointer-events-none'}`}>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                                    <Palette size={14} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-900">Header Theme</h2>
                                    <p className="text-[11px] text-neutral-400">Choose a gradient for your profile banner</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBannerPicker(false)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2.5">
                            {BANNER_PRESETS.map((b) => (
                                <button key={b.id} onClick={() => setBanner(b.id)}
                                    className={`group relative rounded-xl overflow-hidden transition-all h-12
                                        ${banner === b.id
                                            ? 'ring-2 ring-neutral-900 ring-offset-2 scale-[1.02]'
                                            : 'ring-1 ring-neutral-200 hover:ring-neutral-300 hover:scale-[1.02]'}`}>
                                    <div className={`absolute inset-0 bg-gradient-to-r ${b.css}`} />
                                    <span className="relative text-[9px] font-bold text-white/90 drop-shadow-sm">{b.label}</span>
                                    {banner === b.id && (
                                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                            <Check size={10} className="text-neutral-900" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Avatar Picker ────────────────────────── */}
                <div className={`bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden mb-5 transition-all duration-300
                    ${showAvatarPicker ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 border-0 mb-0'}`}>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                                    <User size={14} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-900">Choose Avatar</h2>
                                    <p className="text-[11px] text-neutral-400">Pick a default or paste a custom URL</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAvatarPicker(false)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Default avatars grid */}
                        <div className="grid grid-cols-6 gap-3 mb-5">
                            {DEFAULT_AVATARS.map((url, i) => (
                                <button key={i} onClick={() => { setAvatar(url); setCustomAvatarUrl(''); }}
                                    className={`relative rounded-xl overflow-hidden transition-all aspect-square
                                        ${avatar === url
                                            ? 'ring-2 ring-neutral-900 ring-offset-2 scale-[1.05]'
                                            : 'ring-1 ring-neutral-200 hover:ring-neutral-400 hover:scale-[1.05]'}`}>
                                    <img src={url} alt={AVATAR_SEEDS[i]}
                                        className="w-full h-full object-cover bg-neutral-50" />
                                    {avatar === url && (
                                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center">
                                            <Check size={9} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Remove avatar */}
                        {avatar && (
                            <button onClick={() => { setAvatar(''); setCustomAvatarUrl(''); }}
                                className="text-xs text-neutral-400 hover:text-red-500 font-medium mb-4 transition-colors">
                                Remove avatar (show initials)
                            </button>
                        )}

                        {/* Custom URL */}
                        <div className="flex gap-2">
                            <input type="url" value={customAvatarUrl}
                                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all placeholder:text-neutral-300"
                                placeholder="Or paste a custom image URL…" />
                            <button onClick={() => { if (customAvatarUrl.trim()) setAvatar(customAvatarUrl.trim()); }}
                                disabled={!customAvatarUrl.trim()}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Personalisation Card ─────────────────── */}
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-neutral-900">Personalise</h2>
                            <p className="text-[11px] text-neutral-400">Customise your display name</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Nickname */}
                        <div>
                            <label className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                    <Pencil size={11} className="text-neutral-400" />
                                    Nickname
                                </span>
                                <span className="text-[10px] text-neutral-300 font-medium tabular-nums">{nickname.length}/30</span>
                            </label>
                            <input type="text" value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={30}
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all placeholder:text-neutral-300"
                                placeholder="Choose a display nickname" />
                        </div>

                        {/* Save */}
                        <div className="pt-1">
                            <button onClick={handleSave} disabled={saving || !hasChanges}
                                className={`flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-xl transition-all
                                    ${hasChanges
                                        ? 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] shadow-sm'
                                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
