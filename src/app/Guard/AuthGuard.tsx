import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
const AuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return <Outlet />;
};

export default AuthGuard;
