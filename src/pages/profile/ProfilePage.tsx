import { useAuthStore } from "@features/auth/store/auth.store";
import { SEO } from "@shared/seo/SEO";
import HeroProfile from "./components/HeroProfile";

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null; // AuthGuard handles the redirect

  return (
    <>
      <SEO title="Profile" description="User profile and settings" />
      <div className="">
        <HeroProfile />
      </div>
    </>
  );
};

export default ProfilePage;
