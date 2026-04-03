import { Search } from 'lucide-react';
import { useState } from 'react';
import { useSync } from '@/hooks/SyncContext';






export function TruckList({ onViewTruck }) {
  const [search, setSearch] = useState('');
  const { trucks: trucksData, loading } = useSync();

  const trucks = (trucksData ?? []).map((t) => ({
    number: t.truckNumber,
    owner: t.owner || '',
    driver: t.driver || '',
    status: t.status === 'Available' ? 'Active' : t.status,
    availability: t.availabilityWindow || ''
  }));

  const filtered = search ?
  trucks.filter(
    (t) =>
    t.number.toLowerCase().includes(search.toLowerCase()) ||
    t.owner.toLowerCase().includes(search.toLowerCase())
  ) :
  trucks;

  return (
    <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Trucks</h1>
                    <p className="text-sm text-neutral-500 mt-1">Fleet overview  click truck number for health & documents</p>
                </div>
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
            value={search}
            // ...rest of the code...
          />
                </div>
            </div>
        </div>);

}