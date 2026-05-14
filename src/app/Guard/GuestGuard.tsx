import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
const GuestGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default GuestGuard;
