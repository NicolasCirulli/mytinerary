import { useCities } from "../hooks/useCities";

export const PopularDestinations = () => {

  const { cities, loading, error } = useCities();

  if (loading) {
    return <div>Loading popular destinations...</div>;
  }
  if (error) {
    console.log(error);
    return null
  }
  const popularDestinations = cities.slice(0, 5);

  return (
    <section className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-foreground sm:text-4xl">Popular Destinations</h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {popularDestinations.map((city, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl aspect-3/4 cursor-pointer"
            >
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-xl font-bold">{city.name}</h3>
                <p className="text-sm text-gray-300">{city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
  );
};
