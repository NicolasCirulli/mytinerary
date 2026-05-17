import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "@shared/components/MainLayout";
import HomePage from "@pages/home/HomePage";
import GuestGuard from "../Guard/GuestGuard";
import AuthGuard from "../Guard/AuthGuard";
import AdminGuard from "../Guard/AdminGuard";

const CitiesPage = lazy(() => import("@pages/cities/CitiesPage"));
const CityDetailsPage = lazy(() => import("@pages/cities/CityDetailsPage"));
const ItineraryDetailPage = lazy(() => import("@pages/itineraries/ItineraryDetailPage"));
const LoginPage = lazy(() => import("@pages/login/LoginPage"));
const RegisterPage = lazy(() => import("@pages/register/RegisterPage"));
const ProfilePage = lazy(() => import("@pages/profile/ProfilePage"));
const AdminPage = lazy(() => import("@pages/admin/AdminPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/cities", element: <CitiesPage /> },
      { path: "/cities/:id", element: <CityDetailsPage /> },
      { path: "/itineraries/:id", element: <ItineraryDetailPage /> },
      {
        path: "/auth",
        Component: GuestGuard,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
      {
        path: "/",
        Component: AuthGuard,
        children: [
          { path: "profile", element: <ProfilePage /> },
        ],
      },
      {
        path: "/admin",
        Component: AdminGuard,
        children: [
          { path: "", element: <AdminPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <MainLayout />,
    children: [{ path: "*", element: <h1>404 Not Found</h1> }],
  },
]);
