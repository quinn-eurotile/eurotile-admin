'use server'

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
