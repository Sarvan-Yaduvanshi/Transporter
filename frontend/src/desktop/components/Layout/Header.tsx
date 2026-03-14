import { ChevronRight } from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';

export interface Breadcrumb {
    label: string;
    onClick?: () => void;
}

interface HeaderProps {
    breadcrumbs: Breadcrumb[];
}

export function Header({ breadcrumbs }: HeaderProps) {
    return (
        <header className="bg-white border-b border-neutral-200 px-8 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight size={14} className="text-neutral-400" />}
                        {crumb.onClick ? (
                            <button
                                onClick={crumb.onClick}
                                className="font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                {crumb.label}
                            </button>
                        ) : (
                            <span className="font-semibold text-neutral-900">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <NotificationDropdown />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                <span className="text-xs text-neutral-500 font-medium">I3MS Live</span>
            </div>
        </header>
    );
}
