export const CitiesHero = () => {
  return (
    <section className="relative h-[40vh] w-full overflow-hidden rounded-3xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Travel Adventure"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-start justify-center px-8 md:px-16">
        <h1 className="max-w-2xl text-4xl font-bold text-white md:text-5xl lg:text-6xl drop-shadow-lg">
          Find Your City, Plan Your Adventure
        </h1>
      </div>
    </section>
  );
};
