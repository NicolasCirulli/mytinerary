import { Link } from 'react-router';

export const HeroSection = () => {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden noise-overlay">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
            alt="Paris Eiffel Tower"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-background"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center animate-fade-in-up">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
            Travel Like a Local
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-200 sm:text-xl drop-shadow-md">
            Discover unique itineraries curated by the people who know their cities best.
          </p>
          <Link
            to="/cities"
            className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-white transition-transform hover:scale-105 hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            Explore Cities
          </Link>
        </div>
      </section>
  );
};
