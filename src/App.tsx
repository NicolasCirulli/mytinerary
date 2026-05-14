import { RouterProvider } from "react-router"
import { router } from "./app/routes/Router"
import { useEffect } from "react"
import { useAuthStore } from "./features/auth/store/auth.store"

function App() {
  const initSession = useAuthStore((state) => state.initSession)

  useEffect(() => {
    initSession()
  }, [initSession])

  return (
    <RouterProvider router={router} />
  )
}

export default App
