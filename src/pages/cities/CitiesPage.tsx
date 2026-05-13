import { SEO } from '@shared/seo/SEO';
import { CitiesHero } from '@features/cities/components/CitiesHero';
import { CitySearch } from '@features/cities/components/CitySearch';
import { CityGrid } from '@features/cities/components/CityGrid';
import { useCities } from '@features/cities/hooks/useCities';


const CitiesPage = () => {
  const { filteredCities, searchTerm, setSearchTerm } = useCities();

  return (
    <>
      <SEO
        title="Explore Cities"
        description="Browse our curated collection of cities and find your next adventure. Search by city name to discover unique itineraries crafted by local experts."
        canonical="/cities"
      />
      <div className="flex flex-col gap-8 pb-16">
        <div className="px-4 pt-4">
          <CitiesHero />
        </div>

        <div className="container mx-auto flex flex-col gap-8 px-4">
          <div className="mx-auto w-full max-w-2xl">
            <CitySearch value={searchTerm} onChange={setSearchTerm} />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Popular Destinations</h2>
            <CityGrid cities={filteredCities} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CitiesPage;
