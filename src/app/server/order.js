'use server';

import { orderServices, orderSupportTicketServices } from "@/services/order";

/** GET SUPPORT TICKET LIST WITH PAGINATION */
export const getOrderList = async (currentPage, rowsPerPage, searchTerm, filter) => {
    return await orderServices.get(currentPage, rowsPerPage, searchTerm, filter);
};

export const getOrderDetails = async (orderId) => {
    return await orderServices.getById(orderId);
};

export const getOrderListForSupportTicket = async () => {
    return await orderSupportTicketServices.getAll();
};
