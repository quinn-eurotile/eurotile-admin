/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */
'use server'

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as invoiceData } from '@/fake-db/apps/invoice'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'
import { db as profileData } from '@/fake-db/pages/userProfile'
import { db as faqData } from '@/fake-db/pages/faq'
import { db as pricingData } from '@/fake-db/pages/pricing'
import { db as statisticsData } from '@/fake-db/pages/widgetExamples'
import { tradeProfessionalService } from '@/services/trade-professionals';
import { productRawDataServices } from '@/services/product-raw-data';
import { productServices } from '@/services/product';

export const getEcommerceData = async () => {
  return eCommerceData
}

export const getAcademyData = async () => {
  return academyData
}

export const getLogisticsData = async () => {
  return vehicleData
}

export const getInvoiceData = async () => {
  return invoiceData
}

export const getUserData = async () => {
  return userData
}

export const getPermissionsData = async () => {
  return permissionData
}

export const getProfileData = async () => {
  return profileData
}

export const getFaqData = async () => {
  return faqData
}

export const getPricingData = async () => {
  return pricingData
}

export const getStatisticsData = async () => {
  return statisticsData
}

export const getOrderHistory = async () => {
  return eCommerceData.orderData
}

export const getteamMemberList = async () => {
    const response = await sendRequest('/admin/forgot-password', 'POST', { email })


return userData
}

export const getTradeProfessionalDetails = async (userId) => {
     return await tradeProfessionalService.getById(userId);
}

export const getProductRawData = async () => {
     return await productRawDataServices.getRawData();
}

export const getProductList = async (currentPage, rowsPerPage, searchTerm, filteredData) => {
     return await productServices.get(currentPage, rowsPerPage, searchTerm, filteredData);
}

export const createProduct = async (data) => {
     return await productServices.create(data);
}

export const deleteProduct = async (id) => {
     return await productServices.delete(id);
}

export const updateStatus = async (id, subPath, data) => {
     return await productServices.patch(id, subPath, data);
}


