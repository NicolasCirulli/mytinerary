import { useParams, Link } from "react-router";
import { SEO } from "@shared/seo/SEO";
import { useCity } from "@features/cities/hooks/useCity";
import { useCityItineraries } from "@features/itineraries/hooks/useCityItineraries";
import { ItineraryCard } from "@features/itineraries/components/ItineraryCard";

const CityDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: city, isPending, isError, error } = useCity(id);
  const { data: itineraries, isPending: isItinerariesPending } =
    useCityItineraries(id);
  console.log(city);
  if (isPending)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-muted-foreground pt-20 gap-4">
        <svg
          className="animate-spin h-8 w-8 text-primary"
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
        Loading city details...
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-destructive pt-20 gap-2">
        <h2 className="text-2xl font-bold">Error loading city</h2>
        <p>{error?.message || "Something went wrong."}</p>
        <Link to="/cities" className="mt-4 text-primary hover:underline">
          Return to Cities
        </Link>
      </div>
    );

  if (!city)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-foreground pt-20 gap-4">
        <h2 className="text-2xl font-bold">City not found</h2>
        <Link to="/cities" className="text-primary hover:underline">
          Browse other destinations
        </Link>
      </div>
    );

  return (
    <>
      <SEO
        title={city.name}
        description={`Discover ${city.name}, ${city.country}. Explore curated itineraries and travel tips from local experts in ${city.name}.`}
        canonical={`/cities/${city._id}`}
        image={city.image}
      />
      <div className="min-h-screen bg-background text-foreground pt-16">
        <div className="relative h-[50vh] w-full overflow-hidden">
          <img
            src={city.image}
            alt={city.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent flex flex-col justify-end p-8 md:p-16">
            <div className="max-w-4xl text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-2">
                {city.name}
              </h1>
              <p className="text-2xl text-gray-200 flex items-center gap-2">
                {city.country}
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded ml-2">
                  {city.language}
                </span>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                  {city.currency}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {city.description}
            </p>
          </div>

          <Link
            to="/cities"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            ← Back to Cities
          </Link>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Itineraries
            </h2>
            {isItinerariesPending ? (
              <div className="flex justify-center items-center py-8 text-muted-foreground">
                <svg
                  className="animate-spin h-6 w-6 text-primary mr-2"
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
                Loading itineraries...
              </div>
            ) : itineraries && itineraries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.map((itinerary) => (
                  <ItineraryCard key={itinerary._id} itinerary={itinerary} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No itineraries available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CityDetailsPage;
