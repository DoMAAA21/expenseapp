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
    async (error) => {
        const originalRequest = error.config as { _retry?: boolean; url?: string };
        const isAuthRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRefreshRequest) {
            originalRequest._retry = true;
            try {
                await http.post('/auth/refresh');
                return http(error.config);
            } catch (_refreshError) {
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }


        return Promise.reject(error);
    }
);

export default http;