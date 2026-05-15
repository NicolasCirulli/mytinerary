import { useCities } from '@features/cities/hooks/useCities';

interface OverviewProps {
  onNavigate: (view: 'dashboard' | 'cities' | 'itineraries') => void;
}

// --- Stat Card ---

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  accentColor: string;
}

const StatCard = ({ icon, label, value, subtitle, accentColor }: StatCardProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/50">
    <div className="flex items-center gap-2">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentColor}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

export const AdminOverview = ({ onNavigate }: OverviewProps) => {
  const { cities, isPending } = useCities();

  const totalCities = isPending ? '—' : String(cities.length);
  const totalItineraries = isPending
    ? '—'
    : String(cities.reduce((sum, c) => sum + (c.itineraries?.length ?? 0), 0));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Summary of cities and itineraries on the platform.
        </p>
      </div>

      {/* Stats Grid — real data from useCities */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>}
          label="Total Cities"
          value={totalCities}
          subtitle="Cities registered on the platform"
          accentColor="bg-primary/15 text-primary"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
          label="Itineraries"
          value={totalItineraries}
          subtitle="Across all cities (populated data)"
          accentColor="bg-emerald-500/15 text-emerald-400"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('cities')}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>
            Manage Cities
          </button>
          <button
            type="button"
            onClick={() => onNavigate('itineraries')}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            Manage Itineraries
          </button>
        </div>
      </div>
    </div>
  );
};
