import { useAuthStore } from "@features/auth/store/auth.store";
import { createLogger } from "vite";

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <div className="flex flex-col items-center gap-0.5 px-5 py-2.5" role="listitem">
    <span className="text-base font-semibold text-foreground">{value}</span>
    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
      {label}
    </span>
  </div>
);

const HeroProfile = () => {
  const user = useAuthStore((state) => state.user);
  console.log(user) 
  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;
  const handle = `@${user.email.split("@")[0]}`;

  return (
    <section className="mx-2 lg:mx-auto max-w-7xl overflow-hidden rounded-2xl bg-card my-4 ">
      {/* Cover */}
      <div className="noise-overlay relative h-48 overflow-hidden sm:h-56">
        <img
          src="/montaña_stock.webp"
          alt="Profile cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-card"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative px-5 pb-6 sm:px-6">
        {/* Avatar & Edit Button */}
        <div className="flex items-end justify-between">
          <img
            src={user.image || "/no-image-stock.png"}
            alt={`${fullName}'s profile picture`}
            className="-mt-12 h-[88px] w-[88px] rounded-full border-[3px] border-card object-cover shadow-lg ring-1 ring-white/10 sm:-mt-14 sm:h-24 sm:w-24"
          />
          <button
            type="button"
            className="mb-1 cursor-pointer rounded-full border border-border bg-card px-5 py-1.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary"
          >
            Edit Profile
          </button>
        </div>

        {/* User Info & Stats */}
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {fullName}
            </h1>
            <p className="mt-1 text-sm font-medium text-primary">
              {handle}
            </p>
            <p className="mt-3 max-w-md text-[0.84rem] leading-relaxed text-muted-foreground">
              Passionate traveler and local guide. Obsessed with finding hidden
              gems, specialty coffee shops, and the best viewpoints in every
              city. Always planning the next escape.
            </p>
          </div>

          {/* Stats — hardcoded, no endpoint yet */}
          <div
            className="flex w-fit shrink-0 divide-x divide-border rounded-xl border border-border bg-secondary/50"
            role="list"
            aria-label="Profile statistics"
          >
            <StatItem value="24" label="Itineraries" />
            <StatItem value="15" label="Countries" />
            <StatItem value="1.2k" label="Followers" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroProfile;
