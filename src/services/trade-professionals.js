// services/trade-professionals
import { createApiService } from "./commonService"

const TRADE_PROFESSIONALS_ENDPOINT = "/admin/trade-professional"
const USER_TRADE_PROFESSIONALS_ENDPOINT = "/user/trade-professional"

export const tradeProfessionalService = createApiService(TRADE_PROFESSIONALS_ENDPOINT)

export const userTradeProfessionalService = createApiService(USER_TRADE_PROFESSIONALS_ENDPOINT)
