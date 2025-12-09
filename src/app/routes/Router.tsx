import { createBrowserRouter } from "react-router";
import MainLayout from "@shared/components/MainLayout";
import HomePage from "@pages/home";
import CitiesPage from "@/features/cities/CitiesPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/cities", element: <CitiesPage /> },
    ],
  },
]);