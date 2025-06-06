// services/trade-professionals
import { createApiService } from "./commonService";
import { api } from "@/utils/api";

// Define the endpoints
const TRADE_PROFESSIONALS_ENDPOINT = "/admin/trade-professional";
const USER_TRADE_PROFESSIONALS_ENDPOINT = "/user/trade-professional";
const USER_TRADE_PROFESSIONALS_CLIENT_ENDPOINT = "/user/trade-professional/client";
const USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT = "/profile/password";
const USER_PROFILE_ENDPOINT = "/profile";
const TRADE_PROFESSIONALS_BUSINESS_USER_PROFILE_ENDPOINT = "/admin/trade-professional/business-profile";
const TRADE_PROFESSIONALS_BUSINESS_ENDPOINT = "/admin/trade-professional/business";



// Create API services for each endpoint
export const tradeProfessionalService = createApiService(TRADE_PROFESSIONALS_ENDPOINT);
export const userTradeProfessionalClientService = createApiService(USER_TRADE_PROFESSIONALS_CLIENT_ENDPOINT);
export const userTradeProfessionalPassword = createApiService(USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT);
export const userTradeProfessionalBusinessProfile = createApiService(TRADE_PROFESSIONALS_BUSINESS_USER_PROFILE_ENDPOINT);
export const userTradeProfessionalBusiness = createApiService(TRADE_PROFESSIONALS_BUSINESS_ENDPOINT);
export const userProfile = createApiService(USER_PROFILE_ENDPOINT);
export const userTradeProfessionalService = createApiService(USER_TRADE_PROFESSIONALS_ENDPOINT, {
    addBankAccountForTradeProfessional: async (data) => {
        return api.post(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/create-connect-account`, data);
    },
    getAllClients: async () => { 
        try {
          const response = await api.get(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/client/all`);
          console.log(response,'response getAllClients 222');
          
          return response;
        } catch (error) {
          console.error('Error fetching clients:', error);
          return {
            type: 'error',
            message: error.response?.data?.message || 'Failed to fetch clients',
            data: null
          };
        }
      }
});

 
