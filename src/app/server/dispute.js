'use server';

import { disputeService } from "@/services/disputeService";


/** CREATE DISPUTE  */
export const createDispute = async (data) => {
    return await disputeService.create(data);
};

/** UPDATE DISPUTE STATUS */
export const updateDisputeStatus = async (id, subPath, data) => {
    return await disputeService.patch(id, subPath, data);
};


/** GET DISPUTE DETAIL*/
export const getDisputeById = async (id) => {
    return await disputeService.get(id);
};

/** GET DISPUTE LIST WITH PAGINATION */
export const getDisputesList = async (currentPage, rowsPerPage, searchTerm, filter) => {
    return await disputeService.get(currentPage, rowsPerPage, searchTerm, filter);
};
