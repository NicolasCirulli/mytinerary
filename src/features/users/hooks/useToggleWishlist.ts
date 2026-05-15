import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/user.services';
import { useAuthStore } from '@features/auth/store/auth.store';

export const useToggleWishlist = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (itineraryId: string) => userService.toggleWishlist(itineraryId),
    onSuccess: (updatedUser) => {
      // Optimistically update the global store with the new user object
      // This immediately reflects the change in the UI since the user object
      // contains the updated `whishlist` array.
      setUser(updatedUser);
    },
    onError: (error) => {
      console.error('Failed to toggle wishlist:', error);
      // In a real app, you might want to show a toast notification here
    },
  });
};
