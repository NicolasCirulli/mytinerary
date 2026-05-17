import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useItineraryActivities } from '@features/itineraries/hooks/useItineraryActivities';
import type { Itinerary } from '@features/itineraries/types/itineraries.types';

const priceLevels: Record<number, { label: string; className: string }> = {
  1: { label: '$ Budget', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  2: { label: '$$ Medium', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  3: { label: '$$$ High', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  4: { label: '$$$$ Premium', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  5: { label: '$$$$$ Luxury', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

const PriceBadge = ({ price }: { price: number }) => {
  const level = priceLevels[price] || priceLevels[1];
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${level.className}`}>
      {level.label}
    </span>
  );
};

/** Fallback stub for deep links / refreshes when no cached data is available */
const fallbackItinerary: Itinerary = {
  _id: '',
  title: 'Demo Itinerary',
  price: 3,
  guide: 'Demo Guide',
  duration: 4,
  hashtags: ['#demo'],
  guide_image: '',
  description: 'This is a demonstration itinerary. Connect to the backend for real content.',
  city: '',
};

export const ItineraryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();

  // 1. Try location.state first (zero-latency happy path)
  const itineraryFromState = (location.state as { itinerary?: Itinerary })?.itinerary;

  const [itinerary, setItinerary] = useState<Itinerary | undefined>(itineraryFromState);
  const [isResolvingItinerary, setIsResolvingItinerary] = useState(!itineraryFromState);
  const [isDemoData, setIsDemoData] = useState(false);

  useEffect(() => {
    if (itineraryFromState) {
      setItinerary(itineraryFromState);
      setIsResolvingItinerary(false);
      setIsDemoData(false);
      return;
    }

    if (!id) {
      setIsResolvingItinerary(false);
      return;
    }

    // 2. Search across all cached queries for the itinerary
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.findAll();
    let found: Itinerary | undefined;

    for (const query of allQueries) {
      const data = query.state.data;
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null && '_id' in data[0]) {
        found = (data as Itinerary[]).find((i) => i._id === id);
        if (found) break;
      }
    }

    if (found) {
      setItinerary(found);
      setIsDemoData(false);
    } else {
      // 3. Stub fallback with demo banner
      setItinerary({ ...fallbackItinerary, _id: id });
      setIsDemoData(true);
    }
    setIsResolvingItinerary(false);
  }, [id, itineraryFromState, queryClient]);

  // C2: Use dedicated activities hook instead of itinerary.activities
  const { data: activities = [], isPending: loadingActivities } = useItineraryActivities(id);

  // --- Edge: no ID at all ---
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Itinerary not found — no ID provided</p>
      </div>
    );
  }

  // --- Skeleton while resolving itinerary ---
  if (isResolvingItinerary) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-muted rounded-lg" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="h-24 w-full bg-muted rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 404: itinerary not resolved ---
  if (!itinerary) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Itinerary not found</h1>
          <p className="text-muted-foreground mt-2">This itinerary could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Demo data banner */}
      {isDemoData && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            These are demonstration data. Connect to the backend for real content.
          </p>
        </div>
      )}

      {/* Hero Section */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left md:gap-8">
          <img
            src={itinerary.guide_image}
            alt={itinerary.guide}
            className="h-24 w-24 rounded-full object-cover border-2 border-border shadow-md"
          />
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">{itinerary.title}</h1>
            <p className="text-lg text-muted-foreground">Guide: {itinerary.guide}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <PriceBadge price={itinerary.price} />
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium text-foreground">{itinerary.duration} Hours</span>
            </div>
            {itinerary.hashtags && itinerary.hashtags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                {itinerary.hashtags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
        <p className="text-muted-foreground leading-relaxed">{itinerary.description}</p>
      </section>

      {/* Activities Section */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">Activities</h2>
        {loadingActivities ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-20 w-20 bg-muted rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <p className="text-sm text-muted-foreground">No activities found for this itinerary.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activities.map((activity) => (
              <div key={activity._id} className="rounded-xl border border-border bg-card p-5 flex gap-4 hover:shadow-sm transition-shadow">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="h-20 w-20 rounded-lg object-cover border border-border flex-shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{activity.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                  {activity.duration != null && (
                    <p className="text-xs text-muted-foreground">{activity.duration} min</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ItineraryDetailPage;
