// services/trade-professionals
import { createApiService } from "./commonService"

const TRADE_PROFESSIONALS_ENDPOINT = "/admin/trade-professional"
const USER_TRADE_PROFESSIONALS_ENDPOINT = "/user/trade-professional"
const USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT = "/profile/password"
const USER_TRADE_PROFESSIONALS_PROFILE_ENDPOINT = "/profile"

export const tradeProfessionalService = createApiService(TRADE_PROFESSIONALS_ENDPOINT)

export const userTradeProfessionalService = createApiService(USER_TRADE_PROFESSIONALS_ENDPOINT)

export const userTradeProfessionalPassword = createApiService(USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT)

export const userTradeProfessionalProfile = createApiService(USER_TRADE_PROFESSIONALS_PROFILE_ENDPOINT)
