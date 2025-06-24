// services/trade-professionals
import { createApiService } from "./commonService";
// Define the endpoints
const RETAIL_CUSTOMER_ENDPOINT = "/admin/retail-customer";
// const USER_RETAIL_CUSTOMER_PASSWORD_ENDPOINT = "/profile/password";
// const USER_PROFILE_ENDPOINT = "/profile";
// const RETAIL_CUSTOMER_BUSINESS_USER_PROFILE_ENDPOINT = "/admin/retail-customer/business-profile";
// const RETAIL_CUSTOMER_BUSINESS_ENDPOINT = "/admin/retail-customer/business";
// const RETAIL_CUSTOMER_COMMISSION_ENDPOINT = "/user/retail-customer/commission";



// Create API services for each endpoint
export const retailCustomerService = createApiService(RETAIL_CUSTOMER_ENDPOINT);
// export const userTradeProfessionalPassword = createApiService(USER_RETAIL_CUSTOMER_PASSWORD_ENDPOINT);
// export const userTradeProfessionalBusinessProfile = createApiService(RETAIL_CUSTOMER_BUSINESS_USER_PROFILE_ENDPOINT);
// export const userTradeProfessionalBusiness = createApiService(RETAIL_CUSTOMER_BUSINESS_ENDPOINT);
// export const userProfile = createApiService(USER_PROFILE_ENDPOINT);
// export const tradeProfessionalCommission = createApiService(RETAIL_CUSTOMER_COMMISSION_ENDPOINT);



