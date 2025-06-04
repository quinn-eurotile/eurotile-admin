// services/trade-professionals
import { createApiService } from "./commonService";
import { api } from "@/utils/api";

// Define the endpoints
const TRADE_PROFESSIONALS_ENDPOINT = "/admin/trade-professional";
const USER_TRADE_PROFESSIONALS_ENDPOINT = "/user/trade-professional";
const USER_TRADE_PROFESSIONALS_CLIENT_ENDPOINT = "/user/trade-professional/client";
const USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT = "/profile/password";
const USER_TRADE_PROFESSIONALS_PROFILE_ENDPOINT = "/profile";
const TRADE_PROFESSIONALS_BUSINESS_PROFILE_ENDPOINT = "/admin/trade-professional/business-profile";
const TRADE_PROFESSIONALS_BUSINESS_ENDPOINT = "/admin/trade-professional/business";



// Create API services for each endpoint
export const tradeProfessionalService = createApiService(TRADE_PROFESSIONALS_ENDPOINT);
export const userTradeProfessionalClientService = createApiService(USER_TRADE_PROFESSIONALS_CLIENT_ENDPOINT);
export const userTradeProfessionalPassword = createApiService(USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT);
export const userTradeProfessionalBusinessProfile = createApiService(TRADE_PROFESSIONALS_BUSINESS_PROFILE_ENDPOINT);
export const userTradeProfessionalBusiness = createApiService(TRADE_PROFESSIONALS_BUSINESS_ENDPOINT);
export const userTradeProfessionalProfile = createApiService(USER_TRADE_PROFESSIONALS_PROFILE_ENDPOINT);
export const userTradeProfessionalService = createApiService(USER_TRADE_PROFESSIONALS_ENDPOINT, {
    addBankAccountForTradeProfessional: async (data) => {
        return api.post(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/create-connect-account`, data);
    },
});
