import { RouterProvider } from "react-router"
import { router } from "./app/routes/Router"
function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
