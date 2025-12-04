import { MapIcon, KeyIcon, UsersIcon } from '@shared/icons/FeatureIcons';

export const FeaturesSection = () => {
  const features = [
    {
      icon: <MapIcon className="h-8 w-8 text-primary" />,
      title: 'Authentic Experiences',
      description: 'Follow itineraries crafted by locals for a truly genuine adventure.',
    },
    {
      icon: <KeyIcon className="h-8 w-8 text-primary" />,
      title: 'Unlock Hidden Gems',
      description: 'Discover spots and activities that you won\'t find in the guidebooks.',
    },
    {
      icon: <UsersIcon className="h-8 w-8 text-primary" />,
      title: 'Connect with Travelers',
      description: 'Join a community of passionate explorers and share your journeys.',
    },
  ];

  return (
    <section className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why Mytinerary?</h2>
          <p className="mt-4 text-muted-foreground">
            Experience travel in a whole new way with insights from those who call your destination home.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
  );
};
