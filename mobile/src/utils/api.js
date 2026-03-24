import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('token');
    } catch (e) {
        return null;
    }
};

const request = async (endpoint, options = {}) => {
    const token = await getAuthToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...options.headers,
    };

    // Only set application/json if not FormData
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        // Standardize cookie names for Next.js consistency
        headers['Cookie'] = `token=${token}; provider_token=${token}; admin_token=${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle empty responses or errors that return non-JSON
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const api = {
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => {
        const isFormData = body instanceof FormData;
        return request(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body)
        });
    },
    put: (endpoint, body, options) => {
        const isFormData = body instanceof FormData;
        return request(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? body : JSON.stringify(body)
        });
    },
    patch: (endpoint, body, options) => {
        const isFormData = body instanceof FormData;
        return request(endpoint, {
            ...options,
            method: 'PATCH',
            body: isFormData ? body : JSON.stringify(body)
        });
    },
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
