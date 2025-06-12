'use server';

import { supportTicketChatServices, supportTicketLoadMoreTicketsServices, supportTicketLoadMoreMessageServices } from "@/services/support-ticket-chat";


/** GET CHAT MESSAGE WITH PAGINATION */
export const getChatMessageForTicket = async (id, currentPage, rowsPerPage, searchTerm, filter) => {
    return await supportTicketChatServices.getByParamsIfUrlHasId(id, currentPage, rowsPerPage, searchTerm, filter);
};

/** LOAD MORE TICKETS */
export const loadMoreTickets = async (id, currentPage, rowsPerPage, searchTerm, filter) => {
    return await supportTicketLoadMoreTicketsServices.getByParamsIfUrlHasId(id, currentPage, rowsPerPage, searchTerm, filter);
};

/** Load More Messages */
export const loadMoreMessages = async (id, currentPage, rowsPerPage, searchTerm, filter) => {
    return await supportTicketLoadMoreMessageServices.getByParamsIfUrlHasId(id, currentPage, rowsPerPage, searchTerm, filter);
};

export const getRawDataForChat = async () => {
    return await supportTicketChatServices.getRawData();
};

/** SEND MESSAGE */
export const sendChatMessage = async (data) => {
    return await supportTicketChatServices.create(data);
};
