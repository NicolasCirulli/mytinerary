import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.services";

export const useAuthInitialize = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const setLogout = useAuthStore((state) => state.setLogout);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await authService.verifyToken();
        setUser(userData);
      } catch (error) {
        console.error("Session verification failed:", error);
        setLogout();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token, setUser, setLogout, setLoading]);
};
