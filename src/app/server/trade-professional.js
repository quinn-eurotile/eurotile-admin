'use server'

import { tradeProfessionalService, userTradeProfessionalPassword, userTradeProfessionalProfile, userTradeProfessionalService } from "@/services/trade-professionals";

export const getTradeProfessionalDetails = async (userId) => {
     return await tradeProfessionalService.getById(userId);
}

export const createTradeProfessional = async (data) => {
     return await userTradeProfessionalService.create(data);
}

export const updateTradeProfessional = async (id,data) => {
     return await userTradeProfessionalService.update(id,data);
}

export const verifyTradProfessionalEmail = async (token, subPath, data) => {
     return await userTradeProfessionalService.patch(token, subPath, data);
}

export const changeTradeProfessionalPassword = async (id, data) => {
  return await userTradeProfessionalPassword.update(id,data);
}

export const updateProfile = async (id, data) => {
  return await userTradeProfessionalProfile.update(id, data);
}
