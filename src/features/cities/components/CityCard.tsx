import { memo } from "react";
import { Link } from "react-router";
import type { City } from "../cities.types";
interface CityCardProps {
  city: City;
  index?: number;
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export const CityCard = memo(({ city, index = 0 }: CityCardProps) => {
  const staggerClass = `stagger-${Math.min(index + 1, 5)}`;
  
  return (
    <Link
      to={`/cities/${city._id}`}
      className={`block group relative h-full overflow-hidden rounded-2xl cursor-pointer animate-fade-in-up border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 ${staggerClass}`}
    >
      {/* Image */}
      <img
        src={city.image}
        alt={city.name}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = "/no-image-stock.png")}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-500 group-hover:from-black/95" />

      {/* Rating badge (top-right) */}
      {city.averageRating > 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-amber-400 border border-white/10">
          <StarIcon />
          {city.averageRating.toFixed(1)}
        </div>
      )}

      {/* Content (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-bold text-white leading-tight sm:text-2xl">
          {city.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-white/70">
          <PinIcon />
          <span className="text-sm font-medium">{city.country}</span>
        </div>

        {/* Explore CTA — slides up on hover */}
        <div className="mt-3 flex translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-white border border-white/10">
            Explore
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </Link>
  );
});
