import api from "@shared/api/api";
import type { ApiResponse } from "@shared/types/api.types";
import type { AuthUser } from "@features/auth/types/auth.types";

export const userService = {
  toggleWishlist: async (itineraryId: string): Promise<AuthUser> => {
    const response = await api.put<never, ApiResponse<AuthUser>>(`/users/wishlist/${itineraryId}`);
    return response.data;
  },
};
