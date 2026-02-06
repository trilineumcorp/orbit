// Authentication service - Updated to use backend API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types';
import { apiService } from './api';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Register a new user
export const register = async (
  email: string,
  password: string,
  name: string,
  role: UserRole,
  additionalData?: { rollNumber?: string; class?: string }
): Promise<User> => {
  try {
    const response = await apiService.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(
      '/auth/register',
      {
        email,
        password,
        name,
        role,
        rollNumber: additionalData?.rollNumber,
        class: additionalData?.class,
      },
      false // Don't require auth for registration
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }

    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user data
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register. Please try again.');
  }
};

// Login
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await apiService.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(
      '/auth/login',
      {
        email,
        password,
      },
      false // Don't require auth for login
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user data
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Invalid email or password. Please try again.');
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      return null;
    }

    // Try to get user from API
    try {
      const response = await apiService.get<User>('/auth/me', true);
      if (response.success && response.data) {
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      // If API call fails, try to get from storage
      console.log('API call failed, trying storage...');
    }

    // Fallback to stored user data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      return null;
    }

    const user = JSON.parse(userData);
    // Convert date string back to Date object
    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return !!token;
};

// Update user data
export const updateUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Prepare update data (only send allowed fields)
    const updateData: any = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.phoneNumber !== undefined) updateData.phoneNumber = userData.phoneNumber;
    if (userData.profilePicture !== undefined) updateData.profilePicture = userData.profilePicture;
    if (userData.class !== undefined) updateData.class = userData.class;

    // Call backend API to update profile
    const response = await apiService.put<{ data: User; message: string }>(
      '/auth/me',
      updateData,
      true // Require authentication
    );

    if (response.success && response.data) {
      const updatedUser = response.data;
      // Update local storage with the updated user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      console.log('Profile updated successfully:', updatedUser);
      return updatedUser;
    } else {
      throw new Error(response.message || 'Failed to update profile');
    }
  } catch (error: any) {
    console.error('Update user error:', error);
    throw new Error(error.message || 'Failed to update user');
  }
};
