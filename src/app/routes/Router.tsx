import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "@shared/components/MainLayout";
import HomePage from "@pages/home/HomePage";
const CitiesPage = lazy(() => import("@pages/cities/CitiesPage"));
const CityDetailsPage = lazy(() => import("@pages/cities/CityDetailsPage"));
const LoginPage = lazy(() => import("@pages/login/LoginPage"));

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
