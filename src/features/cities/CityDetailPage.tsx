import { useParams, Link } from "react-router";
import { useCityDetails } from "../../features/cities/hooks/useCityDetails";
import type { Itinerary } from "../intineraries/itineraries.types";

const CityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { city, loading, error } = useCityDetails(id);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-white pt-20">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 pt-20">
        Error: {error}
      </div>
    );
  if (!city)
    return (
      <div className="flex justify-center items-center min-h-screen text-white pt-20">
        City not found
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img
          src={city.image}
          alt={city.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-4xl">
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
          <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
            {city.description}
          </p>
        </div>

        <Link
          to="/cities"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          ← Back to Cities
        </Link>

        {/* Placeholder for Itineraries */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-3xl font-bold mb-6">Itineraries</h2>
          {city.itineraries && city.itineraries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Itinerary cards would go here - placeholder for now */}
              {city.itineraries.map((_itinerary: Itinerary, index: number) => (
                <div
                  key={index}
                  className="bg-white/5 p-6 rounded-lg border border-white/10"
                >
                  <h3 className="text-xl font-bold mb-2">
                    Itinerary {index + 1}
                  </h3>
                  {/* Assuming basic structure if available, or just generic */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">
              No itineraries available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityDetailPage;
