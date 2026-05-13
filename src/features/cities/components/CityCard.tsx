import { Link } from "react-router";
import type { City } from "../cities.types";
interface CityCardProps {
  city: City;
}

export const CityCard = ({ city }: CityCardProps) => {
  return (
    <Link
      to={`/cities/${city._id}`}
      className="block group relative aspect-3/4 overflow-hidden rounded-2xl cursor-pointer"
    >
      <img
        src={city.image}
        alt={city.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = "/no-image-stock.png")}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-2xl font-bold">{city.name}</h3>
        <p className="text-sm font-medium text-gray-300">{city.country}</p>
      </div>
    </Link>
  );
};
