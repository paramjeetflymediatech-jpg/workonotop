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

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        // Many backends use Bearer token, website uses cookie. 
        // We'll pass it in headers as standard for mobile.
        headers['Authorization'] = `Bearer ${token}`;
        // Also adding it to cookies manually if needed by the backend Next.js API
        // since Next.js API routes often look at cookies.
        headers['Cookie'] = `token=${token}; provider_token=${token}; admin_token=${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

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
    post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
