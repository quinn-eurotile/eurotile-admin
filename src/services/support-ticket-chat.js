// services/trade-professionals
import { createApiService } from "./commonService";

const SUPPORT_TICKET_CHAT_ENDPOINT = "/support-ticket/chat";
const SUPPORT_TICKET_LOAD_MORE_TICKETS_ENDPOINT = "/support-ticket/chat/load-more/tickets";
const SUPPORT_TICKET_LOAD_MORE_MESSAGE_ENDPOINT = "/support-ticket/chat/load-more/message";

export const supportTicketChatServices = createApiService(SUPPORT_TICKET_CHAT_ENDPOINT);
export const supportTicketLoadMoreTicketsServices = createApiService(SUPPORT_TICKET_LOAD_MORE_TICKETS_ENDPOINT);
export const supportTicketLoadMoreMessageServices = createApiService(SUPPORT_TICKET_LOAD_MORE_MESSAGE_ENDPOINT);
