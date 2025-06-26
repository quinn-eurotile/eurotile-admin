'use server';

import { promotionServices } from "@/services/promotionService";


/** DELETE PROMOTION */
export const deletePromotion = async (id) => {
    return await promotionServices.delete(id);
};

/** CREATE PROMOTION */
export const createPromotion = async (data) => {
    return await promotionServices.create(data);
};

/** Update PROMOTION */
export const updatePromotion = async (id, data) => {
    return await promotionServices.update(id, data);
};

export const updatePromotionStatus = async (id, subPath, data) => {
    return await promotionServices.patch(id, subPath, data);
};

/** GET PROMOTION LIST WITH PAGINATION */
export const getPromotionList = async (currentPage, rowsPerPage, searchTerm, filter) => {
    return await promotionServices.get(currentPage, rowsPerPage, searchTerm, filter);
};
