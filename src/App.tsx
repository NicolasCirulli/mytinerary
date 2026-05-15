import { RouterProvider } from "react-router"
import { router } from "./app/routes/Router"
import { useAuthInitialize } from "./features/auth/hooks/useAuthInitialize"

function App() {
  useAuthInitialize()

  return (
    <RouterProvider router={router} />
  )
}

export default App
