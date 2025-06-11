'use server';

import { supplierOrderService } from '@/services/supplierOrderService';

export async function getSupplierOrders(page = 1, limit = 10, status = '') {
    try {
        const response = await supplierOrderService.getOrders(page, limit, status);
        return response.data;
    } catch (error) {
        console.error('Error in getSupplierOrders action:', error);
        throw new Error('Failed to fetch supplier orders');
    }
}

export async function getSupplierOrderDetails(orderId) {
    try {
        const response = await supplierOrderService.getOrderDetails(orderId);
        return response.data;
    } catch (error) {
        console.error('Error in getSupplierOrderDetails action:', error);
        throw new Error('Failed to fetch order details');
    }
}

export async function updateSupplierOrderStatus(orderId, status, notes) {
    try {
        const response = await supplierOrderService.updateOrderStatus(orderId, status, notes);
        return response.data;
    } catch (error) {
        console.error('Error in updateSupplierOrderStatus action:', error);
        throw new Error('Failed to update order status');
    }
}
