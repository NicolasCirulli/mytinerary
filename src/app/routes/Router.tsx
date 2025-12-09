import { createBrowserRouter } from "react-router";
import MainLayout from "@shared/components/MainLayout";
import HomePage from "@pages/home/HomePage";
import CitiesPage from "@pages/cities/CitiesPage";


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