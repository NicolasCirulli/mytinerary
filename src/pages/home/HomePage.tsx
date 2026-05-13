import { SEO } from '@shared/seo/SEO';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PopularDestinations } from '@features/cities/components/PopularDestinations';

const HomePage = () => {
  return (
    <>
      <SEO
        title="Travel Like a Local"
        description="Discover unique itineraries curated by the people who know their cities best. Find your perfect trip, designed by insiders who know and love their cities."
        canonical="/"
      />
      <div className="flex flex-col gap-16 pb-16">
        <HeroSection />
        <FeaturesSection />
        <PopularDestinations />
      </div>
    </>
  );
};

export default HomePage;
