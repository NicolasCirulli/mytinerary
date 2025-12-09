import { CitiesHero } from '@features/cities/components/CitiesHero';
import { CitySearch } from '@features/cities/components/CitySearch';
import { CityGrid } from '@features/cities/components/CityGrid';
import { useCities } from '@features/cities/hooks/useCities';


const CitiesPage = () => {
  const { filteredCities, searchTerm, setSearchTerm } = useCities();

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Hero Section */}
      <div className="px-4 pt-4">
        <CitiesHero />
      </div>

      <div className="container mx-auto flex flex-col gap-8 px-4">
        {/* Search Section */}
        <div className="mx-auto w-full max-w-2xl">
          <CitySearch value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Cities Grid Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Popular Destinations</h2>
          <CityGrid cities={filteredCities} />
        </div>
      </div>
    </div>
  );
};

export default CitiesPage;
