import { createBrowserRouter } from "react-router";
import MainLayout from "@shared/components/MainLayout";
import HomePage from "@pages/home";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      // Add more routes here as needed
    ],
  },
]);