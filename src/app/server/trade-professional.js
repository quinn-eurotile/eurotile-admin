'use server'

import { tradeProfessionalServices } from "@/services/trade-professional-services/trade-professional-endpoint";
import { tradeProfessionalService, userTradeProfessionalService } from "@/services/trade-professionals";

export const getTradeProfessionalDetails = async (userId) => {
     return await tradeProfessionalService.getById(userId);
}

export const createTradeProfessional = async (data) => {
     return await userTradeProfessionalService.create(data);
}

export const verifyTradProfessionalEmail = async (token, subPath, data) => {
     return await userTradeProfessionalService.patch(token, subPath, data);
}


/* API for B2B Trade Professionals */
export const fetchDashboardData = async () => {
     return await tradeProfessionalServices.getRawData();
}
