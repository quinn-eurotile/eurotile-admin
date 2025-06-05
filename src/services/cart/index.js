import { api } from "@/utils/api"; 
import { createApiService } from "../commonService";
 const CART_API = '/cart';

export const cartApi = createApiService(CART_API ,  {
  // Get user's cart
  getCart: async (userId) => {
    try {
      const response = await api.get(`${CART_API}/${userId}`);
      console.log(response.data, 'response.data 317');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => { 
    try {
      const response = await api.put(`${CART_API}/item`, {
        id: itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    try {
      const response = await api.delete(`${CART_API}/item/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  // Add item to wishlist
  addToWishlist: async (itemId) => {
    try {
      const response = await api.post(`${CART_API}/wishlist`, {
        itemId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Apply promo code
  applyPromoCode: async (code) => {
    try {
      const response = await api.post(`${CART_API}/promo`, {
        code
      });
      return response.data;
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw error;
    }
  },

  // Update shipping method
  updateShippingMethod: async (userId, method) => {
    try {
      const response = await axios.put(`${CART_API}/shipping`, {
        userId,
        method
      });
      return response.data;
    } catch (error) {
      console.error('Error updating shipping method:', error);
      throw error;
    }
  }
}); 