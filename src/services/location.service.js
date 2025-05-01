import { api } from "@/utils/api"

const LOCATION_ENDPOINT = "/api/V1/location"

export const locationService = {
  // Fetch all countries
  getCountries: async () => {
    return api.get(`${LOCATION_ENDPOINT}/countries`)
  },

  // Fetch all states for a given country ID
  getStates: async (countryId) => {
    return api.get(`${LOCATION_ENDPOINT}/states/${countryId}`)
  },

  // Fetch all cities for a given state ID
  getCities: async (stateId) => {
    return api.get(`${LOCATION_ENDPOINT}/cities/${stateId}`)
  }
}
