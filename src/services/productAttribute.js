// services/trade-professionals
import { createApiService } from "./commonService"

const PRODUCTS_ATTRIBUTE_ENDPOINT = "/product/attribute"

export const productAttribute = createApiService(PRODUCTS_ATTRIBUTE_ENDPOINT)
