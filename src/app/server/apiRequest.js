import axios from "axios";
import { useSession } from "next-auth/react";

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  if (!session?.accessToken) {
      throw new Error('No access token available');
  }

  const authHeader = {
      'Authorization': `Bearer ${session.accessToken}`,
      'Accept': 'application/json'
  };

  const REQUEST_URL = RESOURCE_URL + endpoint;

  const requestOptions = {
      method: method,
      url: REQUEST_URL,
      headers: authHeader,
  };

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      requestOptions.data = body;
  } else if (method === 'GET') {
      requestOptions.params = body;
  }

  if (method === 'GET' && endpoint.includes('download-scope-appointment-pdf')) {
      requestOptions.responseType = 'blob';
  }

  try {
      const response = await axios(requestOptions);

      
return response.data;
  } catch (error) {
      console.error('API request failed', error);
      throw error;
  }
};
