// services/trade-professionals
import { createApiService } from "./commonService"

const TRADE_PROFESSIONALS_ENDPOINT = "/admin/trade-professional"

export const tradeProfessionalService = createApiService(TRADE_PROFESSIONALS_ENDPOINT)
