import api from '@/utils/api';

export const supplierOrderService = {
    getOrders: async (page = 1, limit = 10, status = '') => {
        try {
            const response = await api.get('/supplier/orders', {
                params: { page, limit, status }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching supplier orders:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/supplier/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId, status, notes) => {
        try {
            const response = await api.patch(`/supplier/orders/${orderId}/status`, {
                status,
                notes
            });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
};
