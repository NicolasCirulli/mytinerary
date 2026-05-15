import { CityCard } from './CityCard';
import type { City } from '../cities.types';
interface CityGridProps {
  cities: City[];
}

// Bento pattern: within each group of 6 cards, items at position 0 and 3
// span 2 columns to create visual variety. The first card also spans 2 rows.
const getBentoClass = (indexInGroup: number): string => {
  switch (indexInGroup) {
    case 0:
      return 'sm:col-span-2 sm:row-span-2';
    case 3:
      return 'sm:col-span-2';
    default:
      return '';
  }
};

export const CityGrid = ({ cities }: CityGridProps) => {
  if (cities.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card/50">
        <p className="text-lg text-muted-foreground">No cities found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[280px]">
      {cities.map((city, index) => {
        const indexInGroup = index % 6;
        const bentoClass = getBentoClass(indexInGroup);

        return (
          <div key={city._id} className={bentoClass}>
            <CityCard city={city} index={index} />
          </div>
        );
      })}
    </div>
  );
};
