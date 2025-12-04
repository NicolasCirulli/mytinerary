import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PopularDestinations } from '@features/cities/components/PopularDestinations';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <HeroSection />
      <FeaturesSection />
      <PopularDestinations />
    </div>
  );
};

export default HomePage;
