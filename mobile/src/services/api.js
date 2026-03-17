import { API_BASE_URL } from '../config';

/**
 * Core request helper for the mobile application.
 * Manages URL construction, headers, authentication tokens, and error handling.
 * 
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/auth/me')
 * @param {Object} options - Fetch options including method, body, params, and token
 * @returns {Promise<Object>} - The parsed JSON response
 */
let logoutHandler = null;

export const setLogoutHandler = (handler) => {
    logoutHandler = handler;
};

const request = async (endpoint, options = {}) => {
    try {
        const { params, token, ...fetchOptions } = options;

        // Construct URL with query parameters if provided
        let url = `${API_BASE_URL}${endpoint}`;
        if (params && Object.keys(params).length) {
            url += `?${new URLSearchParams(params).toString()}`;
        }

        console.log(`🌐 [API Request] ${fetchOptions.method || 'GET'} ${endpoint}`);

        const isFormData = fetchOptions.body instanceof FormData;

        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                ...(!isFormData && { 'Content-Type': 'application/json' }),
                // Attach Bearer token if available
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...fetchOptions.headers,
            },
        });

        // Determine content type to parse response correctly
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text };
        }

        // Handle unsuccessful responses
        if (!response.ok) {
            console.error(`❌ [API Error] ${response.status} ${endpoint}:`, data.message || 'Unknown error');
            
            // Auto-logout triggers:
            // 401 = Unauthorized (Invalid token)
            // 404 = Not Found (Critical profiles missing, especially on load)
            if (response.status === 401 || (response.status === 404 && data.message?.toLowerCase().includes('not found'))) {
                if (logoutHandler) {
                    console.log('🚪 [API Service] Session invalid or profile missing. Triggering global logout...');
                    logoutHandler();
                }
            }
            
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        console.log(`✅ [API Success] ${endpoint}`);
        return data;
    } catch (error) {
        // Detailed error logging for debugging
        console.error(`🔥 [API Exception] ${endpoint}:`, error.message);
        throw error;
    }
};

/**
 * Unified API Service for the WorkOnTap Mobile App.
 * Organized by functional areas to mirror the backend API architecture.
 */
export const apiService = {

    /**
     * 🔐 AUTHENTICATION SERVICES
     * Handles user identification, registration, and security.
     */
    auth: {
        // Sign in using email and password (unified for all roles)
        login: (data) => request('/api/auth/mobile/login', { method: 'POST', body: JSON.stringify(data) }),

        // Register a new customer account
        signup: (data) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

        // Initiate password recovery (sends 6-digit OTP)
        forgotPassword: (email) => request('/api/auth/mobile/forgot-password', { method: 'POST', body: JSON.stringify({ email, source: 'mobile' }) }),

        // Verify the 6-digit OTP received via email
        verifyOtp: (email, otp) => request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

        // Set a new password using the verified email and OTP
        resetPassword: (data) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

        // Retrieve current authenticated user profile
        me: (token) => request('/api/auth/me', { method: 'GET', token }),

        // Terminate the current session
        logout: (token) => request('/api/auth/logout', { method: 'POST', token }),

        // Change account password
        changePassword: (data, token) => request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data), token }),
    },

    /**
     * ⚙️ USER SETTINGS & PREFERENCES
     */
    user: {
        // Fetch user preferences
        getSettings: (token) => request('/api/user/settings', { method: 'GET', token }),

        // Update user preferences
        updateSettings: (data, token) => request('/api/user/settings', { method: 'PUT', body: JSON.stringify(data), token }),

        // Address Management
        addresses: {
            list: (token) => request('/api/user/addresses', { method: 'GET', token }),
            add: (data, token) => request('/api/user/addresses', { method: 'POST', body: JSON.stringify(data), token }),
            update: (id, data, token) => request(`/api/user/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
            delete: (id, token) => request(`/api/user/addresses/${id}`, { method: 'DELETE', token }),
        }
    },

    /**
     * 👤 CUSTOMER SERVICES
     * Endpoints for customer-specific actions and data retrieval.
     */
    customer: {
        // Fetch bookings associated with the customer
        getBookings: (token) => request('/api/customer/bookings', { method: 'GET', token }),

        // Get details for a specific booking
        getBookingDetails: (id, token) => request('/api/customer/booking-details', { method: 'GET', params: { bookingId: id }, token }),

        // Create a new service booking
        createBooking: (data, token) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data), token }),

        // Approve a completed job for payment
        approveBooking: (id, token) => request(`/api/customer/bookings/${id}/approve`, { method: 'POST', token }),

        // Fetch invoices associated with the customer
        getInvoices: (userId, token) => request('/api/customer/invoices', { method: 'GET', params: { user_id: userId }, token }),

        // Submit a rating and review for a provider
        submitReview: (data, token) => request('/api/customer/reviews', { method: 'POST', body: JSON.stringify(data), token }),
    },

    /**
     * 🛠️ PROVIDER SERVICES
     * Endpoints for service provider workflows and onboarding.
     */
    provider: {
        // Retrieve current authenticated provider profile
        me: (token) => request('/api/provider/me', { method: 'GET', token }),

        // Register as a new service provider
        signup: (data) => request('/api/provider/signup', { method: 'POST', body: JSON.stringify(data) }),

        // Get a list of jobs available for matching
        getAvailableJobs: (token) => request('/api/provider/available-jobs', { method: 'GET', token }),

        // Retrieve summary stats for the provider dashboard
        getDashboardStats: (token) => request('/api/provider/dashboard-stats', { method: 'GET', token }),

        // Fetch jobs currently assigned to the provider
        getMyBookings: (token) => request('/api/provider/bookings', { method: 'GET', token }),

        // Get full details and requirements for a job
        getJobDetails: (id, token) => request(`/api/provider/jobs/${id}`, { method: 'GET', token }),

        // Update provider profile information (skills, specialty, etc.)
        updateProfile: (data, token) => request('/api/provider/profile', { method: 'PUT', body: JSON.stringify(data), token }),

        // View payout history and pending balances
        getPayouts: (token) => request('/api/provider/payouts', { method: 'GET', token }),

        /**
         * 📝 ONBOARDING FLOW
         * Step-by-step registration for new providers.
         */
        onboarding: {
            updateProfile: (data, token) => request('/api/provider/onboarding/profile', { method: 'POST', body: JSON.stringify(data), token }),
            uploadDocument: (data, token) => request('/api/provider/onboarding/upload-document', { method: 'POST', body: data, token }),
            complete: (token) => request('/api/provider/onboarding/complete', { method: 'POST', token }),
            createStripeAccount: (data, token) => request('/api/provider/onboarding/create-stripe-account', { method: 'POST', body: JSON.stringify(data), token }),
            stripeComplete: (data, token) => request('/api/provider/onboarding/stripe-complete', { method: 'POST', body: JSON.stringify(data), token }),
        },

        /**
         * 🛡️ VERIFICATION & SECURITY
         */
        validateResetToken: (token) => request('/api/provider/validate-reset-token', { method: 'POST', body: JSON.stringify({ token }) }),
        verifyEmail: (token) => request('/api/provider/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),

        /**
         * ⏲️ JOB PROGRESS & TIME TRACKING
         */
        timeTracking: {
            // Log job timer actions (start, pause, complete)
            logTime: (data, token) => request('/api/provider/jobs/time-tracking', { method: 'POST', body: JSON.stringify(data), token }),

            // Upload "Before" or "After" photos for verification
            uploadPhoto: (data, token) => request('/api/provider/jobs/photos', { method: 'POST', body: JSON.stringify(data), token }),
        }
    },

    /**
     * 💬 CHAT SERVICES
     * Facilitates communication between customers and providers for a booking.
     */
    chat: {
        // Fetch chat history for a specific booking
        getMessages: (bookingId, token) => request('/api/chat', { method: 'GET', params: { bookingId }, token }),

        // Send a new message
        sendMessage: (data, token) => request('/api/chat', { method: 'POST', body: JSON.stringify(data), token }),

        // Get the total number of unread messages for the user
        getUnreadCount: (token) => request('/api/chat/unread', { method: 'GET', token }),

        // Mark messages for a booking as read
        markRead: (bookingId, token) => request('/api/chat/mark-read', { method: 'POST', body: JSON.stringify({ bookingId }), token }),
    },

    /**
     * 🌐 GENERAL SERVICES
     * Publicly accessible data for app content.
     */
    general: {
        // List all available service categories (e.g., Plumbing, Cleaning)
        getCategories: () => request('/api/categories', { method: 'GET' }),

        // Get list of specific services, optionally filtered by category
        getServices: (categoryId) => request('/api/services', { method: 'GET', params: { categoryId } }),

        // Public platform statistics
        getStats: () => request('/api/stats', { method: 'GET' }),
    },

    /**
     * 🏗️ GENERIC REQUEST HELPERS
     * Generic methods for custom or legacy calls.
     */
    get: (endpoint, params = {}, token = null, extraOptions = {}) =>
        request(endpoint, { method: 'GET', params, token, ...extraOptions }),

    post: (endpoint, data, token = null, extraOptions = {}) => {
        const isFormData = data instanceof FormData;
        return request(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
            token,
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
            ...extraOptions
        });
    },

    put: (endpoint, data, token = null, extraOptions = {}) => {
        const isFormData = data instanceof FormData;
        return request(endpoint, {
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
            token,
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
            ...extraOptions
        });
    },

    delete: (endpoint, token = null, extraOptions = {}) =>
        request(endpoint, { method: 'DELETE', token, ...extraOptions }),
};
