
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { useSessionStorage } from 'react-use';
// import { store } from '../app/store';

const RESOURCE_URL = process.env.NEXT_PUBLIC_API_URL;
const secret = process.env.NEXTAUTH_SECRET


export const sendRequest = async (endpoint, method = 'GET', body = null) => {
    // const usertoken =  localStorage.getItem('token');
    const usertoken = await getToken({ req, secret })

    console.log(usertoken ,'usertoken');

    const authHeader = {
        'Authorization': 'Bearer ' + usertoken,
        'Accept': 'application/json'
    };

    const REQUEST_URL = RESOURCE_URL + endpoint;

    const requestOptions = {
        method: method,
        url: REQUEST_URL,
        headers: authHeader,
    };

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        requestOptions.data = body; // Attach data for POST, PUT, PATCH requests
    } else if (method === 'GET') {
        requestOptions.params = body; // Attach params for GET requests
    }

    // Add responseType: 'blob' for GET requests that handle file downloads
    if (method === 'GET' && endpoint.includes('download-scope-appointment-pdf')) {
        requestOptions.responseType = 'blob'; // Set response type to blob for file download
    }

    try {
        const response = await axios(requestOptions);
        return response.data; // Return only the data from the response
    } catch (error) {
        console.error('API request failed', error);
        throw error; // Rethrow error to be handled by the caller
    }
};
