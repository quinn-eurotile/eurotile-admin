'use server';

import { supportTicketServices } from "@/services/support-ticket";


/** DELETE SUPPORT TICKET */
export const deleteSupportTicket = async (id) => {
    return await supportTicketServices.delete(id);
};

/** CREATE SUPPORT TICKET */
export const createSupportTicket = async (data) => {
    return await supportTicketServices.create(data);
};

/** GET SUPPORT TICKET LIST WITH PAGINATION */
export const getSupportTicketList = async (currentPage, rowsPerPage, searchTerm, filter) => {
    return await supportTicketServices.get(currentPage, rowsPerPage, searchTerm, filter);
};



