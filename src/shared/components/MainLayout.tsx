import { Outlet } from "react-router";
import {Header} from "./Header";
//import Footer from "./Footer";

const MainLayout = () => {
  return (
    // 1. Contenedor Maestro: Ocupa toda la altura y es flexible verticalmente
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* 2. Header Sticky: Se queda pegado arriba al hacer scroll */}
     <Header />

      <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet /> 
      </main>

      <footer className="w-full border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <Footer /> */}
          <p>footer</p>
        </div>
      </footer>
      
    </div>
  );
};

export default MainLayout;