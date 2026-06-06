import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
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

// Contacts
export const contactsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/contacts', { params }),
  getOne: (id: string) => api.get(`/contacts/${id}`),
  create: (data: unknown) => api.post('/contacts', data),
  update: (id: string, data: unknown) => api.patch(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

// Companies
export const companiesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/companies', { params }),
  getOne: (id: string) => api.get(`/companies/${id}`),
  create: (data: unknown) => api.post('/companies', data),
  update: (id: string, data: unknown) => api.patch(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

// Tasks
export const tasksApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (data: unknown) => api.post('/tasks', data),
  update: (id: string, data: unknown) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Email logs
export const emailsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/emails', { params }),
  getStats: () => api.get('/emails/stats'),
  log: (data: unknown) => api.post('/emails', data),
  delete: (id: string) => api.delete(`/emails/${id}`),
};
