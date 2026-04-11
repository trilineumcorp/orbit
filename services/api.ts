// API service for backend communication
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For development, use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical devices, use your computer's IP address
const removeTrailingSlash = (url: string) => url.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return removeTrailingSlash(envUrl);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';
  }
  return 'http://localhost:3000/api';
};

/** Origin without /api — for fetch to /api/... from same helper or AI routes */
export const getApiOriginUrl = (): string => {
  const base = getApiBaseUrl();
  if (base.endsWith('/api')) {
    return base.slice(0, -4);
  }
  return base.replace(/\/api\/?$/, '');
};

const API_BASE_URL = getApiBaseUrl();
console.log('API_BASE_URL:', API_BASE_URL);
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data;
    try {
      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('Received HTML response instead of JSON.');
        console.error('Response preview:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Make sure the backend server is running on the correct port.');
      }
      
      if (!text || text.trim().length === 0) {
        data = {};
      } else {
        data = JSON.parse(text);
      }
    } catch (error: any) {
      console.error('Failed to parse response:', error);
      if (error.message && error.message.includes('HTML')) {
        throw error;
      }
      throw new Error('Invalid JSON response from server. Make sure the backend server is running on the correct port.');
    }

    if (!response.ok) {
      if (data.success === false || data.message) {
        return data as ApiResponse<T>;
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async get<T>(endpoint: string, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`API GET: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders(requireAuth),
      });

      console.log(`API Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
      
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error(`Network request failed for ${this.baseURL}${endpoint}. Please check backend is running and EXPO_PUBLIC_API_URL is correct.`);
      }
      if (error.message?.includes('HTML')) {
        throw new Error('Server returned HTML instead of JSON. Make sure the backend route is correct.');
      }
      throw new Error(error.message || 'Network error');
    }
  }

  async post<T>(
    endpoint: string,
    body: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`API POST: ${url}`);
      console.log('API POST Body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: await this.getHeaders(requireAuth),
        body: JSON.stringify(body),
      });

      console.log(`API Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error(`Network request failed for ${this.baseURL}${endpoint}. Please check backend is running and EXPO_PUBLIC_API_URL is correct.`);
      }
      throw new Error(error.message || 'Network error');
    }
  }

  async put<T>(
    endpoint: string,
    body: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`API PUT: ${url}`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: await this.getHeaders(requireAuth),
        body: JSON.stringify(body),
      });

      console.log(`API Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`PUT ${endpoint} error:`, error);
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network request failed. Please check if the server is running and accessible.');
      }
      throw new Error(error.message || 'Network error');
    }
  }

  async delete<T>(endpoint: string, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`API DELETE: ${url}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: await this.getHeaders(requireAuth),
      });

      console.log(`API Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`DELETE ${endpoint} error:`, error);
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network request failed. Please check if the server is running and accessible.');
      }
      throw new Error(error.message || 'Network error');
    }
  }
}

export const apiService = new ApiService();