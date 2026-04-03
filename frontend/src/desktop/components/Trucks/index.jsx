import { useState } from 'react';
import { TruckList } from './TruckList';
import { TruckHealth } from './TruckHealth';
// Updated imports to use subfolders
// import { TruckList } from './TruckList/index';
// import { TruckHealth } from './TruckHealth/index';

export function TrucksPage() {
  const [selectedTruck, setSelectedTruck] = useState(null);

  if (selectedTruck) {
    return <TruckHealth truckNumber={selectedTruck} onBack={() => setSelectedTruck(null)} />;
  }

  return <TruckList onViewTruck={(tn) => setSelectedTruck(tn)} />;
}