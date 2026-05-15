import { useNavigate } from "react-router";
import type { Itinerary } from "../types/itineraries.types";
import { HeartIcon } from "@shared/icons/ActionIcons";
import { useAuthStore } from "@features/auth/store/auth.store";
import { useToggleWishlist } from "@features/users/hooks/useToggleWishlist";

interface Props {
  itinerary: Itinerary;
}

export const ItineraryCard = ({ itinerary }: Props) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  // Atento al typo 'whishlist' que viene de la base de datos
  const isWishlisted = isAuthenticated && user?.whishlist?.includes(itinerary._id);

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      // Si no está logueado, redirigimos al login (o podríamos mostrar un toast)
      navigate("/auth/login");
      return;
    }
    
    if (isPending) return;

    toggleWishlist(itinerary._id);
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-card-foreground flex flex-col gap-4 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleWishlistClick}
          disabled={isPending}
          className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon
            filled={isWishlisted}
            className={`w-6 h-6 ${isWishlisted ? "text-red-500" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <img
          src={itinerary.guide_image}
          alt={itinerary.guide}
          className="h-12 w-12 rounded-full object-cover border border-border"
        />
        <div className="pr-10"> {/* Padding right para no pisar el corazon */}
          <h3 className="text-xl font-bold text-foreground">{itinerary.title}</h3>
          <p className="text-sm text-muted-foreground">Guide: {itinerary.guide}</p>
        </div>
      </div>
      
      <p className="text-foreground leading-relaxed">{itinerary.description}</p>
      
      <div className="flex items-center gap-4 text-sm font-medium text-foreground">
        <div className="flex items-center gap-1" aria-label={`Price: ${itinerary.price} out of 5`}>
           <span className="text-green-600 font-bold">{"$".repeat(itinerary.price)}</span>
           <span className="text-muted-foreground">{"$".repeat(5 - itinerary.price)}</span>
        </div>
        <span className="text-muted-foreground">•</span>
        <span>{itinerary.duration} Hours</span>
      </div>

      {itinerary.hashtags && itinerary.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {itinerary.hashtags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};