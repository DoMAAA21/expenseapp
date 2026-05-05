import axios from 'axios';

const http = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000') + "/api",
    withCredentials: true,
});

http.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - cookies will be cleared by backend
            // Redirect to login page if not already there
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default http;