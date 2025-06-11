// services/trade-professionals
import { createApiService } from "./commonService";

const ORDER_ENDPOINT = "/order";
const ORDER_SUPPORT_TICKET_ENDPOINT = "/order/support/ticket";


export const orderServices = createApiService(ORDER_ENDPOINT, {
  // Custom methods specific to orders
  updateOrderStatus: async (orderId, data) => {
    return api.put(`${ORDER_ENDPOINT}/${orderId}/status`, data);
  },

  getCustomerOrders: async (customerId, page = 1, limit = 10, searchString = '', filter = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filter,
      ...(searchString ? { search_string: searchString } : {})
    }).toString();

    return api.get(`${ORDER_ENDPOINT}/customer/${customerId}?${queryParams}`);
  },

  getStats: async () => {
    return api.get(`${ORDER_ENDPOINT}/stats`);
  },
  getOrderHistory: async (orderId) => {
    return api.get(`${ORDER_ENDPOINT}/history/${orderId}`);
  }
})
export const orderSupportTicketServices = createApiService(ORDER_SUPPORT_TICKET_ENDPOINT);
