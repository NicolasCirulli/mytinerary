import { Outlet } from "react-router";
import {Header} from "./Header";
import { Footer } from "./Footer";

const MainLayout = () => {
  return (
    // 1. Contenedor Maestro: Ocupa toda la altura y es flexible verticalmente
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* 2. Header Sticky: Se queda pegado arriba al hacer scroll */}
     <Header />

      <main className="grow w-full">
        <Outlet /> 
      </main>

      <Footer />
      
    </div>
  );
};

export default MainLayout;