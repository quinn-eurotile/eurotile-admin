// services/commonService.js
import { api } from "@/utils/api";

export const createApiService = (baseEndpoint, customMethods = {}) => {
  const defaultService = {
    // Get all items with pagination, search string and filters
    get: async (page = 1, limit = 10, searchString = "", filter = {}) => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filter,
        ...(searchString ? { search_string: searchString } : {}),
      }).toString();

      return api.get(`${baseEndpoint}?${queryParams}`, {}, false);
    },

    // Get item by ID
    getById: async (id) => {
      return api.get(`${baseEndpoint}/${id}`, {}, false);
    },

    getRawData: async (data = {}) => {
      return api.get(`${baseEndpoint}`, data, false);
    },

    // Create a new item
    create: async (data) => {
      return api.post(baseEndpoint, data, {
        'Content-Type': 'multipart/form-data',
      },
      );
    },

    // Update an item
    update: async (id, data) => {
      return api.put(`${baseEndpoint}/${id}`, data);
    },

    // Delete an item
    delete: async (id) => {
      return api.delete(`${baseEndpoint}/${id}`);
    },

    // Patch sub-resource or partial update
    patch: async (id, subPath, data) => {
      return api.patch(`${baseEndpoint}/${id}/${subPath}`, data);
    },
  };

  // Merge and return with overrides or new methods
  return {
    ...defaultService,
    ...customMethods,
  };
};
