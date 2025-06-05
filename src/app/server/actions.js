/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */
'use server';

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce';
import { db as academyData } from '@/fake-db/apps/academy';
import { db as vehicleData } from '@/fake-db/apps/logistics';
import { db as invoiceData } from '@/fake-db/apps/invoice';
import { db as userData } from '@/fake-db/apps/userList';
import { db as permissionData } from '@/fake-db/apps/permissions';
import { db as profileData } from '@/fake-db/pages/userProfile';
import { db as faqData } from '@/fake-db/pages/faq';
import { db as pricingData } from '@/fake-db/pages/pricing';
import { db as cartData } from '@/fake-db/pages/cart';
import { db as statisticsData } from '@/fake-db/pages/widgetExamples';
import { tradeProfessionalService } from '@/services/trade-professionals';
import { productRawDataServices } from '@/services/product-raw-data';
import { productFrontListServices, productServices } from '@/services/product';
import {  cartServices } from '@/services/cart'
import { addressService } from '@/services/address'
import { adminSettingServices } from '@/services/adminSetting';
import { cartApi } from '@/services/cart/index';

export const getEcommerceData = async () => {
  return eCommerceData;
};

export const getAcademyData = async () => {
  return academyData;
};

export const getLogisticsData = async () => {
  return vehicleData;
};

export const getInvoiceData = async () => {
  return invoiceData;
};

export const getUserData = async () => {
  return userData;
};

export const getPermissionsData = async () => {
  return permissionData;
};

export const getProfileData = async () => {
  return profileData;
};

export const getFaqData = async () => {
  return faqData;
};

export const getPricingData = async () => {
  return pricingData;
};

export const getStatisticsData = async () => {
  return statisticsData;
};

export const getOrderHistory = async () => {
  return eCommerceData.orderData;
};

export const getteamMemberList = async () => {
  const response = await sendRequest('/admin/forgot-password', 'POST', { email });


  return userData;
};

// export const getTradeProfessionalDetails = async (userId) => {
//      return await tradeProfessionalService.getById(userId);
// }

export const getProductRawData = async () => {
  return await productRawDataServices.getRawData();
};

export const getProductList = async (currentPage, rowsPerPage, searchTerm, filteredData) => {
  return await productServices.get(currentPage, rowsPerPage, searchTerm, filteredData);
};

export const getFrontProductList = async (currentPage, rowsPerPage, searchTerm, filteredData) => {
  return await productFrontListServices.get(currentPage, rowsPerPage, searchTerm, filteredData);
};

export const createProduct = async (data) => {
  return await productServices.create(data);
};

export const updateProduct = async (id, data) => {
  return await productServices.update(id, data);
};

export const deleteProduct = async (id) => {
  return await productServices.delete(id);
};

export const updateStatus = async (id, subPath, data) => {
  return await productServices.patch(id, subPath, data);
};

export const getProductDetails = async (id) => {
  return await productServices.getById(id);
};

export const getAdminSettingDetail = async (id) => {
  return await adminSettingServices.getById(id);
};



export const updateAdminSetting = async (id, data) => {
  return await adminSettingServices.update(id, data);
};

export const getCartData = async (userId) => {
  // You can ignore userId in this dummy implementation if you want
  const items = cartData;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.count,
    0
  );
  const discount = 0;
  const shipping = 20;
  const total = subtotal + shipping - discount;

  return {
    success: true,
    message: "Cart data retrieved successfully",
    data: {
      userId,
      items,
      orderSummary: {
        subtotal,
        discount,
        shipping,
        total,
      },
    },
  };
};
export const addCart = async (data) => {
     return await cartServices.create(data);
}

export const addAddress = async (data) => {
     return await addressService.create(data);
}
export const updateAddress = async (id ,data) => {
     return await addressService.update(id,data);
}
export const getAddresses = async (id) => {
     return await addressService.getById(id);
}
export const deleteAddresses = async (id) => {
     return await addressService.delete(id);
}

// Cart Actions
export const updateCartItem = async (data) => {
  return await cartApi.updateCartItem(data.id, data);
};

export const removeCartItem = async (id) => {
  return await cartApi.removeCartItem(id);
};

export const addToWishlist = async (data) => {
  return await cartServices.addToWishlist(data);
};

export const applyPromoCode = async (code) => {
  return await cartServices.applyPromo(code);
};

// Payment Actions
export const createPaymentIntent = async (data) => {
  return await cartServices.createPaymentIntent(data);
};

export const createKlarnaSession = async (data) => {
  return await cartServices.createKlarnaSession(data);
};

export const verifyStripePayment = async (paymentIntentId) => {
  return await cartServices.verifyStripePayment(paymentIntentId);
};

export const verifyKlarnaPayment = async (orderId) => {
  return await cartServices.verifyKlarnaPayment(orderId);
};


