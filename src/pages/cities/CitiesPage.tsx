import { SEO } from "@shared/seo/SEO";
import { CitiesHero } from "@features/cities/components/CitiesHero";
import { CitySearch } from "@features/cities/components/CitySearch";
import { CityGrid } from "@features/cities/components/CityGrid";
import { useCities } from "@features/cities/hooks/useCities";

const CitiesPage = () => {
  const {
    filteredCities,
    searchTerm,
    setSearchTerm,
    isPending,
    isError,
    error,
  } = useCities();
  console.log(filteredCities);
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
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Popular Destinations
            </h2>

            {isPending && (
              <div className="flex justify-center items-center py-12 text-muted-foreground">
                <svg
                  className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading cities...</span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col justify-center items-center py-12 text-destructive gap-4 bg-destructive/10 rounded-lg p-6 text-center">
                <span className="text-xl font-semibold">
                  Oops! Something went wrong.
                </span>
                <p>{error || "Failed to load cities."}</p>
              </div>
            )}

            {!isPending && !isError && <CityGrid cities={filteredCities} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default CitiesPage;
