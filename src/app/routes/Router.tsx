import { createBrowserRouter } from "react-router";
import MainLayout from "../../shared/components/MainLayout";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <div className="">Hello World</div> },
      // Add more routes here as needed
    ],
  },
]);