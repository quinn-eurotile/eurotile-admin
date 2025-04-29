import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "react-toastify";

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Get common headers including Authorization
const getCommonHeaders = async () => {
  const session = await getSession();

  return {
    "Content-Type": "application/json",
    authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
  };
};

// Generic API request using Axios
const apiRequest = async (endpoint, method, data = null, customHeaders = {} ,  showToastOnError = true) => {
  try {
    const headers = {
      ...(await getCommonHeaders()),
      ...customHeaders,
    };

    const RESOURCE_URL = API_BASE_URL;
    const REQUEST_URL = RESOURCE_URL + endpoint;

    const config = {
      method: method,
      url: REQUEST_URL,
      headers: headers,
      data: data??'',
      withCredentials: true,
    };
    if(method=='DELETE'){
      delete config.data
    }
    const response = await axios(config);
    if (showToastOnError) {
        // Show success toast on success
    toast.success(response.data?.message || 'Request successful', { toastId: 'success1', autoClose: 3000 },   );

    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || "Request successful",
      statusCode: response.status,
    };

  } catch (error) {
    console.error("API request error:", error);

    const statusCode = error?.response?.status || 500;
    const errorData = error?.response?.data || {};
    const errorMessage = errorData?.message || error.message || "An error occurred";
    if (showToastOnError) {
      switch (statusCode) {
        case 400:
          toast.error("Bad Request: " + errorMessage , { toastId: 'success1' , autoClose: 3000});
          break;
        case 401:
          toast.error("Unauthorized. Please log in.", { toastId: 'success1' , autoClose: 3000});
          break;
        case 422:
          toast.error("Validation error: " + errorMessage, { toastId: 'success1', autoClose: 3000 });
          break;
        case 500:
        default:
          toast.error("Server error: " + errorMessage, { toastId: 'success1' , autoClose: 3000});
          break;
      }
    }

    return {
      success: false,
      data: errorData?.data || null,
      error: errorData?.error || errorMessage,
      message: errorMessage,
      statusCode: statusCode,
    };
  }
};

// Exported API methods
export const api = {
  get: (endpoint, customHeaders,showToastOnError) => apiRequest(endpoint, "GET", null, customHeaders,showToastOnError),
  post: (endpoint, data, customHeaders,showToastOnError) => apiRequest(endpoint, "POST", data, customHeaders,showToastOnError),
  put: (endpoint, data, customHeaders,showToastOnError) => apiRequest(endpoint, "PUT", data, customHeaders,showToastOnError),
  patch: (endpoint, data, customHeaders,showToastOnError) => apiRequest(endpoint, "PATCH", data, customHeaders,showToastOnError),
  delete: (endpoint, customHeaders,showToastOnError) => apiRequest(endpoint, "DELETE", null, customHeaders,showToastOnError),
};

// Error handling helper
export const handleApiError = (error) => {
  console.error("API Error:", error);

  return {
    success: false,
    message: error?.message || "An unexpected error occurred",
  };
};
