import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getSupplierOrders,
    getSupplierOrderDetails,
    updateSupplierOrderStatus
} from '@/app/server/actions/supplierOrders';
import { toast } from 'react-hot-toast';

export const useSupplierOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const { user } = useAuth();

    const fetchOrders = useCallback(async (page = 1, limit = 10, status = '') => {
        try {
            setLoading(true);
            const data = await getSupplierOrders(page, limit, status);
            setOrders(data.orders);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error('Error fetching supplier orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        orders,
        loading,
        total,
        fetchOrders
    };
};

export const useSupplierOrderDetails = (orderId) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSupplierOrderDetails(orderId);
            setOrderDetails(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const updateStatus = useCallback(async (status, notes) => {
        try {
            const data = await updateSupplierOrderStatus(orderId, status, notes);
            toast.success('Order status updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
            throw error;
        }
    }, [orderId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    return {
        orderDetails,
        loading,
        updateStatus,
        refreshDetails: fetchDetails
    };
};
