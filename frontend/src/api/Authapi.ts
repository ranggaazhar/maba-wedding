import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    admin: Admin;
    token: string;
  };
}

export const authApi = {

  login: async (data: LoginData) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: Admin }>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put<{ success: boolean; message: string; data: Admin }>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get<{ success: boolean; message: string; data: { admin: Admin } }>('/auth/verify');
    return response.data;
  },
};

export default api;