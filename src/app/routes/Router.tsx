import { createBrowserRouter } from "react-router";
import MainLayout from "@shared/components/MainLayout";
import HomePage from "@pages/home/HomePage";
import CitiesPage from "@pages/cities/CitiesPage";
import CityDetailsPage from "@pages/cities/CityDetailsPage";
import LoginPage from "@/pages/login/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/cities", element: <CitiesPage /> },
      { path: "/cities/:id", element: <CityDetailsPage /> },
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    path: "*",
    element: <MainLayout />,
    children: [{ path: "*", element: <h1>404 Not Found</h1> }],
  },
]);
