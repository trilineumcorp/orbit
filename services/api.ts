// API service for backend communication
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For development, use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical devices, use your computer's IP address
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Platform-specific defaults
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // For physical Android device, you'll need to set EXPO_PUBLIC_API_URL with your computer's IP
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:3000/api';
  } else {
    // Web or other platforms
    return 'http://localhost:3000/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
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
      
      // Check if response is HTML (error page)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('Received HTML response instead of JSON.');
        console.error('Response preview:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Make sure the backend server is running on port 3000.');
      }
      
      // Check if response is empty
      if (!text || text.trim().length === 0) {
        data = {};
      } else {
        data = JSON.parse(text);
      }
    } catch (error: any) {
      console.error('Failed to parse response:', error);
      if (error.message && error.message.includes('HTML')) {
        throw error; // Re-throw HTML detection error
      }
      throw new Error('Invalid JSON response from server. Make sure the backend server is running on port 3000.');
    }

    // For validation errors (400) or other error responses, return the response data instead of throwing
    // This allows the frontend to handle errors gracefully
    if (!response.ok) {
      // If the response has a success field and it's false, return it
      // Otherwise throw an error
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
        throw new Error('Network request failed. Please check:\n1. Backend server is running on port 3000\n2. For Android emulator: using http://10.0.2.2:3000/api\n3. For iOS simulator: using http://localhost:3000/api\n4. For physical device: set EXPO_PUBLIC_API_URL with your computer IP address');
      }
      if (error.message?.includes('HTML')) {
        throw new Error('Server returned HTML instead of JSON. Make sure the backend server is running on port 3000.');
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: await this.getHeaders(requireAuth),
        body: JSON.stringify(body),
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network request failed. Please check if the server is running and accessible.');
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: await this.getHeaders(requireAuth),
        body: JSON.stringify(body),
      });

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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getHeaders(requireAuth),
      });

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

