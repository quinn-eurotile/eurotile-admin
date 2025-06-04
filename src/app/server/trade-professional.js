'use server';

import { tradeProfessionalServices } from "@/services/trade-professional-services/trade-professional-endpoint";
import { tradeProfessionalService, userProfile, userTradeProfessionalBusiness, userTradeProfessionalBusinessProfile, userTradeProfessionalPassword, userTradeProfessionalService } from "@/services/trade-professionals";

export const getTradeProfessionalDetails = async (userId) => {
     return await tradeProfessionalService.getById(userId);
};

export const createTradeProfessional = async (data) => {
     return await userTradeProfessionalService.create(data);
};

export const updateTradeProfessional = async (id, data) => {
     return await userTradeProfessionalService.update(id, data);
};

export const verifyTradProfessionalEmail = async (token, subPath, data) => {
     return await userTradeProfessionalService.patch(token, subPath, data);
};

export const updateBusinessProfileStatus = async (id, subPath, data) => {
     return await userTradeProfessionalBusinessProfile.patch(id, subPath, data);
}

export const updateBusinessStatus = async (id, subPath, data) => {
     return await userTradeProfessionalBusiness.patch(id, subPath, data);
}

/* API for B2B Trade Professionals */
export const fetchDashboardData = async () => {
     return await tradeProfessionalServices.getRawData();

};
export const changeTradeProfessionalPassword = async (id, data) => {
     return await userTradeProfessionalPassword.update(id, data);
};

export const updateProfile = async (id, data) => {
     return await userProfile.update(id, data);
};

export const addBankAccountForTradeProfessional = async (data) => {
     return await userTradeProfessionalService.addBankAccountForTradeProfessional(data);
};
