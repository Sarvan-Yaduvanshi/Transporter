import { useAuth } from '@/hooks/useAuth';

export function ProfileView() {
  const { user } = useAuth();

  const info = [
    { label: 'Name', value: user?.name || '—' },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Role', value: user?.role || '—' },
    { label: 'Account Provider', value: user?.provider || 'local' },
    { label: 'User ID', value: user?._id || '—' },
  ];

  return (
    <div className="max-w-xl bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {info.map((item, i) => (
        <div key={item.label} className={`px-6 py-4 flex justify-between items-center ${i < info.length - 1 ? 'border-b border-neutral-100' : ''}`}>
          <div className="text-sm text-neutral-500">{item.label}</div>
          <div className="text-sm font-semibold text-neutral-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
