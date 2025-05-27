'use server';

import { supportTicketChatServices } from "@/services/support-ticket-chat";


/** GET CHAT MESSAGE WITH PAGINATION */
export const getChatMessageForTicket = async (id, currentPage, rowsPerPage, searchTerm, filter) => {
    return await supportTicketChatServices.getByParamsIfUrlHasId(id, currentPage, rowsPerPage, searchTerm, filter);
};

/** SEND MESSAGE */
export const sendChatMessage = async (data) => {
    return await supportTicketChatServices.create(data);
};




