import { CityCard } from './CityCard';
import type { City } from '../cities.types';
interface CityGridProps {
  cities: City[];
}

export const CityGrid = ({ cities }: CityGridProps) => {
  if (cities.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card/50">
        <p className="text-lg text-muted-foreground">No cities found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cities.map((city, index) => (
        <CityCard key={city._id} city={city} index={index} />
      ))}
    </div>
  );
};
