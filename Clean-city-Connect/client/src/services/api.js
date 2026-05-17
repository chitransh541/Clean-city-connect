import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * Axios instance with base URL and auth token interceptor.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/* ============================================
   AUTH API
   ============================================ */
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updatePhone: (data) => api.put('/auth/update-phone', data),
};

/* ============================================
   COMPLAINTS API
   ============================================ */
export const complaintsApi = {
  create: (data) => api.post('/complaints', data),
  getMyComplaints: (params) => api.get('/complaints', { params }),
  getAllComplaints: (params) => api.get('/complaints/all', { params }),
  getMapComplaints: (params) => api.get('/complaints/map', { params }),
  getStats: () => api.get('/complaints/stats'),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
};

/* ============================================
   UPLOAD API
   ============================================ */
export const uploadApi = {
  uploadMedia: (formData) => api.post('/upload/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

/* ============================================
   AI API
   ============================================ */
export const aiApi = {
  analyze: (data) => api.post('/ai/analyze', data),
};

/* ============================================
   FEEDBACK API
   ============================================ */
export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
};
