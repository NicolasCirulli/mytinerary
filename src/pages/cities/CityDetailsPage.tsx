import { useParams, Link } from "react-router";
import { SEO } from "@shared/seo/SEO";
import { useCityDetails } from "@features/cities/hooks/useCityDetails";

const CityDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { city, loading, error } = useCityDetails(id);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-foreground pt-20">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-destructive pt-20">
        Error: {error}
      </div>
    );
  if (!city)
    return (
      <div className="flex justify-center items-center min-h-screen text-foreground pt-20">
        City not found
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
              <h1 className="text-5xl md:text-7xl font-bold mb-2">{city.name}</h1>
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
            {city.itineraries ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {city.itineraries.map((_itinerary, index: number) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-lg border border-border shadow-sm text-card-foreground"
                  >
                    <h3 className="text-xl font-bold mb-2">
                      Itinerary {index + 1}
                    </h3>
                  </div>
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
