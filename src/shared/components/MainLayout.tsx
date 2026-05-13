import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { OrganizationSchema } from "@shared/seo/StructuredData";

const MainLayout = () => {
  return (
    <>
      <OrganizationSchema />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Header />
        <main id="main-content" className="grow w-full">
          <Outlet /> 
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;