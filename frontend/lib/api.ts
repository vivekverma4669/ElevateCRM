import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data),
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: unknown) => api.patch('/auth/profile', data),
};

// Lead endpoints
export const leadsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/leads', { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  create: (data: unknown) => api.post('/leads', data),
  update: (id: string, data: unknown) => api.patch(`/leads/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/leads/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/leads/${id}`),
  getKanban: () => api.get('/leads/kanban'),
  getNotes: (leadId: string) => api.get(`/leads/${leadId}/notes`),
  createNote: (leadId: string, data: unknown) => api.post(`/leads/${leadId}/notes`, data),
  updateNote: (leadId: string, noteId: string, data: unknown) =>
    api.patch(`/leads/${leadId}/notes/${noteId}`, data),
  deleteNote: (leadId: string, noteId: string) =>
    api.delete(`/leads/${leadId}/notes/${noteId}`),
  getActivities: (leadId: string) => api.get(`/leads/${leadId}/activities`),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: (period?: string) => api.get('/dashboard/analytics', { params: { period } }),
};

// AI endpoints
export const aiApi = {
  summarizeLead: (data: unknown) => api.post('/ai/summarize', data),
  generateEmail: (data: unknown) => api.post('/ai/email', data),
  getInsights: () => api.get('/ai/insights'),
  chat: (message: string) => api.post('/ai/chat', { message }),
};

// Activities
export const activitiesApi = {
  getRecent: () => api.get('/activities/recent'),
};
