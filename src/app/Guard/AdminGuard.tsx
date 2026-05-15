import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";

const AdminGuard = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If not logged in or not an admin, kick back to home
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminGuard;
