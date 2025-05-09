'use server'

import { api } from "@/utils/api";

const AUTH_ENDPOINT = "/admin/forgot-password";

// Export async functions directly instead of wrapping them in an object

export async function forgotPasswordApi(email) {
  try {
    const response = await api.post(`${AUTH_ENDPOINT}/`, { email })
    return response
  } catch (error) {
    throw error?.response || error
  }

}
