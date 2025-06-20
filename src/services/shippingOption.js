import { createApiService } from "./commonService";

const SHIPPING_OPTION_ENDPOINT = "/shipping-option";

export const shippingOption = createApiService(SHIPPING_OPTION_ENDPOINT);