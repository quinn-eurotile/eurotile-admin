// services/trade-professionals
import { api } from "@/utils/api";
import { createApiService } from "./commonService";

const ORDER_ENDPOINT = "/order";
const ORDER_SUPPORT_TICKET_ENDPOINT = "/order/support/ticket";

export const orderServices = createApiService(ORDER_ENDPOINT)
export const orderSupportTicketServices = createApiService(ORDER_SUPPORT_TICKET_ENDPOINT);
