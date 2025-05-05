import { api } from "@/utils/api";

const LOCATION_ENDPOINT = "/location";

export const locationService = {
  // Fetch all countries
  getCountries: async () => {
    return api.get(`${LOCATION_ENDPOINT}/countries`, {}, false);
  },

  // Fetch all states for a given country ID
  getStatesByCountry: async (countryId) => {
    return api.get(`${LOCATION_ENDPOINT}/states/${countryId}`, {}, false);
  },

  // Fetch all cities for a given state ID
  getCitiesByState: async (stateId) => {
    return api.get(`${LOCATION_ENDPOINT}/cities/${stateId}`, {}, false);
  }
};
