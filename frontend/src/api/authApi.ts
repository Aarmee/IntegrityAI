import apiClient from './axios';
import { User, LoginResponse, RegisterRequest, UpdateProfileRequest } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (payload: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/api/auth/register', payload);
    return response.data;
  },

  updateProfile: async (userId: string, payload: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/api/users/${userId}`, payload);
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${userId}`);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users');
    return response.data;
  },
};
