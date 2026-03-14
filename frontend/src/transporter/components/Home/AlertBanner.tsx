import { ChevronRight } from 'lucide-react';
interface AlertBannerProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badgeCount: string;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}

export function AlertBanner({ icon, title, subtitle, badgeCount, variant = 'default', onClick }: AlertBannerProps) {
  const isDanger = variant === 'danger';

  return (
    <div onClick={onClick} className={`${isDanger ? 'bg-red-50 border-red-100' : 'bg-neutral-50 border-neutral-200'} border rounded-xl p-4 flex items-center justify-between cursor-pointer ${isDanger ? 'hover:bg-red-100' : 'hover:bg-neutral-100'} transition-colors`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <span className={`text-sm font-semibold ${isDanger ? 'text-red-800' : 'text-neutral-800'}`}>{title}</span>
          <p className={`text-xs mt-0.5 ${isDanger ? 'text-red-500' : 'text-neutral-500'}`}>{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`${isDanger ? 'bg-red-500' : 'bg-neutral-900'} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>{badgeCount}</span>
        <ChevronRight size={16} className={isDanger ? 'text-red-400' : 'text-neutral-400'} />
      </div>
    </div>
  );
}
